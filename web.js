import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const data=`You are an expert front-end engineer and UI designer.
Your task is to analyze the provided resume and generate a complete, modern, responsive personal portfolio website as code.

STRICT OUTPUT RULES

Output ONLY raw code.

No explanations, no markdown, no comments at the start or end of the file.

Everything must be in one single HTML file.

Use HTML, Tailwind CSS (browser CDN), and vanilla JavaScript only.

Do not invent or use broken or random URLs.

TECH STACK REQUIREMENTS

Tailwind CSS ONLY via:
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

Icons: Font Awesome CDN

Images: Unsplash only (avatar, hero, or vector illustrations)

JavaScript must be embedded in the same file

No external CSS or JS files

DESIGN & UX REQUIREMENTS

Clean, modern, professional developer portfolio theme

Responsive for mobile, tablet, and desktop

Smooth scrolling navigation

Sticky navbar with working section links

Subtle animations and hover effects using Tailwind utilities

Accessible color contrast and readable typography

MANDATORY SECTIONS

Navbar (working links)

Hero / Intro

About Me

Skills (from resume)

Projects (from resume or inferred professionally)

Contact Information (email, GitHub, LinkedIn if available)

Footer

RESUME INTELLIGENCE RULES

Extract name, role, summary, skills, projects, experience, links from the resume

If a GitHub username is found, attempt to load profile image from:
https://github.com/USERNAME.png

If GitHub image loads successfully:

Use it as avatar

Store the username

Link GitHub icon to https://github.com/USERNAME

If GitHub fails, try LinkedIn profile image if a LinkedIn ID exists

If all fail, use this default Unsplash illustration ONLY:
https://images.unsplash.com/illustrations/a-drawing-of-a-man-wearing-a-tie-7EbR-jFH7cI

Do NOT guess usernames

Do NOT create fake social links

If unsure whether a string is GitHub, LinkedIn, or email:

Try GitHub first

Then LinkedIn

Then fallback image

IMAGE RULES

All images must be from Unsplash with valid URLs

Do not generate random image URLs

Use images tastefully (hero background, avatar, project cards)

CODE QUALITY RULES

Use semantic HTML tags

Clean structure and readable indentation

No placeholder lorem text unless absolutely required

All navigation links must work correctly

JavaScript must handle avatar image fallback logic cleanly

FINAL OUTPUT

Return only the full HTML code

No explanations

No markdown

No comments at the beginning or end

Ready to open directly in a browser`


const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

// Helper function to wait for a specified duration
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function main(resume, retries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `${resume} `
      });
      return response.text;
    } catch (error) {
      lastError = error;
      
      // Check if it's a quota exceeded error (429)
      if (error.status === 429) {
        // Try to extract retry delay from error
        let retryDelay = initialDelay * Math.pow(2, attempt); // Exponential backoff
        
        // Check if the error message contains a specific retry time
        const retryMatch = error.message?.match(/retry in ([\d.]+)s/);
        if (retryMatch) {
          retryDelay = Math.ceil(parseFloat(retryMatch[1]) * 1000);
        }
        
        if (attempt < retries - 1) {
          console.log(`Quota exceeded. Retrying in ${retryDelay / 1000} seconds... (Attempt ${attempt + 1}/${retries})`);
          await sleep(retryDelay);
          continue;
        }
        
        // If all retries exhausted, throw a more informative error
        throw new Error(
          `Gemini API quota exceeded. Please wait and try again later, or upgrade your plan at https://ai.google.dev/pricing. ` +
          `Original error: ${error.message}`
        );
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}