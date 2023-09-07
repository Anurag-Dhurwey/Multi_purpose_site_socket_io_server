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
// this is comment
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
                io.emit("allOnlineUsers", onlineUsers);
                console.log("onHnadshake");
            }
        }
        else {
            console.log("_id not found");
        }
    });
    socket.on("ConnectionRequest", (msg) => {
        const { sentBy, sendTo, _key } = msg;
        console.log({ _key });
        socket
            .to(sendTo.socketId)
            .emit("ConnectionRequestToUser", { user: sentBy, _key });
    });
    socket.on("chat_message", (msg) => {
        socket.to(msg.receiver_socketId).emit("chat_message", msg);
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
