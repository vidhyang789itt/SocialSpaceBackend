import { Request, Response, NextFunction } from "express";
import * as authService from "../Services/authService";
import { validateInput } from "../Utils/validation";

async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, email, password } = req.body;
    const validationError = validateInput(username, email, password, true);

    if (validationError) {
      const error: any = new Error(validationError);
      error.statusCode = 400;
      return next(error);
    }
    const newUser = await authService.registerUser(username, email, password);

    res.status(201).json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

async function loginUser(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  const validationError = validateInput("", email, password, false);
  if (validationError) {
    const error: any = new Error(validationError);
    error.statusCode = 400;
    return next(error);
  }

  try {
    const { token, user } = await authService.loginUser(email, password);
    res.status(200).json({
      token,
      user: user,
    });
  } catch (err) {
    return next(err);
  }
}

export { registerUser, loginUser };
