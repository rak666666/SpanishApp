
const express = require("express");
const router = express.Router();

const {
    getQuizWords,
    saveQuizResult,
    getQuizHistory
} = require("../controllers/quizController");

const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/words", authenticateToken, getQuizWords);
router.post("/results", authenticateToken, saveQuizResult);
router.get("/history", authenticateToken, getQuizHistory);

module.exports = router;
