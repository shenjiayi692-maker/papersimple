import { Language } from '../types';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface PaperMetadata {
  id: string;
  title: string;
  desc: { en: string; zh: string };
  date: string;
  tag: { en: string; zh: string };
  authors: string[];
  sourceUrl: string;
}

const CATEGORIES = {
  ai: 'cs.AI',
  biology: 'q-bio.BM OR cat:q-bio.CB OR cat:q-bio.GN OR cat:q-bio.MN OR cat:q-bio.OT OR cat:q-bio.PE OR cat:q-bio.QM OR cat:q-bio.SC OR cat:q-bio.TO OR cat:physics.bio-ph',
  chemistry: 'physics.chem-ph',
  material: 'cond-mat.mtrl-sci'
};

const TAGS = {
  ai: { en: 'Artificial Intelligence', zh: '人工智能' },
  biology: { en: 'Biological Sciences', zh: '生物科学' },
  chemistry: { en: 'Chemical Physics', zh: '化学物理' },
  material: { en: 'Materials Science', zh: '材料科学' }
};

const TRANSLATION_CACHE_KEY = 'paper_simple_translations';

function getCache(): Record<string, string> {
  try {
    const cached = localStorage.getItem(TRANSLATION_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

function setCache(key: string, value: string) {
  try {
    const cache = getCache();
    cache[key] = value;
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("Failed to update translation cache:", e);
  }
}

let globalRateLimitCoolDownUntil = 0;

async function translateSummaries(texts: string[]): Promise<string[]> {
  const now = Date.now();
  if (now < globalRateLimitCoolDownUntil) {
    console.warn("Global rate limit cool-down active. Skipping translation.");
    return texts.map(t => t.substring(0, 150) + "...");
  }

  const cache = getCache();
  const results: string[] = new Array(texts.length).fill("");
  const toTranslateIndices: number[] = [];
  const toTranslateTexts: string[] = [];

  texts.forEach((text, i) => {
    const cacheKey = text.substring(0, 100);
    if (cache[cacheKey]) {
      results[i] = cache[cacheKey];
    } else {
      toTranslateIndices.push(i);
      toTranslateTexts.push(text);
    }
  });

  if (toTranslateTexts.length === 0) return results;

  const maxRetries = 1; // Reduced from 2 to be less aggressive
  let retryCount = 0;

  const attemptTranslation = async (): Promise<boolean> => {
    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following ${toTranslateTexts.length} scientific abstracts into professional, native-sounding Chinese. 
        Return ONLY a JSON array of strings. Concise (under 50 words).
        
        Abstracts:
        ${toTranslateTexts.map((t, i) => `[${i}]: ${t}`).join('\n\n')}`
      });

      const responseText = result.text || "[]";
      const jsonMatch = responseText.match(/\[.*\]/s);
      const translatedArray = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

      if (Array.isArray(translatedArray)) {
        translatedArray.forEach((translated, i) => {
          const originalIndex = toTranslateIndices[i];
          results[originalIndex] = translated;
          setCache(toTranslateTexts[i].substring(0, 100), translated);
        });
        return true;
      }
      return false;
    } catch (error: any) {
      if (error.message?.includes('429') || error.status === 429) {
        // Set a global cool down for 10 minutes if we hit a 429
        globalRateLimitCoolDownUntil = Date.now() + 10 * 60 * 1000;
        console.error("429 Quota Exceeded. Entering 10-minute global cool-down.");
        
        if (retryCount < maxRetries) {
          retryCount++;
          const waitTime = 5000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return await attemptTranslation();
        }
      }
      console.error("Batch translation error:", error);
      return false;
    }
  };

  await attemptTranslation();

  // Fallback for any that failed
  toTranslateIndices.forEach((index) => {
    if (!results[index]) results[index] = texts[index].substring(0, 150) + "...";
  });

  return results;
}

export async function fetchLatestPapers(sector: keyof typeof CATEGORIES): Promise<PaperMetadata[]> {
  const category = CATEGORIES[sector];
  
  const fetchFromSource = async (source: string): Promise<any[]> => {
    // Specifically search for journals or papers mentioning Nature/Science in all fields
    // Adding parentheses to handle complex OR categories
    const query = `(cat:${category}) AND all:${source}`;
    const url = `/api/papers?query=${encodeURIComponent(query)}&max_results=5`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) return [];
      const text = await response.text();
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, "text/xml");
      const entries = xmlDoc.getElementsByTagName("entry");
      
      const papers: any[] = [];
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const title = entry.getElementsByTagName("title")[0]?.textContent?.replace(/\n/g, ' ').trim() || 'Untitled';
        const summary = entry.getElementsByTagName("summary")[0]?.textContent?.replace(/\n/g, ' ').trim() || '';
        const published = entry.getElementsByTagName("published")[0]?.textContent || '';
        const id = entry.getElementsByTagName("id")[0]?.textContent || Math.random().toString();
        
        const links = entry.getElementsByTagName("link");
        let sourceUrl = id;
        for (let l = 0; l < links.length; l++) {
          const rel = links[l].getAttribute("rel");
          const type = links[l].getAttribute("type");
          if (rel === "alternate" || type === "text/html") {
            sourceUrl = links[l].getAttribute("href") || sourceUrl;
            break;
          }
        }

        const authorNodes = entry.getElementsByTagName("author");
        const authors: string[] = [];
        for (let j = 0; j < authorNodes.length; j++) {
          authors.push(authorNodes[j].getElementsByTagName("name")[0]?.textContent || '');
        }

        const dateObj = new Date(published);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        papers.push({ id, title, summary, dateStr, authors, sourceUrl, publishedTime: dateObj.getTime() });
      }
      return papers;
    } catch (e) {
      console.error(`Error fetching ${source} for ${sector}:`, e);
      return [];
    }
  };

  try {
    const [natureResults, scienceResults] = await Promise.all([
      fetchFromSource('Nature'),
      fetchFromSource('Science')
    ]);

    // De-duplicate and merge results
    const paperMap = new Map();
    [...(natureResults || []), ...(scienceResults || [])].forEach(p => {
      if (p && p.id) paperMap.set(p.id, p);
    });

    let rawPapers = Array.from(paperMap.values());
    
    // Fallback if no Nature/Science were found specifically matching the complex category
    if (rawPapers.length < 2) {
      // Broad fallback for bio if needed
      const broadBioQuery = sector === 'biology' ? 'all:biology AND (all:Nature OR all:Science)' : `cat:${category}`;
      const fallbackUrl = `/api/papers?query=${encodeURIComponent(broadBioQuery)}&max_results=5`;
      
      try {
        const fallbackResp = await fetch(fallbackUrl);
        const fallbackText = await fallbackResp.text();
        const parser = new DOMParser();
        const fallbackDoc = parser.parseFromString(fallbackText, "text/xml");
        const fallbackEntries = fallbackDoc.getElementsByTagName("entry");
        
        for (let i = 0; i < fallbackEntries.length; i++) {
          const entry = fallbackEntries[i];
          const id = entry.getElementsByTagName("id")[0]?.textContent || '';
          if (paperMap.has(id)) continue;

          const title = entry.getElementsByTagName("title")[0]?.textContent?.replace(/\n/g, ' ').trim() || 'Untitled';
          const summary = entry.getElementsByTagName("summary")[0]?.textContent?.replace(/\n/g, ' ').trim() || '';
          const published = entry.getElementsByTagName("published")[0]?.textContent || '';
          
          const links = entry.getElementsByTagName("link");
          let sourceUrl = id;
          for (let l = 0; l < links.length; l++) {
            if (links[l].getAttribute("rel") === "alternate" || links[l].getAttribute("type") === "text/html") {
              sourceUrl = links[l].getAttribute("href") || sourceUrl; break;
            }
          }

          const authorNodes = entry.getElementsByTagName("author");
          const authors: string[] = [];
          for (let j = 0; j < authorNodes.length; j++) authors.push(authorNodes[j].getElementsByTagName("name")[0]?.textContent || '');
          const dateObj = new Date(published);
          const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          rawPapers.push({ id, title, summary, dateStr, authors, sourceUrl, publishedTime: dateObj.getTime() });
        }
      } catch (e) {
        console.error("Fallback fetch failed", e);
      }
    }

    // Sort all papers by publication time descending to ensure "up to date"
    rawPapers.sort((a, b) => b.publishedTime - a.publishedTime);

    const summariesToTranslate = rawPapers.map(p => p.summary);
    const translatedSummaries = await translateSummaries(summariesToTranslate);
    
    return rawPapers.map((raw, i) => ({
      id: raw.id,
      title: raw.title,
      desc: { 
        en: raw.summary.length > 200 ? raw.summary.substring(0, 200) + '...' : raw.summary,
        zh: (translatedSummaries && translatedSummaries[i]) || raw.summary.substring(0, 150) + "..."
      },
      date: raw.dateStr,
      tag: TAGS[sector],
      authors: raw.authors,
      sourceUrl: raw.sourceUrl
    }));
  } catch (error) {
    console.error(`Failed to fetch papers for ${sector}:`, error);
    return [];
  }
}
