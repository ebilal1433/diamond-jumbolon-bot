import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.CLAUDE_API_KEY;

const SYSTEM_PROMPT = `
You are a sales assistant for Diamond Jumbolon, an insulation brand in Pakistan.

Your job:
- Answer clearly and briefly
- Share prices and sizes confidently
- Help the customer choose the right thickness
- Encourage the customer to place an order on WhatsApp

Rules:
- Keep replies short and friendly
- Use plain text only
- Do not use markdown, headings, asterisks, or bullet points
- If asked about price, always include the exact rate
- Mention delivery is available across Pakistan
- End with a helpful sales question when appropriate

Prices:
1 inch = Rs. 120 per sq ft
2 inch = Rs. 180 per sq ft
Custom thickness available on request

Delivery:
Available all over Pakistan

Tone:
Helpful, sales-focused, professional, simple English
`;

app.get("/", (req, res) => {
  res.send("Diamond Jumbolon bot is live");
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body?.message;

    console.log("BODY RECEIVED:", req.body);

    if (!userMessage) {
      return res.status(400).json({
        reply: "Please send your question about price, size, or delivery."
      });
    }

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: userMessage
          }
        ]
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        timeout: 30000
      }
    );

    const replyText =
      response.data?.content?.[0]?.text ||
      "Please WhatsApp us for pricing and order support.";

    return res.json({
      reply: replyText
    });
  } catch (error) {
    console.error("CHAT ERROR:");
    console.error(error.response?.status || error.message);
    console.error(JSON.stringify(error.response?.data, null, 2) || error.message);

    return res.status(500).json({
      reply: "Sorry, I am having trouble right now. Please WhatsApp us for quick help."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Bot running"));