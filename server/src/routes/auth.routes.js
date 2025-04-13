const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const verifyToken = require("../middlewares/verifyToken");

// Check user role based on firebase_uid
router.get("/checkRole", authController.checkRole);
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

module.exports = router;
