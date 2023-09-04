import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import {
  onconnectionrequestMsg,
  onhandshakeMsg,
  onlineUser,
} from "./typescript/main";

dotenv.config();
const app = express();
const server = http.createServer(app);

const origin = process.env.ACCEPTED_CORS_ORIGINS;
// this is comment
const io = new Server(server, {
  cors: {
    origin: [origin ? origin : ""],
  },
});

const PORT = process.env.PORT || 5001;

let onlineUsers: Array<onlineUser> = [];

io.on("connection", async (socket) => {
  console.log(`A user ${socket.id} is connected`);

  socket.on("onHnadshake", async (msg: onhandshakeMsg) => {
    if (msg.user?._id) {
      // if (onlineUsers) {
      // checking user already avalabel or not ?
      const isUseralreadyAvalable = onlineUsers?.find(
        (arrayItem) => (arrayItem._id == msg.user._id && arrayItem.email == msg.user.email)
      );
      if (!isUseralreadyAvalable) {
        onlineUsers.push({ ...msg.user, socketId: socket.id });
            io.emit("allOnlineUsers", onlineUsers);
      }
  
    }else{
      console.log('_id not found')
    }
    console.log("onHnadshake")
  });

  socket.on("ConnectionRequest", (msg: onconnectionrequestMsg) => {
    const { user, me, _key } = msg;
console.log({_key})
    // check user is online or not
    const isUserOnline = onlineUsers.find(
      (onlineUser) => onlineUser._id == user._id
    );

    console.log("ConnectionRequest running");
    // check who is reqesting and he is online or not
    const requestingUser = onlineUsers.find(
      (onlineUser) => onlineUser._id == me._id
    );

    if (isUserOnline && requestingUser) {
      socket
        .to(isUserOnline.socketId)
        .emit("ConnectionRequestToUser", { user: requestingUser, _key });
    } else {
      console.log("user not found");
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    console.log(`${socket.id} : disconnected`);
    io.emit("allOnlineUsers", onlineUsers);
  });
});

console.log(onlineUsers);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

