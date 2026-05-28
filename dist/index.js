"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socketServer_1 = require("./Socket/socketServer");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const socketServer_2 = require("./Socket/socketServer");
const MongoDbConnection_1 = __importDefault(require("./Connections/MongoDbConnection"));
const AuthRouter_1 = __importDefault(require("./Routers/AuthRouter"));
const UserRouter_1 = __importDefault(require("./Routers/UserRouter"));
const authMiddleware_1 = require("./Middlewares/authMiddleware");
const SocialFollowingRouter_1 = __importDefault(require("./Routers/SocialFollowingRouter"));
const PostRouter_1 = __importDefault(require("./Routers/PostRouter"));
const errorHandlingMiddleware_1 = __importDefault(require("./Middlewares/errorHandlingMiddleware"));
const LikeRouter_1 = __importDefault(require("./Routers/LikeRouter"));
const CommentRouter_1 = __importDefault(require("./Routers/CommentRouter"));
const ChatRouter_1 = __importDefault(require("./Routers/ChatRouter"));
const uploadRouter_1 = __importDefault(require("./Routers/uploadRouter"));
const NotificationRouter_1 = __importDefault(require("./Routers/NotificationRouter"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 500;
const httpServer = http_1.default.createServer(app);
(0, socketServer_1.initSocket)(httpServer);
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use((req, res, next) => {
    req.io = socketServer_2.io;
    req.onlineUsers = socketServer_2.userSocketMap;
    next();
});
(0, MongoDbConnection_1.default)(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
    })
    .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
    });
app.get("/chat-test", (req, res) => {
    res.render("chat");
});
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
app.use("/api/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use("/api", AuthRouter_1.default);
app.use("/api/profile", authMiddleware_1.restrictToLoginUserOnly, UserRouter_1.default);
app.use("/api/connect", authMiddleware_1.restrictToLoginUserOnly, SocialFollowingRouter_1.default);
app.use("/api/posts", authMiddleware_1.restrictToLoginUserOnly, PostRouter_1.default);
app.use("/api/like", authMiddleware_1.restrictToLoginUserOnly, LikeRouter_1.default);
app.use("/api/comment", authMiddleware_1.restrictToLoginUserOnly, CommentRouter_1.default);
app.use("/api/chat", authMiddleware_1.restrictToLoginUserOnly, ChatRouter_1.default);
app.use("/api/notification", authMiddleware_1.restrictToLoginUserOnly, NotificationRouter_1.default);
app.use("/api/upload", authMiddleware_1.restrictToLoginUserOnly, uploadRouter_1.default);
app.use(errorHandlingMiddleware_1.default);
httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
exports.default = app;
