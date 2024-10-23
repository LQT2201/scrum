const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// Route for user login
router.post("/login", authController.login);

// Route for user registration
router.post("/register", authController.register);

module.exports = router;
