"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = exports.userSocketMap = exports.io = void 0;
const socket_io_1 = require("socket.io");
const socketHandlers_1 = require("./socketHandlers");
exports.userSocketMap = new Map();
const initSocket = (server) => {
    exports.io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
        transports: ["websocket", "polling"],
    });
    exports.io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId && userId !== "undefined") {
            const userIdStr = String(userId).trim();
            exports.userSocketMap.set(userIdStr, socket.id);
            socket.join(userIdStr);
            const onlineUsersList = Array.from(exports.userSocketMap.keys()).map((id) => String(id).trim());
            exports.io.emit("getOnlineUsers", onlineUsersList);
        }
        else {
            console.warn("⚠️ Invalid userId:", userId);
        }
        (0, socketHandlers_1.registerSocketHandlers)(socket);
        socket.on("disconnect", () => {
            if (userId && exports.userSocketMap.has(userId)) {
                const userIdStr = String(userId).trim();
                exports.userSocketMap.delete(userIdStr);
                const onlineUsersList = Array.from(exports.userSocketMap.keys()).map((id) => String(id).trim());
                exports.io.emit("getOnlineUsers", onlineUsersList);
            }
        });
    });
    return exports.io;
};
exports.initSocket = initSocket;
