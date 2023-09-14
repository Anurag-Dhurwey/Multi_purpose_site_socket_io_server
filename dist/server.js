"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const origin = process.env.ACCEPTED_CORS_ORIGINS;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [origin ? origin : ""],
    },
});
const PORT = process.env.PORT || 5001;
let onlineUsers = [];
io.on("connection", async (socket) => {
    console.log(`A user ${socket.id} is connected`);
    socket.on("onHnadshake", async (msg) => {
        if (msg.user?._id) {
            // if (onlineUsers) {
            // checking user already avalabel or not ?
            const isUseralreadyAvalable = onlineUsers?.find((arrayItem) => arrayItem._id == msg.user._id && arrayItem.email == msg.user.email);
            if (!isUseralreadyAvalable) {
                onlineUsers.push({ ...msg.user, socketId: socket.id });
                onlineUsers?.forEach((usr) => {
                    const { connections, socketId } = usr;
                    const isExist = connections?.connected.find((conUsr) => {
                        return conUsr.user._id == msg.user._id;
                    });
                    if (isExist || usr.email == msg.user.email) {
                        const connectedOnlineUsr = onlineUsers.filter((Onusr) => {
                            const isConnected = connections?.connected?.find((conUsr) => {
                                return Onusr._id == conUsr.user._id;
                            });
                            return isConnected != undefined;
                        });
                        io.to(socketId).emit("allOnlineUsers", connectedOnlineUsr);
                    }
                });
                // io.emit("allOnlineUsers", connectedOnlineUsr);
                console.log("onHnadshake");
            }
        }
        else {
            console.log("_id not found");
        }
    });
    socket.on("ConnectionRequest", (msg) => {
        const { sentBy, sendTo, _key } = msg;
        const isOnline = onlineUsers.find((usr) => {
            return usr.email == sendTo.email;
        });
        if (isOnline) {
            console.log({ _key });
            socket
                .to(isOnline.socketId)
                .emit("ConnectionRequestToUser", { user: sentBy, _key });
        }
    });
    socket.on("chat_message", (msg) => {
        socket.to(msg.receiver_socketId).emit("chat_message", msg);
    });
    socket.on("disconnect", () => {
        const disconnectingUsr = onlineUsers.find((user) => user.socketId == socket.id);
        onlineUsers?.forEach((usr) => {
            const { connections, socketId } = usr;
            const isExist = connections?.connected.find((conUsr) => {
                return conUsr.user._id == disconnectingUsr?._id;
            });
            if (isExist) {
                const newCopyOfOnlineUsers = onlineUsers?.filter((user) => user.socketId !== socket.id && user.socketId != socketId);
                io.to(socketId).emit("allOnlineUsers", newCopyOfOnlineUsers);
            }
        });
        onlineUsers = onlineUsers?.filter((user) => user.socketId !== socket.id);
        console.log(`${socket.id} : disconnected`);
    });
});
console.log(onlineUsers);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
