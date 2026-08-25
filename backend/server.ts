import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ONLINE",
    system: "NIRNAY",
    message: "Emergency Decision Engine operational"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`NIRNAY backend running on port ${PORT}`);
});
