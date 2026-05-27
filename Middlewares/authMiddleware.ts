import { Response, NextFunction } from "express";
import { CustomRequest } from "../Types/CustomRequestType";
import { getUser } from "../Utils/jwtUtil";
import { RequestHandler } from "express";

const restrictToLoginUserOnly: RequestHandler = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authTokenHeader = req.headers.authorization;

  if (!authTokenHeader || !authTokenHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  const token = authTokenHeader.split(" ")[1];

  try {
    const currentUser = getUser(token);

    if (!currentUser) {
      res.status(401).json({ error: "Unauthorized: Invalid token" });
      return;
    }

    req.user = currentUser;

    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized: Token verification failed" });
    return;
  }
};

export { restrictToLoginUserOnly };
