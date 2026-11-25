
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Brak tokenu. Zaloguj się."
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(403).json({
            message: "Nieprawidłowy lub wygasły token"
        });
    }

    try {
        const [users] = await db.query(
            `SELECT users.id, roles.name AS role
             FROM users
             JOIN roles ON users.role_id = roles.id
             WHERE users.id = ?`,
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Konto użytkownika nie istnieje"
            });
        }

        
        req.user = {
            id: users[0].id,
            role: users[0].role
        };

        next();
    } catch (error) {
        console.error("Błąd uwierzytelniania:", error);

        return res.status(500).json({
            message: "Błąd podczas sprawdzania użytkownika"
        });
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Nie masz uprawnień do wykonania tej operacji"
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};
