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
You are a sales assistant for Diamond Jumbolon in Pakistan.

WhatsApp: +92XXXXXXXXXX

Your job:
- Answer clearly and briefly
- Do NOT repeat questions
- Use available information if already provided
- Move the customer toward WhatsApp or phone contact

Rules:
- If the customer already shared city, quantity, or requirement, DO NOT ask again
- Only ask for missing info if necessary
- If enough info is available, STOP asking questions
- Immediately direct customer to WhatsApp or phone

Closing rules:
- If the customer shows interest, say:
"To place the order, please WhatsApp or call us at +92XXXXXXXXXX. If you prefer, send your phone number and our team will contact you."

- If customer shares phone number:
"Thank you, our team will contact you shortly."

Prices:
1 inch = Rs. 98 per sq ft
1.5 inch = Rs. 145 per sq ft
2 inch = Rs. 190 per sq ft
3 inch = Rs. 260 per sq ft
4 inch = Rs. 345 per sq ft
Custom thickness available on request

Delivery:
Available all over Pakistan

Tone:
Short, helpful, sales-focused, natural
`;

app.get("/", (req, res) => {
  res.send("Diamond Jumbolon bot is live");
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body?.message;
    const history = req.body?.history || "";

    if (!userMessage) {
      return res.status(400).json({
        reply: "Please send your question about price, size, or delivery."
      });
    }

    const fullUserMessage = `
Conversation history:
${history || "No previous history."}

Latest customer message:
${userMessage}
`;

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: fullUserMessage
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
      "Please WhatsApp or call us at +92XXXXXXXXXX for order support.";

    return res.json({
      reply: replyText
    });
  } catch (error) {
    console.error("CHAT ERROR:");
    console.error(error.response?.status || error.message);
    console.error(JSON.stringify(error.response?.data, null, 2) || error.message);

    return res.status(500).json({
      reply: "Sorry, I am having trouble right now. Please WhatsApp or call us for quick help."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Bot running"));