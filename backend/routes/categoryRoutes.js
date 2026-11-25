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

router.get("/", getCategories);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("editor", "admin"),
    createCategory
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("editor", "admin"),
    updateCategory
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteCategory
);

module.exports = router;