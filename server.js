require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/serp", async (req, res) => {
  try {
    const keyword = req.query.keyword;

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

    const data = response.data;

    const aiOverview = data.ai_overview || null;
    const paa = data.people_also_ask || [];
    const organic = (data.organic_results || []).slice(0, 5);

    res.json({
      keyword,
      ai_overview_present: !!aiOverview,
      ai_overview_summary: aiOverview?.text_blocks?.map(b => b.snippet).filter(Boolean) || [],
      ai_overview_sources: aiOverview?.references?.map(r => ({
        title: r.title,
        link: r.link
      })) || [],
      people_also_ask: paa.map(q => q.question),
      top_ranking_pages: organic.map(r => ({
        title: r.title,
        link: r.link
      }))
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "SERP request failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});