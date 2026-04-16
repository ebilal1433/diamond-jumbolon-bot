import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Diamond Jumbolon bot is live");
});

app.post("/chat", async (req, res) => {
  console.log("BODY RECEIVED:", req.body);

  return res.json({
    reply: "THIS IS WORKING ✅"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Bot running"));