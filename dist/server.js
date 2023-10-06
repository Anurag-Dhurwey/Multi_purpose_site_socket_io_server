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
const origin = process.env.ACCEPTED_CORS_ORIGINS?.split(",");
const io = new socket_io_1.Server(server, {
    cors: {
        origin: origin,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true, // Allow cookies, if your application uses them
    },
});
const PORT = process.env.PORT || 5001;
let onlineUsers = [];
io.on("connection", async (socket) => {
    // console.log(`A user ${socket.id} is connected`);
    socket.on("onHnadshake", async (msg) => {
        if (msg.user?._id) {
            // checking user already avalabel or not ?
            const isUseralreadyAvalable = onlineUsers?.find((arrayItem) => arrayItem._id == msg.user._id && arrayItem.email == msg.user.email);
            if (!isUseralreadyAvalable) {
                onlineUsers.push({ ...msg.user, socketId: socket.id });
                onlineUsers?.forEach((usr) => {
                    console.log(usr.email);
                    const { connections, socketId } = usr;
                    const isExist = connections?.connected.find((conUsr) => {
                        return conUsr.user._id == msg.user._id;
                    });
                    console.log(usr.email == msg.user.email);
                    if (isExist || usr.email == msg.user.email) {
                        const connectedOnlineUsr = onlineUsers.filter((Onusr) => {
                            const isConnected = connections?.connected?.find((conUsr) => {
                                return Onusr._id == conUsr.user._id;
                            });
                            return isConnected != undefined;
                        });
                        if (usr.email == msg.user.email) {
                            io.to(socket.id).emit("allOnlineUsers", connectedOnlineUsr);
                            console.log(socketId, socket.id, socketId == socket.id);
                        }
                        io.to(socketId).emit("allOnlineUsers", connectedOnlineUsr);
                    }
                });
                console.log("onHnadshake");
            }
        }
        else {
            // console.log("_id not found");
        }
    });
    socket.on("ConnectionRequest", (msg) => {
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
    socket.on("chat_message", (msg) => {
        socket.to(msg.receiver_socketId).emit("chat_message", msg);
    });
    socket.on("disconnect", () => {
        const disconnectingUsr = onlineUsers.find((user) => user.socketId == socket.id);
        onlineUsers = onlineUsers?.filter((user) => user.socketId !== socket.id);
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
        // console.log(`${socket.id} : disconnected`);
    });
});
// console.log(onlineUsers);
app.get("/", (req, res) => {
    res.send({ onlineUsers });
});
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(origin);
});
