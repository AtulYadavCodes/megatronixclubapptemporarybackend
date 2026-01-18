import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey:'AIzaSyCYALi2qWycEC91YtkUiqZajQrnQ2vQU4M'});

export async function main(resume) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:`${resume} check the resume given and generate a code for a modern looking portfolio dont include any comment at start or finish webpage dont use images that have broken url or dont randomly make rnadom urls  use theme use tailwind css from <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> and js keep all in single file without markdown...Use Font Awesome CDN for icons and Unsplash for the main images(avatar or any vector) so the links don't break . make sure to include sections like About Me, Skills, Projects, and Contact Information , mind that navbar works ok and also if user has a github or linkedin profile image get that image from their profile using their id and github or linkedin api if there and display that image in website it may happen that the resume may contain github user name with mention of github so if u are not able to understand if it is github username or linkedin or email then try it to get github profile pic if u get it then good else try another and so on else default splash pic https://unsplash.com/illustrations/a-drawing-of-a-man-wearing-a-tie-7EbR-jFH7cI  ....if u get github pf then remember the name and use it to make the link to github in website . Use appropriate HTML tags and structure the code for clarity. Provide only the code without any additional explanations or text.`,
  });
  return response.text;
}