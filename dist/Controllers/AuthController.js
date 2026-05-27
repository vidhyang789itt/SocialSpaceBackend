"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const authService = __importStar(require("../Services/authService"));
const validation_1 = require("../Utils/validation");
async function registerUser(req, res, next) {
    try {
        const { username, email, password } = req.body;
        const validationError = (0, validation_1.validateInput)(username, email, password, true);
        if (validationError) {
            const error = new Error(validationError);
            error.statusCode = 400;
            return next(error);
        }
        const newUser = await authService.registerUser(username, email, password);
        res.status(201).json({
            success: true,
        });
    }
    catch (err) {
        next(err);
    }
}
async function loginUser(req, res, next) {
    const { email, password } = req.body;
    const validationError = (0, validation_1.validateInput)("", email, password, false);
    if (validationError) {
        const error = new Error(validationError);
        error.statusCode = 400;
        return next(error);
    }
    try {
        const { token, user } = await authService.loginUser(email, password);
        res.status(200).json({
            token,
            user: user,
        });
    }
    catch (err) {
        return next(err);
    }
}
