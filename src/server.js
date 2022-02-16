import http from "http";
import express from "express";
import WebSocket from "ws";

const app = express();
const PORT = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const server = http.createServer(app);
const ws = new WebSocket.Server({ server });

const sockets = [];

ws.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  console.log("Connected to Browser ✅");
  socket.on("close", () => {
    console.log("Disconnected from Browser ❌");
  });
  socket.on("message", (aMessage) => {
    const message = JSON.parse(aMessage.toString("utf8"));
    switch (message.type) {
      case "nickname":
        socket["nickname"] = message.payload;
        break;
      case "message":
        sockets.forEach((aSocket) => {
          if (socket.nickname !== aSocket.nickname)
            aSocket.send(`${socket.nickname}: ${message.payload}`);
        });
        break;
    }
  });
});

server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
