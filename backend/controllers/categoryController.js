const db = require("../config/db");

// Pobieranie kategorii
const getCategories = async (req, res) => {
    try {
        const [categories] = await db.query(
            "SELECT * FROM categories"
        );

        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Błąd podczas pobierania kategorii"
        });
    }
};

// Dodawanie kategorii
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Nazwa kategorii jest wymagana"
            });
        }

        const [result] = await db.query(
            "INSERT INTO categories (name, description) VALUES (?, ?)",
            [name.trim(), description || null]
        );

        res.status(201).json({
            message: "Kategoria została dodana",
            id: result.insertId
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Taka kategoria już istnieje"
            });
        }

        res.status(500).json({
            message: "Błąd podczas dodawania kategorii"
        });
    }
};

// Edycja kategorii
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Nazwa kategorii jest wymagana"
            });
        }

        const [existing] = await db.query(
            "SELECT id FROM categories WHERE id = ?",
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                message: "Nie znaleziono kategorii"
            });
        }

        await db.query(
            `UPDATE categories
             SET name = ?, description = ?
             WHERE id = ?`,
            [name.trim(), description || null, id]
        );

        res.json({
            message: "Kategoria została zaktualizowana"
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Taka kategoria już istnieje"
            });
        }

        res.status(500).json({
            message: "Błąd podczas edycji kategorii"
        });
    }
};

// Usuwanie kategorii
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM categories WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Nie znaleziono kategorii"
            });
        }

        res.json({
            message: "Kategoria została usunięta"
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                message: "Nie można usunąć kategorii, ponieważ zawiera przypisane słówka"
            });
        }

        res.status(500).json({
            message: "Błąd podczas usuwania kategorii"
        });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};