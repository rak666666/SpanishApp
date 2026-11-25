const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (
            typeof username !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !username.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Wszystkie pola są wymagane"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Hasło musi mieć co najmniej 8 znaków"
            });
        }

        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            [username.trim(), email.trim()]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Użytkownik o takiej nazwie lub emailu już istnieje"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Dodawanie użytkownika
        const [result] = await db.query(
            `INSERT INTO users
            (username, email, password_hash, role_id)
            VALUES (?, ?, ?, ?)`,
            [
                username.trim(),
                email.trim(),
                passwordHash,
                1
            ]
        );

        res.status(201).json({
            message: "Konto zostało utworzone",
            userId: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Błąd podczas rejestracji"
        });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email i hasło są wymagane"
            });
        }

        const [users] = await db.query(
            `SELECT
                users.id,
                users.username,
                users.email,
                users.password_hash,
                roles.name AS role
            FROM users
            JOIN roles ON users.role_id = roles.id
            WHERE users.email = ?`,
            [email.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Nieprawidłowy email lub hasło"
            });
        }

        const user = users[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Nieprawidłowy email lub hasło"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        res.json({
            message: "Zalogowano pomyślnie",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Błąd podczas logowania"
        });
    }
};

module.exports = {
    register,
    login
};