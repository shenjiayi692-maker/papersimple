import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const { category, query: customQuery, max_results = "2" } = req.query;
  const searchQuery = customQuery
    ? (customQuery as string)
    : category
    ? `cat:${category}`
    : null;
  if (!searchQuery)
    return res.status(400).json({ error: "Category or query is required" });

  const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(searchQuery)}&start=0&max_results=${max_results}&sortBy=submittedDate&sortOrder=descending`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    res.setHeader("Content-Type", "text/xml");
    res.send(text);
  } catch {
    res.status(500).json({ error: "Failed to fetch from arXiv" });
  }
}
