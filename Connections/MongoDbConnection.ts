const mongoose = require("mongoose");

export default async function connectDB(uri?: string) {
  if (!uri) {
    throw new Error("Failed to connect");
  }
  await mongoose.connect(uri);
}
