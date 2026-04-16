import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const API_KEY = process.env.CLAUDE_API_KEY;

const SYSTEM_PROMPT = `
You are a sales assistant for Diamond Jumbolon in Pakistan.

Rules:
- Give short answers
- Provide prices when asked
- Suggest correct insulation thickness
- Try to convert to WhatsApp order

Prices:
1 inch = 120 PKR/sq ft
2 inch = 180 PKR/sq ft

Delivery: All over Pakistan
`;

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-sonnet-20240229",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }]
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        }
      }
    );

    res.json({
      reply: response.data.content[0].text
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.json({
      reply: "Sorry, I am having trouble right now. Please WhatsApp us for quick help."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Bot running"));