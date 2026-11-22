
const express = require("express");

const router = express.Router();

const {
    getUsers,
    updateUserRole,
    deleteUser
} = require("../controllers/userController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Wszystkie operacje dostępne tylko dla administratora
router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin"),
    getUsers
);

router.put(
    "/:id/role",
    authenticateToken,
    authorizeRoles("admin"),
    updateUserRole
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteUser
);

module.exports = router;
