
const db = require("../config/db");

const getUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT
                users.id,
                users.username,
                users.email,
                users.created_at,
                roles.name AS role
             FROM users
             JOIN roles ON users.role_id = roles.id
             ORDER BY users.id ASC`
        );

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Błąd podczas pobierania użytkowników"
        });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const { role } = req.body;

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                message: "Nieprawidłowe ID użytkownika"
            });
        }

        if (!["user", "editor", "admin"].includes(role)) {
            return res.status(400).json({
                message: "Nieprawidłowa rola"
            });
        }

        if (userId === req.user.id) {
            return res.status(400).json({
                message: "Nie możesz zmienić własnej roli"
            });
        }

        const [roles] = await db.query(
            "SELECT id FROM roles WHERE name = ?",
            [role]
        );

        if (roles.length === 0) {
            return res.status(400).json({
                message: "Nie znaleziono takiej roli"
            });
        }

        const [result] = await db.query(
            "UPDATE users SET role_id = ? WHERE id = ?",
            [roles[0].id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Nie znaleziono użytkownika"
            });
        }

        res.json({
            message: "Rola użytkownika została zmieniona"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Błąd podczas zmiany roli"
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = Number(req.params.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                message: "Nieprawidłowe ID użytkownika"
            });
        }

        if (userId === req.user.id) {
            return res.status(400).json({
                message: "Nie możesz usunąć własnego konta"
            });
        }

        const [result] = await db.query(
            "DELETE FROM users WHERE id = ?",
            [userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Nie znaleziono użytkownika"
            });
        }

        res.json({
            message: "Użytkownik został usunięty"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Błąd podczas usuwania użytkownika"
        });
    }
};

module.exports = {
    getUsers,
    updateUserRole,
    deleteUser
};
