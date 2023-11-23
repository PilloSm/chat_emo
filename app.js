const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const server = require("http").Server(app);
var io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

let clientes = [];

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
server.listen(8080, () =>
  console.log("Servidor corriendo en http://localhost:8080")
);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/chat/:username", function (req, res) {
  res.sendFile(__dirname + "/public/chat.html");
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const id = req.body.id;
  clientes.push({ username: username });
  io.emit("socket_conectado", { id: id, username: username });

  return res.json(clientes);
});

app.post("/send", function (req, res) {
  const username = req.body.username;
  const id = req.body.id;
  const msg = req.body.text;
  io.emit("mensaje", { id: id, msg: msg, username: username });
  return res.json({ text: "Mensaje enviado." });
});

io.on("connection", (socket) => {
  const id = socket.id;
  console.log("Socket conectado", id);
  socket.emit("socket_conectado", { id: id });
  socket.on("notificar", () => {
    socket.broadcast.emit("notify", id);
  });
  socket.on("disconnect", () => {
    clientes = clientes.filter((cliente) => cliente.id !== socket.id);
    io.emit("socket_desconectado", {
      texto: "Socket desconectado.",
      id: socket.id,
    });
  });
});
