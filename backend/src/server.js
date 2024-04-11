// Node modules
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

// Third-party modules
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const { Server: SocketIOServer } = require("socket.io");

const app = express();

// CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust the first proxy when running in production on App Engine
// app.set("trust proxy", 1);

let server;
const port = process.env.PORT || 8080;
if (process.env.NODE_ENV === "production") {
  // HTTPS options
  const options = {
    key: fs.readFileSync(path.join(__dirname, "../ssl", "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "../ssl", "cert.pem")),
    // requestCert: false,
    // rejectUnauthorized: false,
  };
  // HTTPS server
  // const httpsServer = https.createServer(options, app);
  // httpsServer.listen(port, () =>
  //   console.log(`HTTPS server is running on port ${port}`)
  // );
  server = https.createServer(options, app);
  server.listen(port, () =>
    console.log(`HTTPS server is running on port ${port}`)
  );
} else {
  // HTTP server
  // const httpServer = http.createServer(app);
  // httpServer.listen(port, () =>
  //   console.log(`HTTP server is running on port ${port}`)
  // );
  server = http.createServer(app);
  server.listen(port, () =>
    console.log(`HTTP server is running on port ${port}`)
  );
}

// Session
app.use(
  session({
    name: "collabhub.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "lax",
      // secure: true,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Serve React app (for production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
}

// Static files (for testing)
app.use("/test", express.static(path.join(__dirname, "./test.local")));

// Files
// app.use("/files", express.static(path.join(__dirname, "../uploads")));

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// API user routes (unnecessary to use isAuthenticated middleware because these routes are for authentication)
app.use("/api/users", require("./routes/users"));

// Only allow authenticated users with AJAX requests to access API routes
app.use("/api", isAuthenticated, (req, res, next) => {
  if (req.headers["x-requested-with"] === "XMLHttpRequest") {
    next(); // If the request is an AJAX request, proceed
  } else {
    res.status(403).send("You are not allowed to access this route directly"); // If the request is not an AJAX request, send a 403 Forbidden response
  }
});

// Protected API routes
app.get("/api/test", (req, res) => {
  if (req.session.userId) {
    res.send(`Hello, User ${req.session.userId}!`);
  } else {
    res.send(`Hello, World!`);
  }
});
app.use("/api/search", require("./routes/search"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/chats", require("./routes/chats"));
app.use("/api/lists", require("./routes/lists"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/roles", require("./routes/roles"));

// Catch-all route
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
  });
}

// Chat server
const io = new SocketIOServer(server);
let chatRooms = {};
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Join room
  socket.on("join_room", (roomId) => {
    // socket.join(data);
    if (!chatRooms[roomId]) {
      chatRooms[roomId] = [];
    }
    chatRooms[roomId].push(socket.id);
    socket.join(roomId);
  });

  // Leave room
  socket.on('leave_room', (roomId) => {
    chatRooms[roomId] = chatRooms[roomId].filter(id => id !== socket.id);
    socket.leave(roomId);
  });

  socket.on("chat_added", () => {
    socket.broadcast.emit("refresh_user_list");
  });

  socket.on("send_message", (message) => {
    socket.to(message.chatId).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    for (let roomId in chatRooms) {
      chatRooms[roomId] = chatRooms[roomId].filter(id => id !== socket.id);
    }
  });
});
