const io = require("socket.io-client");
const socket = io("http://localhost:10000");

socket.on("connect", () => {
  console.log("✅ Conectado al servidor Socket.IO");

  socket.emit("join-room", { roomId: "66ef730db3fcdc3ad9db447c_66ef745fb3fcdc3ad9db448b" });

  socket.emit("send-message", {
    roomId: "66ef730db3fcdc3ad9db447c_66ef745fb3fcdc3ad9db448b",
    sender: "66ef730db3fcdc3ad9db447c",
    receiver: "66ef745fb3fcdc3ad9db448b",
    content: "Hola desde Node.js"
  });
});

socket.on("new-message", (msg) => {
  console.log("📩 Mensaje recibido:", msg);
});
