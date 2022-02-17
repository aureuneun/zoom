import http from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();
const PORT = 3000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const server = http.createServer(app);
const io = new Server(server);

const publicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

io.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("nickname", (nickname, done) => {
    socket["nickname"] = nickname;
    done();
  });
  socket.on("join", (room, done) => {
    socket.join(room);
    socket.to(room).emit("welcome", socket.nickname);
    io.sockets.emit("change", publicRooms());
    done();
  });
  socket.on("leave", (room, done) => {
    socket.leave(room);
    socket.to(room).emit("bye", socket.nickname);
    io.sockets.emit("change", publicRooms());
    done();
  });
  socket.on("message", (message, room) => {
    socket.to(room).emit("message", message, socket.nickname);
  });
});

server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
