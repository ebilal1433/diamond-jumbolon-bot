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

WhatsApp: +92111111666

Your job:
- Answer the customer's actual question first
- Give useful product information clearly
- Avoid repeating questions the customer already answered
- Move serious buyers to WhatsApp or ask for their phone number only when appropriate

Rules:
- Always answer the customer's question directly before suggesting WhatsApp
- If the customer asks about price, size, thickness, delivery, or usage, give the answer first
- Do not repeat questions the customer already answered
- Only ask for missing information if it is truly needed
- Do not redirect to WhatsApp in every single reply
- Redirect to WhatsApp only when:
  1. the customer wants to place an order
  2. the customer asks for final confirmation
  3. the customer asks for a call
  4. enough details are already collected and the next step is order handling

If the customer is only asking for information:
- answer clearly
- then ask at most one useful follow-up question

If the customer is ready to buy:
say:
"To place the order, please WhatsApp or call us at +92111111666. If you prefer, send your phone number and our team will contact you."

If the customer shares their phone number:
say:
"Thank you. Our team will contact you shortly."

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
Helpful, short, natural, sales-focused, simple English

Good examples:
Customer: What is the price of 2 inch insulation?
Assistant: The price of 2 inch insulation is Rs. 180 per sq ft. Delivery is available all over Pakistan. How many square feet do you need?

Customer: Do you deliver to Lahore?
Assistant: Yes, delivery is available in Lahore and across Pakistan. If you want, I can also guide you on the right thickness for your space.

Customer: I want to order
Assistant: To place the order, please WhatsApp or call us at +92111111666. If you prefer, send your phone number and our team will contact you.
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