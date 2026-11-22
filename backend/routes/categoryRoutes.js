const express = require("express");

const router = express.Router();

const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Pobieranie kategorii - dostępne dla wszystkich
router.get("/", getCategories);

// Dodawanie - editor i admin
router.post(
    "/",
    authenticateToken,
    authorizeRoles("editor", "admin"),
    createCategory
);

// Edycja - editor i admin
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("editor", "admin"),
    updateCategory
);

// Usuwanie - tylko admin
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteCategory
);

module.exports = router;