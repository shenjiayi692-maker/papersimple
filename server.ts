
import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Proxy for arXiv to bypass CORS
  app.get("/api/papers", async (req, res) => {
    const { category, query: customQuery, max_results = 2 } = req.query;
    
    let searchQuery = "";
    if (customQuery) {
      searchQuery = customQuery as string;
    } else if (category) {
      searchQuery = `cat:${category}`;
    } else {
      return res.status(400).json({ error: "Category or query is required" });
    }

    const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(searchQuery)}&start=0&max_results=${max_results}&sortBy=submittedDate&sortOrder=descending`;

    try {
      const response = await fetch(url);
      const text = await response.text();
      res.set("Content-Type", "text/xml");
      res.send(text);
    } catch (error) {
      console.error("Error fetching from arXiv:", error);
      res.status(500).json({ error: "Failed to fetch from arXiv" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
