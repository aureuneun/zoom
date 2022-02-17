const nickname = document.querySelector("#nickname");
const room = document.querySelector("#room");
const message = document.querySelector("#message");
const nickInfo = document.querySelector("#status h1");

const nicknameForm = nickname.querySelector("form");
const roomForm = room.querySelector("form");
const messageForm = message.querySelector("form");

const roomInfo = message.querySelector("h3");
const roomList = room.querySelector("ul");
const messageList = message.querySelector("ul");

const socket = io();

room.hidden = true;
message.hidden = true;

let roomName;

const make = (element, payload) => {
  const li = document.createElement("li");
  li.innerText = payload;
  element.append(li);
};

const show = (element) => {
  nickname.hidden = true;
  room.hidden = true;
  message.hidden = true;

  element.hidden = false;
};

nicknameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = nicknameForm.querySelector("input");
  socket.emit("nickname", input.value, () => show(room));
  nickInfo.innerText = input.value;
  const btn = document.createElement("button");
  btn.innerText = "Edit";
  nickInfo.append(btn);
  btn.addEventListener("click", (e) => {
    show(nickname);
  });
});

roomForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = roomForm.querySelector("input");
  roomName = input.value;
  input.value = "";
  make(roomList, roomName);
  roomInfo.innerText = `Room ${roomName}`;
  const btn = document.createElement("button");
  btn.innerText = "Leave";
  roomInfo.append(btn);
  btn.addEventListener("click", (e) => {
    socket.emit("leave", roomName, () => show(room));
  });
  socket.emit("join", roomName, () => show(message));
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = messageForm.querySelector("input");
  const message = input.value;
  input.value = "";
  make(messageList, `You: ${message}`);
  socket.emit("message", message, roomName);
});

socket.on("welcome", (nickname) => make(messageList, `${nickname} join`));

socket.on("bye", (nickname) => make(messageList, `${nickname} leave`));

socket.on("message", (message, nickname) =>
  make(messageList, `${nickname}: ${message}`)
);

socket.on("change", (rooms) => {
  roomList.innerText = "";
  rooms.map((room) => {
    make(roomList, room);
  });
});
