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
- Move every serious buyer toward WhatsApp or phone follow-up

Business contact:
WhatsApp number: +923111111666

Rules:
- Keep replies short and friendly
- Use plain text only
- Do not use markdown, headings, asterisks, or bullet points
- If asked about price, always include the exact rate
- Mention delivery is available across Pakistan
- Do not repeat the same question in every reply
- Only ask for missing information if needed
- If the customer already gave their city, quantity, or requirement, do not ask for it again
- If the customer is ready to order, tell them to WhatsApp or call +923111111666
- If the customer prefers, ask them to share their own phone number and say your team will contact them
- Always try to move the conversation toward order confirmation

Prices:
1 inch = Rs. 98 per sq ft
1.5 inch = Rs. 145 per sq ft
2 inch = Rs. 190 per sq ft
3 inch = Rs. 260 per sq ft
4 inch = Rs. 345 per sq ft
Custom thickness available on request

Delivery:
Available all over Pakistan

How to handle leads:
- If the customer asks for price only, answer the price and then ask one useful next question
- If the customer seems interested, ask for only the next missing detail
- If the customer is ready to buy, say:
  "To place the order, please WhatsApp or call us at +92XXXXXXXXXX. If you want, send me your number and our team will contact you."
- Do not keep asking "How many square feet do you need?" in every reply
- Once you have enough details, direct them to WhatsApp instead of continuing to ask more questions

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