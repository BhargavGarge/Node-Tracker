// Import required modules
import express from "express";
import { createServer } from "http"; // Import createServer for HTTP server
import { Server } from "socket.io"; // Import Socket.IO for real-time communication
import path from "path";
import { fileURLToPath } from "url"; // For handling ES module file paths
import dotenv from "dotenv"; // For loading environment variables from a .env file

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url); // Get the current file's full path
const __dirname = path.dirname(__filename); // Get the directory name of the current file

// Initialize dotenv to load environment variables
dotenv.config();

// Create Express app and HTTP server
const app = express();
const server = createServer(app);

// Initialize Socket.IO on the server
const socketio = new Server(server);

// Define the port (priority to environment variable PORT)
const PORT = process.env.PORT || 3000; // Added .env support for PORT

// Set EJS as the view engine
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Handle client connection and real-time communication
socketio.on("connection", function (socket) {
  console.log("A new client connected and Server running");

  // Listen for "send-location" events from clients
  socket.on("send-location", function (data) {
    // Broadcast the location data to all connected clients
    socketio.emit("receive-location", { id: socket.id, ...data });
  });

  // Handle client disconnection
  socket.on("disconnect", function () {
    // Notify all connected clients of the user's disconnection
    socketio.emit("user-disconnect", socket.id);
  });
});

// Define a route to render the main page
app.get("/", function (req, res) {
  res.render("index"); // Render the "index.ejs" file from the views directory
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Log the server start with the port number
});
