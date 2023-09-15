import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import {
  onconnectionrequestMsg,
  onhandshakeMsg,
  onlineUser,
  chat_message,
} from "./typescript/main";

dotenv.config();
const app = express();
const server = http.createServer(app);

const origin = process.env.ACCEPTED_CORS_ORIGINS;

const io = new Server(server, {
  cors: {
    origin: [origin ? origin : ""],
  },
});

const PORT = process.env.PORT || 5001;

let onlineUsers: Array<onlineUser> = [];

io.on("connection", async (socket) => {
  // console.log(`A user ${socket.id} is connected`);

  socket.on("onHnadshake", async (msg: onhandshakeMsg) => {
    if (msg.user?._id) {

      // checking user already avalabel or not ?
      const isUseralreadyAvalable = onlineUsers?.find(
        (arrayItem) =>
          arrayItem._id == msg.user._id && arrayItem.email == msg.user.email
      );
      if (!isUseralreadyAvalable) {
        onlineUsers.push({ ...msg.user, socketId: socket.id });
        onlineUsers?.forEach((usr) => {
          const { connections, socketId } = usr;
          const isExist = connections?.connected.find((conUsr) => {
            return conUsr.user._id == msg.user._id;
          });
          if (isExist || usr.email==msg.user.email) {
            const connectedOnlineUsr = onlineUsers.filter((Onusr) => {
              const isConnected = connections?.connected?.find(
                (conUsr) => {
                  return Onusr._id == conUsr.user._id;
                }
              );
              return isConnected !=undefined;
            });
            io.to(socketId).emit("allOnlineUsers", connectedOnlineUsr);
          }
        });

        // console.log("onHnadshake");
      }
    } else {
      // console.log("_id not found");
    }
  });

  socket.on("ConnectionRequest", (msg: onconnectionrequestMsg) => {
    const { sentBy, sendTo, _key } = msg;
    const isOnline = onlineUsers.find((usr) => {
      return usr.email == sendTo.email;
    });
    if (isOnline) {
      // console.log({ _key });
      socket
        .to(isOnline.socketId)
        .emit("ConnectionRequestToUser", { user: sentBy, _key });
    }
  });

  socket.on("chat_message", (msg: chat_message) => {
    socket.to(msg.receiver_socketId).emit("chat_message", msg);
  });

  socket.on("disconnect", () => {
    const disconnectingUsr = onlineUsers.find(
      (user) => user.socketId == socket.id
    );
    
    onlineUsers = onlineUsers?.filter((user) => user.socketId !== socket.id);

    onlineUsers?.forEach((usr) => {
      const { connections, socketId } = usr;
      const isExist = connections?.connected.find((conUsr) => {
        return conUsr.user._id == disconnectingUsr?._id;
      });
      if (isExist) {
        const newCopyOfOnlineUsers = onlineUsers?.filter(
          (user) => user.socketId !== socket.id && user.socketId != socketId
        );
        io.to(socketId).emit("allOnlineUsers", newCopyOfOnlineUsers);
      }
    });
    // console.log(`${socket.id} : disconnected`);
  });
});

// console.log(onlineUsers);

app.get('/',(req,res)=>{
  res.send({onlineUsers})
})

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
