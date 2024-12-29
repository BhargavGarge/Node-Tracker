// create a express server

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
dotenv.config();
const server = createServer(app);
const socketio = new Server(server);
const PORT = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

socketio.on("connection", function (socket) {
  socket.on("send-location", function (data) {
    socketio.emit("receive-location", { id: socket.id, ...data });
  });

  socket.on("disconnect", function () {
    socketio.emit("user-disconnect", socket.id);
  });
  console.log("a new client connected and Server running");
});
app.get("/", function (req, res) {
  res.render("index");
});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
