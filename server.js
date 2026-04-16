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

WhatsApp: +923111111666

Your job:
- Answer the customer's actual question first
- Give useful pricing and product information clearly
- Avoid repeating questions the customer already answered
- Move serious buyers to WhatsApp or phone follow-up when appropriate

Rules:
- Use plain text only
- Do not use markdown
- Do not use asterisks, headings, bullet points, or bold formatting
- If the customer asks for price, always answer directly
- If the customer says "price", "prices", or "rate", show the full price list
- If thickness and quantity are already known from history, do not ask for them again
- If enough details are known, give the total cost clearly
- Redirect to WhatsApp only when the customer is ready to order or asks for next steps
- Do not keep repeating the same question

Price list:
1 inch = Rs. 98 per sq ft
1.5 inch = Rs. 145 per sq ft
2 inch = Rs. 190 per sq ft
3 inch = Rs. 260 per sq ft
4 inch = Rs. 345 per sq ft

Delivery:
Available all over Pakistan

If user asks only for price/rates, reply like this:
Price list:
1 inch - Rs. 98 per sq ft
1.5 inch - Rs. 145 per sq ft
2 inch - Rs. 190 per sq ft
3 inch - Rs. 260 per sq ft
4 inch - Rs. 345 per sq ft

Then ask:
What thickness and how many square feet do you need?

If thickness and quantity are already known, calculate clearly like this:
The price for 2 inch thickness is Rs. 190 per sq ft.
For 1000 sq ft:
1000 x 190 = Rs. 190,000
Delivery is available all over Pakistan.

If customer is ready to buy, say:
To place the order, please WhatsApp or call us at +923111111666.
If you prefer, send your phone number and our team will contact you.

Tone:
Helpful, short, natural, sales-focused, simple English
`;

function isGreeting(text) {
  const t = (text || "").trim().toLowerCase();
  const greetings = [
    "hi",
    "hello",
    "hey",
    "salam",
    "assalamualaikum",
    "assalam o alaikum",
    "aoa",
    "start"
  ];
  return greetings.includes(t);
}

app.get("/", (req, res) => {
  res.send("Diamond Jumbolon bot is live");
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body?.message || "";
    const history = req.body?.history || "";

    if (!userMessage) {
      return res.status(400).json({
        reply: "Thanks for messaging Diamond Jumbolon. Please ask about prices, thickness, or delivery."
      });
    }

    // Friendly intro for brand new / greeting messages
    if (isGreeting(userMessage)) {
      return res.json({
        reply: "Thanks for messaging Diamond Jumbolon. We can help with prices, thickness, and delivery across Pakistan. If you want pricing, please tell me the thickness and square feet you need."
      });
    }

    const fullUserMessage = `
Saved customer details:
${history || "No saved details."}

Latest customer message:
${userMessage}
`;

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-6",
        max_tokens: 350,
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
      "Please WhatsApp or call us at +923111111666 for order support.";

    return res.json({
      reply: replyText
    });
  } catch (error) {
    console.error("CHAT ERROR:");
    console.error(error.response?.status || error.message);
    console.error(JSON.stringify(error.response?.data, null, 2) || error.message);

    return res.status(500).json({
      reply: "Sorry, I am having trouble right now. Please WhatsApp or call us at +923111111666 for quick help."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Bot running"));