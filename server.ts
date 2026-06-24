import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set payload limits high to support image uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API endpoint for tutor
  app.post("/api/tutor", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not set. Please add it via the Settings > Secrets panel in AI Studio.",
        });
      }

      const { history, userMessage, image } = req.body;

      // Initialize GoogleGenAI inside route to be safe and load API key dynamically
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Construct content list for Gemini
      const contents: any[] = [];

      // Add previous history as user/model content turns
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role,
            parts: [{ text: msg.text }]
          });
        }
      }

      // Prepare the latest user input
      const latestParts: any[] = [];
      if (image) {
        // Strip data:image/...;base64, prefix if present
        const base64Data = image.split(",")[1] || image;
        // Determine mime type
        const mimeMatch = image.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

        latestParts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      }

      if (userMessage) {
        latestParts.push({ text: userMessage });
      } else if (image && !userMessage) {
        latestParts.push({ text: "Here is the math problem I want us to solve. Let's start step-by-step!" });
      }

      contents.push({
        role: "user",
        parts: latestParts
      });

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          thoughtProcess: {
            type: Type.STRING,
            description: "Tutor's internal thought process about the student's progress and the concept to explain."
          },
          currentStepNumber: {
            type: Type.INTEGER,
            description: "The 1-based index of the current step we are on."
          },
          totalStepsEstimate: {
            type: Type.INTEGER,
            description: "An estimate of the total steps needed to solve this entire problem."
          },
          problemTitle: {
            type: Type.STRING,
            description: "A friendly name/title of the math problem (e.g. 'Finding the Derivative of sin(x)*cos(x)')."
          },
          stepTitle: {
            type: Type.STRING,
            description: "A brief, clear title for the current step we are explaining."
          },
          explanation: {
            type: Type.STRING,
            description: "The patient, compassionate Socratic explanation of this step. Keep it warm and friendly."
          },
          mathFormula: {
            type: Type.STRING,
            description: "The mathematical formula, equation, or simplification corresponding to this step."
          },
          socraticQuestion: {
            type: Type.STRING,
            description: "A gentle leading question to prompt the student to think about the next step."
          },
          suggestedReplies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 3 pre-written student replies tailored to this context."
          }
        },
        required: [
          "thoughtProcess",
          "currentStepNumber",
          "totalStepsEstimate",
          "problemTitle",
          "stepTitle",
          "explanation",
          "mathFormula",
          "socraticQuestion",
          "suggestedReplies"
        ]
      };

      const systemInstruction = `You are "Socrates", a warm, compassionate, and highly patient Socratic AI Math Tutor.
Your mission is to guide the student through complex algebraic, calculus, geometrical, or general math problems STEP-BY-STEP.

CRITICAL INSTRUCTIONS:
1. NEVER output the final answer or the complete solution at once. This is extremely important! If you give the whole answer, the student loses the learning opportunity.
2. Only present ONE SINGLE STEP at a time. Explain that step with deep clarity, empathy, and simplicity.
3. Keep your explanations focused and bite-sized. Use standard formatting to make formulas clean and readable.
4. Conclude the step explanation with a gentle Socratic question that encourages the student to figure out what comes next, check their arithmetic, or explain why we did what we did.
5. Provide exactly 3 highly relevant suggestedReplies:
   - Reply 1: Ask "Why did we do that?" or ask for an explanation of the specific mathematical concept/rule applied.
   - Reply 2: Take a guess or perform the calculation for the next logical step (e.g. "Should we divide both sides by 2?").
   - Reply 3: Ask to break the current step down further or express confusion (e.g. "I'm a bit stuck here. Can you break this down more?").
6. Track progress carefully. Set currentStepNumber and totalStepsEstimate. Each turn should increment the step only when the student shows understanding of the current step.

When an image is provided:
- Analyze it using your vision capabilities.
- Identify the math problem in the image.
- Acknowledge what problem was found (set as problemTitle).
- Present ONLY Step 1 of the solution. Do not jump ahead!

Response Format:
You must output a JSON object adhering strictly to the responseSchema.`;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH
          }
        }
      });

      const responseText = geminiResponse.text;
      if (!responseText) {
        throw new Error("No response from Gemini.");
      }

      const parsedResponse = JSON.parse(responseText.trim());
      res.json(parsedResponse);
    } catch (error: any) {
      console.error("Error in /api/tutor:", error);
      res.status(500).json({
        error: error.message || "An unexpected error occurred while communicating with Gemini."
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
