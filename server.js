const express = require("express");
const axios = require("axios");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("userMessage", async (message) => {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            { role: "system", content: "Ты AI-продавец мини-погрузчиков. Отвечай кратко и по делу." },
            { role: "user", content: message },
          ],
        },
        {
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        }
      );

      const botMessage = response.data.choices[0].message.content;
      socket.emit("botMessage", botMessage);
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
      socket.emit("botMessage", "Извините, произошла ошибка. Попробуйте позже.");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
