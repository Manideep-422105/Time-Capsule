const express = require("express");
const { signup, login, googleAuth } = require("../controllers/AuthController");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// NEW Google Auth route
router.post("/google", googleAuth);

module.exports = router;
