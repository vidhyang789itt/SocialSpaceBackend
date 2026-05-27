"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connectDB;
const mongoose = require("mongoose");
async function connectDB(uri) {
    if (!uri) {
        throw new Error("Failed to connect");
    }
    await mongoose.connect(uri);
}
