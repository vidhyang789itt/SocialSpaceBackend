import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import User from "../Models/Users";
import { setUser } from "../Utils/jwtUtil";

async function registerUser(
  username: string,
  email: string,
  password: string,
) {
  const userExists = await User.findOne({ email });

  console.log(username, email, password);
  

  if (userExists) {
    const error: any = new Error("Email already in use");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    userId: uuidv4(),
    username,
    email,
    password: hashedPassword,
    followers: [],
    following: [],
  });

  return newUser;
}

async function loginUser(
  email: string,
  password: string,
): Promise<{ token: string; user: any }> {
  const user = await User.findOne({ email });

  if (!user) {
    const error: any = new Error("Invalid email or password");
    error.statusCode = 400;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error: any = new Error("Invalid email or password");
    error.statusCode = 400;
    throw error;
  }

  const token = setUser(user.userId, user.username, user.email);

  return { token, user };
}

export { registerUser, loginUser };
