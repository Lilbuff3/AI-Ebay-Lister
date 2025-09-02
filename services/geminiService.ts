import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as base64 string"));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const base64EncodedData = await base64EncodedDataPromise;

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

const ebayPrompt = `You are an expert eBay lister. Your task is to analyze the provided image(s) of a product. Your primary tool is Google Search; you MUST use it to find the most up-to-date and relevant information to generate an accurate eBay listing. This includes finding exact model numbers, technical specifications, and current market prices.

The generated description is the most important part and must adhere to the following strict rules:
1.  **Factual and Direct**: Avoid sales-like language, marketing fluff, or persuasive tones. Stick to the facts discovered through search and visual analysis.
2.  **Mobile-First Formatting**: This is critical for user experience.
    *   **Short Paragraphs**: Keep paragraphs to a maximum of 1-3 sentences.
    *   **Bulleted Lists**: Use bullet points (using '*') for key features, specifications, contents, or condition details. This makes the information scannable.
    *   **Clear Spacing**: Ensure there is a blank line between paragraphs and before the final closing sentences.
3.  **Mandatory Ending**: The description MUST conclude with the following two sentences, each on its own new line, with no other text after them:
"I ship super fast and super safe"
"Don't hesitate to message me with any questions or offers!"

Additionally, generate a shipping recommendation based on the product's typical size and weight.

CRITICAL: You MUST return your response as a single, valid JSON object enclosed in a \`\`\`json ... \`\`\` block. Do not include any text outside of this block. The JSON object must conform to this structure:
{
  "title": "An SEO-optimized, keyword-dense title under 80 characters. Your goal is to include as many relevant search terms as possible without sacrificing readability. Prioritize: Brand, Model Number, Key Specifications (e.g., size, capacity), Part Number, Condition (if not 'New'), and any other critical identifiers a buyer would search for. Use your search findings to pack the title with high-value keywords.",
  "category_suggestion": "The most likely eBay category path.",
  "condition": "Choose 'New', 'Used', or 'For parts or not working' based on the images.",
  "description": "A factual description formatted for mobile readability with short paragraphs, bullet points, and the mandatory two-line ending.",
  "item_specifics": [ { "name": "string", "value": "string" } ], // Generate key-value pairs. For each specific's 'name', use a standard, widely-searched term (e.g., 'Compatible Model' is better than 'For Model'). CRITICAL: Avoid redundancy. If a fact (like brand or model) is already clear in the title, do not repeat it as a specific. Focus on providing *additional* details that a buyer would need.
  "price_recommendation": { "price": number, "justification": "CRUCIAL: Provide a detailed justification for the price. You MUST cite specific examples of comparable sold items (e.g., 'Sold for $XX on [site]') or specific market trends discovered during your search. General statements are not sufficient." },
  "shipping_recommendation": { "est_weight": "string", "est_dimensions": "string", "rec_service": "string" }
}
`;

interface GroundingSource {
    uri: string;
    title: string;
}

export const generateDescriptionFromImages = async (files: File[]): Promise<{ jsonString: string, sources: GroundingSource[] }> => {
  if (files.length === 0) {
    throw new Error("No files provided");
  }

  const imageParts: Part[] = await Promise.all(
    files.map(fileToGenerativePart)
  );

  const promptParts: Part[] = [
    { text: ebayPrompt },
    ...imageParts,
  ];

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: promptParts }],
    config: {
        tools: [{googleSearch: {}}],
    },
  });
  
  const jsonString = response.text;
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sources = groundingChunks
    .map(chunk => chunk.web)
    .filter((web): web is { uri: string; title: string } => !!web && !!web.uri && !!web.title);

  return { jsonString, sources };
};