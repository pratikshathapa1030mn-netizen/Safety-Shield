import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route for gear analysis
  app.post("/api/analyze-gear", async (req, res) => {
    try {
      const { image, gearItems } = req.body;

      if (!image || !gearItems) {
        return res.status(400).json({ error: "Missing image or gearItems" });
      }

      const prompt = `
        You are a highly critical industrial safety auditor. 
        Examine the provided image for specific Personal Protective Equipment (PPE).
        REQUIRED GEAR TO AUDIT:
        ${gearItems.map((item: any) => `- ${item.label} (ID: ${item.id})`).join('\n')}

        INSTRUCTIONS:
        1. Only mark an item as "detected" if it is ABSOLUTELY visible and correctly worn. 
        2. If you cannot see the item or if it is partially missing, mark it in the "missing" list.
        3. Be conservative. It is better to flag something as missing than to falsely claim compliance.
        4. Focus on the human figure in the image.
        5. If there is no person in the image, all items are "missing".
        6. Calculate a "riskPercentage" from 0 to 100 based on the missing items. 100% means extreme life-threatening risk.
        7. Provide "suggestions" as an array of strings telling the user specifically what to wear.

        Return a JSON object:
        {
          "detected": ["id1", "id2"],
          "missing": ["id3"],
          "description": "Short specific observation about the PPE compliance.",
          "riskPercentage": 85,
          "suggestions": ["Please put on your Welding Helmet immediately.", "Fasten your gloves correctly."]
        }
        Only return the JSON.
      `;

      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: image.split(',')[1] || image, // Handle data URL or raw base64
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detected: { type: Type.ARRAY, items: { type: Type.STRING } },
              missing: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
              riskPercentage: { type: Type.NUMBER },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["detected", "missing", "description", "riskPercentage", "suggestions"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      res.status(500).json({ error: "Failed to analyze image" });
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
