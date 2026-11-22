const db = require("../config/db");

// Pobieranie wszystkich słówek
const getWords = async (req, res) => {
    try {
        const [words] = await db.query(
            `SELECT 
                words.id,
                words.spanish_word,
                words.polish_translation,
                categories.name AS category_name
            FROM words
            JOIN categories ON words.category_id = categories.id`
        );

        res.json(words);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Błąd podczas pobierania słówek"
        });
    }
};

    //Dodawanie słówek
    const createWord = async (req, res) => {
    try {
        const {
            spanish_word,
            polish_translation,
            category_id
        } = req.body;

        if (
            !spanish_word?.trim() ||
            !polish_translation?.trim() ||
            !category_id
        ) {
            return res.status(400).json({
                message: "Wszystkie pola są wymagane"
            });
        }

        const [result] = await db.query(
            `INSERT INTO words
            (spanish_word, polish_translation, category_id)
            VALUES (?, ?, ?)`,
            [
                spanish_word.trim(),
                polish_translation.trim(),
                category_id
            ]
        );

        res.status(201).json({
            message: "Słówko zostało dodane",
            id: result.insertId
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                message: "Podana kategoria nie istnieje"
            });
        }

        res.status(500).json({
            message: "Błąd podczas dodawania słówka"
        });
    }
};

    //Edytowanie słówek
    const updateWord = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            spanish_word,
            polish_translation,
            category_id
        } = req.body;

        if (
            !spanish_word?.trim() ||
            !polish_translation?.trim() ||
            !category_id
        ) {
            return res.status(400).json({
                message: "Wszystkie pola są wymagane"
            });
        }

        const [result] = await db.query(
            `UPDATE words
            SET spanish_word = ?,
                polish_translation = ?,
                category_id = ?
            WHERE id = ?`,
            [
                spanish_word.trim(),
                polish_translation.trim(),
                category_id,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Nie znaleziono słówka"
            });
        }

        res.json({
            message: "Słówko zostało zaktualizowane"
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                message: "Podana kategoria nie istnieje"
            });
        }

        res.status(500).json({
            message: "Błąd podczas edycji słówka"
        });
    }
};

    //Usuwanie słówek
    const deleteWord = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM words WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Nie znaleziono słówka"
            });
        }

        res.json({
            message: "Słówko zostało usunięte"
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                message: "Nie można usunąć słówka, ponieważ ma powiązane dane"
            });
        }

        res.status(500).json({
            message: "Błąd podczas usuwania słówka"
        });
    }
};

module.exports = {
    getWords,
    createWord,
    updateWord,
    deleteWord
};