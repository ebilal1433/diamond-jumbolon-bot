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

Business facts:
- Diamond Jumbolon Board / sheets are made from XPS (extruded polystyrene rigid insulation).
- Diamond Jumbolon also offers Jumbolon Rolls.
- Jumbolon Rolls can be used for insulation, padding, comfort, and underlay purposes.
- Diamond Jumbolon also offers other products such as insulation pipes, hose pipes, water tank insulation jackets, fruit nets, backer rods, and PU spray.

Contact details:
- WhatsApp / Call: 0331 1111 666
- Landline: 042 111 111 666

Price list:
1 inch = Rs. 120 per sq ft
1.5 inch = Rs. 150 per sq ft
2 inch = Rs. 190 per sq ft
3 inch = Rs. 260 per sq ft
4 inch = Rs. 320 per sq ft

Rules:
- Answer the customer's actual question first.
- Use plain text only.
- Never use markdown, asterisks, headings, or bullet points.
- If the user writes in Urdu, reply in Urdu.
- If the user writes in English, reply in English.
- If the user asks for "price", "prices", or "rate", show the full price list first.
- If thickness is already known, do not ask for thickness again.
- If quantity is already known, do not ask for quantity again.
- If the user sends only a number and thickness is already known, assume it is square feet.
- If thickness and quantity are both known, calculate total immediately.
- If the customer asks about boards or sheets, explain that Diamond Jumbolon Board is XPS insulation.
- If the customer asks about rolls, explain that Jumbolon Rolls are also available.
- If the customer asks about hose pipes or other products, answer briefly and clearly.
- Do not repeat the same question again and again.
- Only push WhatsApp / call when the customer is ready to order or asks for next steps.

If the customer asks only for prices, reply like this:
Price list:
1 inch - Rs. 120 per sq ft
1.5 inch - Rs. 150 per sq ft
2 inch - Rs. 190 per sq ft
3 inch - Rs. 260 per sq ft
4 inch - Rs. 320 per sq ft

Then ask:
What thickness and how many square feet do you need?

If thickness and quantity are already known, reply like this:
The price for 2 inch thickness is Rs. 190 per sq ft.
For 700 sq ft:
700 x 190 = Rs. 133,000
Delivery is available all over Pakistan.

If the customer wants to place an order, say:
To place the order, please WhatsApp or call us at 0331 1111 666.
If you prefer, send your phone number and our team will contact you.

If the user asks in Urdu, reply naturally in Urdu.

Tone:
Helpful, short, natural, professional, and sales-focused.
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
        reply: "Thanks for messaging Diamond Jumbolon. Please ask about prices, thickness, products, or delivery."
      });
    }

    if (isGreeting(userMessage)) {
      return res.json({
        reply: "Thanks for messaging Diamond Jumbolon. We can help with prices, thickness, boards, rolls, hose pipes, and delivery across Pakistan. If you want pricing, please tell me the thickness and square feet you need."
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
      "Please WhatsApp or call us at 0331 1111 666 for order support.";

    return res.json({
      reply: replyText
    });
  } catch (error) {
    console.error("CHAT ERROR:");
    console.error(error.response?.status || error.message);
    console.error(JSON.stringify(error.response?.data, null, 2) || error.message);

    return res.status(500).json({
      reply: "Sorry, I am having trouble right now. Please WhatsApp or call us at 0331 1111 666 for quick help."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Bot running"));