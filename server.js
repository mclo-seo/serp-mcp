import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const PORT = 3000;

app.get("/serp", async (req, res) => {
  const { keyword } = req.query;

  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        q: keyword,
        engine: "google",
        gl: "us",
        hl: "en",
        api_key: process.env.SERPAPI_KEY
      }
    });

    const data = response.data;

    res.json({
      ai_overview: data.ai_overview || null,
      people_also_ask: data.related_questions || [],
      organic_results: data.organic_results || [],
      serp_features: data.search_information || {}
    });

  } catch (error) {
    res.status(500).json({ error: "SERP request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`SERP MCP server running on port ${PORT}`);
});