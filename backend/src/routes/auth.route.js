import express from "express";
import {
  authUser,
  registerUser,
  allUsers,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(protect, allUsers);

router.route("/").post(registerUser);
router.post("/login", authUser);

export default router;
