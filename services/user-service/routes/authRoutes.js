import express from "express";

import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  registerValidation,
  loginValidation,
} from "../validations/authValidation.js";

const router = express.Router();

router.post(
  "/register",
  registerValidation,
  registerUser
);

router.post(
  "/login",
  loginValidation,
  loginUser
);

router.get(
  "/profile",
  authMiddleware,
  getProfile
);

export default router;