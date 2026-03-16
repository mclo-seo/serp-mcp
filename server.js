require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("SERP MCP server running");
});

app.get("/serp", async (req, res) => {
  try {

    const keyword = req.query.keyword;

    if (!keyword) {
      return res.status(400).json({ error: "keyword parameter required" });
    }

    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google",
        q: keyword,
        google_domain: "google.com",
        gl: "us",
        hl: "en",
        api_key: process.env.SERPAPI_KEY
      }
    });

const data = response.data || {};

/* Detect AI Overview in multiple possible locations */

const aiOverview =
  data.ai_overview ||
  data.inline_ai_overview ||
  data.ai_overview_results ||
  data.knowledge_graph?.ai_overview ||
  null;

const paa = data.people_also_ask || [];
const organic = data.organic_results || [];
    const aiSummary =
  aiOverview?.text_blocks?.map(b => b.snippet).filter(Boolean).slice(0,5) ||
  aiOverview?.snippet ? [aiOverview.snippet] :
  [];

    const aiSources =
      aiOverview.references?.map(r => ({
        title: r.title,
        link: r.link
      })) || [];

    res.json({
      keyword,
      ai_overview_present: !!aiOverview,
      ai_overview_summary: aiSummary,
      ai_overview_sources: aiSources,
      people_also_ask: paa.map(q => q.question),
      top_ranking_pages: organic.slice(0,5).map(r => ({
        title: r.title,
        link: r.link
      }))
    });

  } catch (error) {

    console.error("SERP ERROR:", error.message);

    res.status(500).json({
      error: "SERP request failed",
      message: error.message
    });

  }
});

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});