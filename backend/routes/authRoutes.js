const express = require("express");

const router = express.Router();

const {
    register,
    login
} = require("../controllers/authController");

// Rejestracja użytkownika
router.post("/register", register);

//Logowanie użytkownika
router.post("/login", login)

module.exports = router;