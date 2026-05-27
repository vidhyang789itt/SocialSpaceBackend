"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const Users_1 = __importDefault(require("../Models/Users"));
const jwtUtil_1 = require("../Utils/jwtUtil");
async function registerUser(username, email, password) {
    const userExists = await Users_1.default.findOne({ email });
    console.log(username, email, password);
    if (userExists) {
        const error = new Error("Email already in use");
        error.statusCode = 400;
        throw error;
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const newUser = await Users_1.default.create({
        userId: (0, uuid_1.v4)(),
        username,
        email,
        password: hashedPassword,
        followers: [],
        following: [],
    });
    return newUser;
}
async function loginUser(email, password) {
    const user = await Users_1.default.findOne({ email });
    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 400;
        throw error;
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 400;
        throw error;
    }
    const token = (0, jwtUtil_1.setUser)(user.userId, user.username, user.email);
    return { token, user };
}
