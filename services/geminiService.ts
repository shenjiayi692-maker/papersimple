import { ArticleData, Language } from "../types";

// Gemini generation is now proxied through the server to keep API keys secure on the backend.
export const generateArticleData = async (text: string, language: Language = 'en'): Promise<ArticleData> => {
  const truncatedText = text.length > 60000 ? text.slice(0, 60000) + "..." : text;
  const languageName = language === 'zh' ? 'Chinese' : 'English';

  const prompt = `Analyze this research article and generate a structured JSON for an interactive narrative website.
    
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
    `;

  const schema = {
    type: "object",
    properties: {
      title: { type: "string" },
      subtitle: { type: "string" },
      heroDescription: { type: "string" },
      introduction: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" }
        },
        required: ["title", "content"]
      },
      sections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            content: { type: "string" },
            type: { 
              type: "string",
              enum: ["text", "diagram", "methodology", "results", "conclusion"]
            },
            diagramType: {
              type: "string",
              enum: ["surface-code", "transformer", "metrics", "generic-chart", "generic-flow"]
            },
            visualizationData: { type: "object" },
            imageUrl: { type: "string" },
            imageCaption: { type: "string" }
          },
          required: ["id", "title", "content", "type"]
        }
      },
      authors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            role: { type: "string" },
            institution: { type: "string" },
            scholarUrl: { type: "string" }
          },
          required: ["name", "role", "institution", "scholarUrl"]
        }
      },
      date: { type: "string" },
      sidebarSections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            label: { type: "string" }
          },
          required: ["id", "label"]
        }
      }
    },
    required: ["title", "subtitle", "heroDescription", "introduction", "sections", "authors", "date", "sidebarSections"]
  };

  try {
    const response = await fetch("/api/gemini/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, schema })
    });

    if (!response.ok) throw new Error("Backend generation failed");
    const result = await response.json();
    const data = JSON.parse(result.text || "{}");
    return {
      ...data,
      id: Math.random().toString(36).substring(7)
    };
  } catch (e) {
    console.error("Narrative generation failed", e);
    throw e;
  }
};

export const generateArticleFromSummary = async (title: string, summary: string, language: Language = 'en'): Promise<ArticleData> => {
  const languageName = language === 'zh' ? 'Chinese' : 'English';

  const prompt = `You are a science communicator. Based on the following research paper title and summary, generate a full, structured JSON for an interactive narrative website.
    
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
    `;

  const schema = {
    type: "object",
    properties: {
      title: { type: "string" },
      subtitle: { type: "string" },
      heroDescription: { type: "string" },
      introduction: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" }
        },
        required: ["title", "content"]
      },
      sections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            content: { type: "string" },
            type: { 
              type: "string",
              enum: ["text", "diagram", "methodology", "results", "conclusion"]
            },
            diagramType: {
              type: "string",
              enum: ["surface-code", "transformer", "metrics", "generic-chart", "generic-flow"]
            },
            visualizationData: { type: "object" },
            imageUrl: { type: "string" },
            imageCaption: { type: "string" }
          },
          required: ["id", "title", "content", "type"]
        }
      },
      authors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            role: { type: "string" },
            institution: { type: "string" },
            scholarUrl: { type: "string" }
          },
          required: ["name", "role", "institution", "scholarUrl"]
        }
      },
      date: { type: "string" },
      sidebarSections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            label: { type: "string" }
          },
          required: ["id", "label"]
        }
      }
    },
    required: ["title", "subtitle", "heroDescription", "introduction", "sections", "authors", "date", "sidebarSections"]
  };

  try {
    const response = await fetch("/api/gemini/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, schema })
    });

    if (!response.ok) throw new Error("Backend summary-to-narrative failed");
    const result = await response.json();
    const data = JSON.parse(result.text || "{}");
    return {
      ...data,
      id: Math.random().toString(36).substring(7)
    };
  } catch (e) {
    console.error("Summary to narrative generation failed", e);
    throw e;
  }
};
