import express, { Router } from "express";
import  JWT from "jsonwebtoken";
import protectRoute from "../middleware/auth.middleware.js";

import { addUsers,loginUser,getAllUsers,deleteUser,updateUser } from "../controllers/usersController.js";


const router = express.Router();
const generateToken = (userid) => {
  return JWT.sign({ userid }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

// Router to add users
router.post("/addusers/" ,protectRoute, addUsers);

// Router to login users
router.post("/login/", loginUser);

// Router to get All Users
router.get("/getallusers",  getAllUsers);

// Router to update a user
router.put("/updateuser/:userId",  updateUser);
// Router to delete a user
router.delete("/deleteuser/:userId",  deleteUser);

export default router;
