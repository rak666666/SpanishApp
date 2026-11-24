
const express = require("express");

const router = express.Router();

const {
    getWords,
    createWord,
    updateWord,
    uploadWordImage,
    deleteWord
} = require("../controllers/wordController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

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

// Przesyłanie obrazka - editor i admin
router.post(
    "/:id/image",
    authenticateToken,
    authorizeRoles("editor", "admin"),
    upload.single("image"),
    uploadWordImage
);

// Usuwanie - tylko admin
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteWord
);

module.exports = router;
