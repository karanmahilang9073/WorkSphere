import User from "../models/User.js";
import bcrypt from "bcrypt";

export const userRegister = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, position } = req.body;
  if (!name || !email || !password) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    throw error;
  }
});
