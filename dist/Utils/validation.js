"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInput = validateInput;
function validateInput(username, email, password, isRegister) {
    if (isRegister && !username) {
        return "Username is required";
    }
    if (!email) {
        return "Email is required";
    }
    if (!password) {
        return "Password is required";
    }
    return null;
}
