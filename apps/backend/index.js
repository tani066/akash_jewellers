const express = require("express");
const dotenv = require("dotenv");
const corsMiddleware = require("./config/cors.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(corsMiddleware);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("<h1>Backend Running Successfully 🚀</h1>");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
  console.log(`✅ Local Backend URL: ${process.env.BACKEND_LOCAL_URL || "N/A"}`);
  console.log(`✅ Deployed Backend URL: ${process.env.BACKEND_SERVER_URL || "N/A"}`);
});
