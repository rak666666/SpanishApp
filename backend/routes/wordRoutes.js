const express = require("express");

const router = express.Router();

const {
    getWords,
    createWord,
    updateWord,
    deleteWord
} = require("../controllers/wordController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Pobieranie słówek - dostępne dla wszystkich
router.get("/", getWords);

// Dodawanie - editor i admin
router.post(
    "/",
    authenticateToken,
    authorizeRoles("editor", "admin"),
    createWord
);

// Edycja - editor i admin
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("editor", "admin"),
    updateWord
);

// Usuwanie - tylko admin
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteWord
);

module.exports = router;