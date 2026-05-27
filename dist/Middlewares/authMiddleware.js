"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictToLoginUserOnly = void 0;
const jwtUtil_1 = require("../Utils/jwtUtil");
const restrictToLoginUserOnly = (req, res, next) => {
    const authTokenHeader = req.headers.authorization;
    if (!authTokenHeader || !authTokenHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return;
    }
    const token = authTokenHeader.split(" ")[1];
    try {
        const currentUser = (0, jwtUtil_1.getUser)(token);
        if (!currentUser) {
            res.status(401).json({ error: "Unauthorized: Invalid token" });
            return;
        }
        req.user = currentUser;
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Unauthorized: Token verification failed" });
        return;
    }
};
exports.restrictToLoginUserOnly = restrictToLoginUserOnly;
