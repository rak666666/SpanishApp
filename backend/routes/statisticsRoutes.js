
const express = require("express");
const router = express.Router();

const {
    getStatistics
} = require("../controllers/statisticsController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

router.get("/", authenticateToken, getStatistics);

module.exports = router;
