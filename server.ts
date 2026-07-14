import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini client to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured in the workspace settings or secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Generate proposal using Gemini 3.5 Flash
app.post("/api/generate-proposal", async (req, res) => {
  try {
    const { clientName, proposalGoal, industry, additionalNotes } = req.body;

    if (!clientName || !proposalGoal) {
      res.status(400).json({ error: "clientName and proposalGoal are required parameters." });
      return;
    }

    const ai = getGeminiClient();
    
    const prompt = `You are a premium, highly professional proposal writer for Vinshare Proposal & Invoice Automation.
Generate a structured, elegant proposal for a client.
Client Name: ${clientName}
Client Industry: ${industry || "General"}
Project Goal: ${proposalGoal}
Additional Notes/Requirements: ${additionalNotes || "None"}

Please provide a highly professional, detailed, and trendy business proposal. Format the output precisely into:
1. An overall proposal title.
2. Distinct chapters/sections: "Executive Summary", "The Problem", "Proposed Solution", "Deliverables", "Timeline & Milestones".
3. An itemized pricing list appropriate for this type of project with realistic corporate pricing, description, quantities, and realistic prices.
4. Professional terms and conditions.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert corporate strategist and professional copywriter. Write highly persuasive, elegant business copy.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The main catching title of the proposal, e.g., 'Enterprise Digital Transformation Initiative'"
            },
            sections: {
              type: Type.ARRAY,
              description: "The narrative sections of the proposal",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Title of the section" },
                  content: { type: Type.STRING, description: "Detailed, well-written, professional narrative body (use paragraphs or bullet points)" }
                },
                required: ["title", "content"]
              }
            },
            items: {
              type: Type.ARRAY,
              description: "Itemized pricing line items",
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING, description: "Name/description of the phase or deliverable" },
                  quantity: { type: Type.INTEGER, description: "Quantity of units, days, or hours" },
                  price: { type: Type.NUMBER, description: "Unit price in USD" }
                },
                required: ["description", "quantity", "price"]
              }
            },
            terms: {
              type: Type.STRING,
              description: "Standard terms of payment, intellectual property, and timeline agreements"
            }
          },
          required: ["title", "sections", "items", "terms"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text content returned from Gemini model.");
    }

    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    
    let errorMessage = error.message || "An error occurred while generating the proposal with AI.";
    
    if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
       errorMessage = "The Gemini AI model is currently experiencing high demand. Please wait a moment and try again.";
    }

    res.status(500).json({ 
      error: errorMessage 
    });
  }
});

// API: Generate AI Insight for Proposal Risks
app.post("/api/generate-insights", async (req, res) => {
  try {
    const { title, sections, items } = req.body;
    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }

    const ai = getGeminiClient();
    
    const prompt = `You are a financial and business risk assessor.
Review the following proposal and summarize the key risks and negotiation opportunities in 2-3 short bullet points.

Proposal Title: ${title}
Sections: ${JSON.stringify(sections)}
Items: ${JSON.stringify(items)}

Provide only a JSON object with a single "insight" field containing your brief markdown bullet points.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert corporate risk assessor.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: {
              type: Type.STRING,
              description: "Markdown string with 2-3 brief bullet points detailing risks/opportunities"
            }
          },
          required: ["insight"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text content returned from Gemini model.");
    }

    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini Insight Error:", error);
    let errorMessage = error.message || "An error occurred while generating insights with AI.";
    
    if (errorMessage.includes("503") || errorMessage.includes("high demand") || errorMessage.includes("UNAVAILABLE")) {
       errorMessage = "The Gemini AI model is currently experiencing high demand. Please wait a moment and try again.";
    }

    res.status(500).json({ error: errorMessage });
  }
});

// Setup Vite Dev Middleware or Static File Serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start();
