import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

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
        contents: `${resume} check the resume given and generate a code for a modern looking portfolio dont include any comment at start or finish webpage dont use images that have broken url or dont randomly make rnadom urls  use theme use tailwind css from <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> and js keep all in single file without markdown...Use Font Awesome CDN for icons and Unsplash for the main images(avatar or any vector) so the links don't break . make sure to include sections like About Me, Skills, Projects, and Contact Information , mind that navbar works ok and also if user has a github or linkedin profile image get that image from their profile using their id and github or linkedin api if there and display that image in website it may happen that the resume may contain github user name with mention of github so if u are not able to understand if it is github username or linkedin or email then try it to get github profile pic if u get it then good else try another and so on else default splash pic https://unsplash.com/illustrations/a-drawing-of-a-man-wearing-a-tie-7EbR-jFH7cI  ....if u get github pf then remember the name and use it to make the link to github in website . Use appropriate HTML tags and structure the code for clarity. Provide only the code without any additional explanations or text.`,
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