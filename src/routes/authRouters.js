import express from "express";
import JWT from "jsonwebtoken";
import protectRoute from "../middleware/auth.middleware.js";

import {
  addUsers,
  deleteUser,
  forgotPassword,
  getAllUsers,
  getUserById,
  loginUser,
  resetPassword,
  updateUser,
  updatePassword,
  sendLinkInEmail,
  verifyEmail
} from "../controllers/usersController.js";

const router = express.Router();
const generateToken = (userid) => {
  return JWT.sign({ userid }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

// Router to add users
router.post("/addusers", protectRoute, addUsers);

// Router to login users
router.post("/login", loginUser);

// Router to get All Users
router.get("/allusers", protectRoute,  getAllUsers);

// Router to get a user by ID
router.get("/user/:userId", protectRoute, getUserById);

// Router to update a user
router.put("/updateuser/:userId", protectRoute, updateUser);
// Router to delete a user
router.delete("/deleteuser/:userId", protectRoute, deleteUser);

// Router to forgot password
router.post("/forgot-password/", forgotPassword);

//Router to reset password
router.put("/reset-password/:userId/:token", resetPassword);

//Router to update password
router.put("/update-password/:userId",protectRoute, updatePassword);

//Router to verify email
router.get("/verify-email/:userId/:token", verifyEmail);

//Router to send link to email 
router.post("/send-link",protectRoute, sendLinkInEmail);


export default router;
