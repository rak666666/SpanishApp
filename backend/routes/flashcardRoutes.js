const express = require("express");
const router = express.Router();

const { 
    getFlashcards,
    updateFlashcardProgress 
} = require("../controllers/flashcardController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

router.get("/", authenticateToken, getFlashcards);
router.post("/progress", authenticateToken, updateFlashcardProgress);

module.exports = router;