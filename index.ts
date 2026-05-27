import express from "express";
import cors from "cors";
import http from "http";
import { initSocket } from "./Socket/socketServer";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

import { io, userSocketMap } from "./Socket/socketServer";
import connectDB from "./Connections/MongoDbConnection";
import authRoute from "./Routers/AuthRouter";
import userRoute from "./Routers/UserRouter";
import { restrictToLoginUserOnly } from "./Middlewares/authMiddleware";
import ConnectRouter from "./Routers/SocialFollowingRouter";
import PostRouter from "./Routers/PostRouter";
import errorHandler from "./Middlewares/errorHandlingMiddleware";
import LikeRouter from "./Routers/LikeRouter";
import CommentRouter from "./Routers/CommentRouter";
import ChatRouter from "./Routers/ChatRouter";
import uploadRouter from "./Routers/uploadRouter";
import NotificationRouter from "./Routers/NotificationRouter";
import { CustomRequest } from "./Types/CustomRequestType";

const app: express.Application = express();

const PORT = Number(process.env.PORT) || 500
const httpServer = http.createServer(app);

initSocket(httpServer);

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Attach io and online users to each request for convenience
app.use((req: CustomRequest, res, next) => {
  req.io = io;
  req.onlineUsers = userSocketMap;
  next();
});

// Connect to MongoDB
connectDB(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

// Test route
app.get("/chat-test", (req, res) => {
  res.render("chat");
});

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/uploads", express.static(path.join(__dirname, "../uploads")));

// API routes
app.use("/api", authRoute);
app.use("/api/profile", restrictToLoginUserOnly, userRoute);
app.use("/api/connect", restrictToLoginUserOnly, ConnectRouter);
app.use("/api/posts", restrictToLoginUserOnly, PostRouter);
app.use("/api/like", restrictToLoginUserOnly, LikeRouter);
app.use("/api/comment", restrictToLoginUserOnly, CommentRouter);
app.use("/api/chat", restrictToLoginUserOnly, ChatRouter);
app.use("/api/notification", restrictToLoginUserOnly, NotificationRouter);
app.use("/api/upload", restrictToLoginUserOnly, uploadRouter);

app.use(errorHandler);

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server is running on port ${PORT}`);
});