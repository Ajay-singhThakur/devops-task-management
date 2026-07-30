import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

import {
  register,
  login,
} from "../services/authService.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await register({
    name,
    email,
    password,
  });

  res.status(201).json({
    message: "User registered successfully",
    user,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const data = await login({
    email,
    password,
  });

  res.status(200).json({
    message: "Login successful",
    ...data,
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "Profile fetched successfully",
    user: req.user,
  });
});