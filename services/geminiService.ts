import { GoogleGenAI, Type } from "@google/genai";
import { ArticleData, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateArticleData = async (text: string, language: Language = 'en'): Promise<ArticleData> => {
  // Truncate text to ~15k words (approx 60k chars) to ensure fast processing and avoid timeouts
  // while still capturing the core of most research papers.
  const truncatedText = text.length > 60000 ? text.slice(0, 60000) + "..." : text;

  // Create a promise that rejects after 50 seconds
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("AI generation timed out. The article might be too complex or the service is busy.")), 50000);
  });

  const languageName = language === 'zh' ? 'Chinese' : 'English';

  const generatePromise = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this research article and generate a structured JSON for an interactive narrative website.
    
    CRITICAL: The entire response MUST be in ${languageName}. All titles, subtitles, content, labels, and descriptions must be in ${languageName}.
    
    FOCUS ON:
    - A compelling, CONCISE title (max 8 words) and subtitle.
    - A clear introduction.
    - 3-5 key sections (Methodology, Results, etc.).
    - Identifying potential visualizations (diagramType: surface-code, transformer, metrics, generic-chart, generic-flow).
    - For each section, suggest a relevant placeholder image URL (using https://picsum.photos/seed/{keyword}/800/600). 
    - CRITICAL: Use keywords that match a sophisticated, minimalist research theme (e.g., 'quantum-computing', 'abstract-technology', 'minimalist-science', 'data-visualization', 'physics-experiment', 'neural-architecture'). Avoid generic or unrelated keywords.
    - List up to 4 key authors. For each author, provide their name, their role/title, their institution or university, and a Google Scholar search URL (e.g., https://scholar.google.com/scholar?q=Author+Name).
    
    Article Text:
    ${truncatedText}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          heroDescription: { type: Type.STRING },
          introduction: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["title", "content"]
          },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                type: { 
                  type: Type.STRING,
                  enum: ["text", "diagram", "methodology", "results", "conclusion"]
                },
                diagramType: {
                  type: Type.STRING,
                  enum: ["surface-code", "transformer", "metrics", "generic-chart", "generic-flow"]
                },
                visualizationData: { type: Type.OBJECT },
                imageUrl: { type: Type.STRING },
                imageCaption: { type: Type.STRING }
              },
              required: ["id", "title", "content", "type"]
            }
          },
          authors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                institution: { type: Type.STRING },
                scholarUrl: { type: Type.STRING }
              },
              required: ["name", "role", "institution", "scholarUrl"]
            }
          },
          date: { type: Type.STRING },
          sidebarSections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING }
              },
              required: ["id", "label"]
            }
          }
        },
        required: ["title", "subtitle", "heroDescription", "introduction", "sections", "authors", "date", "sidebarSections"]
      }
    }
  });

  const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

  const data = JSON.parse(response.text || "{}");
  return {
    ...data,
    id: Math.random().toString(36).substring(7)
  };
};

export const generateArticleFromSummary = async (title: string, summary: string, language: Language = 'en'): Promise<ArticleData> => {
  const languageName = language === 'zh' ? 'Chinese' : 'English';

  const generatePromise = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a science communicator. Based on the following research paper title and summary, generate a full, structured JSON for an interactive narrative website.
    
    Paper Title: ${title}
    Summary: ${summary}
    
    CRITICAL: The entire response MUST be in ${languageName}. All titles, subtitles, content, labels, and descriptions must be in ${languageName}.
    
    FOCUS ON:
    - Expanding the summary into a compelling narrative with 3-4 sections.
    - Inventing plausible details for Methodology and Results based on the topic if not fully provided.
    - Identifying potential visualizations (diagramType: surface-code, transformer, metrics, generic-chart, generic-flow).
    - For each section, suggest a relevant placeholder image URL (using https://picsum.photos/seed/{keyword}/800/600).
    - List 2-3 key authors with plausible roles and institutions.
    
    Output the JSON following the schema.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          heroDescription: { type: Type.STRING },
          introduction: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["title", "content"]
          },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                type: { 
                  type: Type.STRING,
                  enum: ["text", "diagram", "methodology", "results", "conclusion"]
                },
                diagramType: {
                  type: Type.STRING,
                  enum: ["surface-code", "transformer", "metrics", "generic-chart", "generic-flow"]
                },
                visualizationData: { type: Type.OBJECT },
                imageUrl: { type: Type.STRING },
                imageCaption: { type: Type.STRING }
              },
              required: ["id", "title", "content", "type"]
            }
          },
          authors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                institution: { type: Type.STRING },
                scholarUrl: { type: Type.STRING }
              },
              required: ["name", "role", "institution", "scholarUrl"]
            }
          },
          date: { type: Type.STRING },
          sidebarSections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING }
              },
              required: ["id", "label"]
            }
          }
        },
        required: ["title", "subtitle", "heroDescription", "introduction", "sections", "authors", "date", "sidebarSections"]
      }
    }
  });

  const response = await generatePromise;
  const data = JSON.parse(response.text || "{}");
  return {
    ...data,
    id: Math.random().toString(36).substring(7)
  };
};
