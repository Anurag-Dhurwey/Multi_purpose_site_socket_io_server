const express = require("express");
const http = require("http");
require("dotenv").config();
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);

// this is comment 
const io = socketIo(server, {
  cors: {
    origin: [process.env.ACCEPTED_CORS_ORIGINS],
  },
});

const PORT = process.env.PORT || 5000;

let onlineUsers = [];

io.on("connection", async (socket) => {
  console.log("A user connected");

  socket.on("onHnadshake", async (msg) => {
    if (msg.user._id) {
      if (onlineUsers.length) {
        // checking user already avalabel or not ?
        const isUseralreadyAvalable = onlineUsers.find(arrayItem=>arrayItem._id == msg.user._id);
        if (!isUseralreadyAvalable) {
          onlineUsers.push({ ...msg.user, socketId: socket.id });
        }
      } else {
        onlineUsers.push({ ...msg.user, socketId: socket.id });
      }
      io.emit("allOnlineUsers", onlineUsers);
    }
  });

  socket.on("ConnectionRequest", (msg) => {
    const { user ,me,_key} = msg;
   const isUserOnline = onlineUsers.find(
      (onlineUser) => onlineUser._id == user._id
    );

    console.log('ConnectionRequest running')
    const requestingUser=onlineUsers.find(onlineUser=>onlineUser._id==me._id)
    if (isUserOnline && requestingUser) {

console.log(requestingUser)
      socket.to(isUserOnline.socketId).emit("ConnectionRequestToUser", { user:requestingUser,_key });
    } else {
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    console.log(`${socket.id} : disconnected`);
    io.emit("allOnlineUsers", onlineUsers);
  });
});

console.log(onlineUsers)

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


