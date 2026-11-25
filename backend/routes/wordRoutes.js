
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

router.get("/", getWords);

router.post(
    "/",
    authenticateToken,
    authorizeRoles("editor", "admin"),
    createWord
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("editor", "admin"),
    updateWord
);

router.post(
    "/:id/image",
    authenticateToken,
    authorizeRoles("editor", "admin"),
    upload.single("image"),
    uploadWordImage
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("admin"),
    deleteWord
);

module.exports = router;
