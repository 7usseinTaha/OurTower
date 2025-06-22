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
} from "../controllers/usersController.js";

const router = express.Router();
const generateToken = (userid) => {
  return JWT.sign({ userid }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

// Router to add users
router.post("/addusers/",protectRoute, addUsers);

// Router to login users
router.post("/login/", loginUser);

// Router to get All Users
router.get("/allusers", protectRoute, getAllUsers);

// Router to get a user by ID
router.get("/user/:userId", protectRoute, getUserById);

// Router to update a user
router.put("/updateuser/:userId", protectRoute, updateUser);
// Router to delete a user
router.delete("/deleteuser/:userId", protectRoute, deleteUser);

// Router to forgot password
router.post("/forgotpassword/", forgotPassword);

//Router to reset password
router.put("/reset-password/:token", resetPassword);



export default router;
