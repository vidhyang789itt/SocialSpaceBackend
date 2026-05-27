"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUser = setUser;
exports.getUser = getUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.JWT_SECRET || "fallback_secret_for_dev_only";
function setUser(userId, username, email) {
    const payload = {
        userId,
        username,
        email
    };
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: "24h" });
}
function getUser(token) {
    try {
        if (!token)
            return null;
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (err) {
        return null;
    }
}
