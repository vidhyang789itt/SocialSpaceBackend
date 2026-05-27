import { Server } from "socket.io";

import { registerSocketHandlers } from "./socketHandlers";

export let io: Server;

export const userSocketMap = new Map<string, string>();


export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;


    if (userId && userId !== "undefined") {
      const userIdStr = String(userId).trim();
      userSocketMap.set(userIdStr, socket.id);


      socket.join(userIdStr);

      const onlineUsersList = Array.from(userSocketMap.keys()).map((id) =>
        String(id).trim()
      );
      io.emit("getOnlineUsers", onlineUsersList);
    } else {
      console.warn("⚠️ Invalid userId:", userId);
    }

    registerSocketHandlers(socket);

    socket.on("disconnect", () => {

      if (userId && userSocketMap.has(userId)) {
        const userIdStr = String(userId).trim();
        userSocketMap.delete(userIdStr);

        const onlineUsersList = Array.from(userSocketMap.keys()).map((id) =>
          String(id).trim()
        );
        io.emit("getOnlineUsers", onlineUsersList);
      }
    });
  });

  return io;
};