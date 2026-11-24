
const db = require("../config/db");

const getFlashcards = async (req, res) => {
    try {
        const userId = req.user.id;
        const { categoryId } = req.query;

        const [words] = await db.query(
            `SELECT 
                words.id,
                words.spanish_word,
                words.polish_translation,
                words.category_id,
                files.storage_path AS image_url,
                COALESCE(flashcard_progress.repetition_level, 0) AS level,
                flashcard_progress.next_review_at
            FROM words
            LEFT JOIN files
                ON words.image_id = files.id
            LEFT JOIN flashcard_progress
                ON words.id = flashcard_progress.word_id
                AND flashcard_progress.user_id = ?
            WHERE (
                flashcard_progress.next_review_at IS NULL
                OR flashcard_progress.next_review_at <= NOW()
            )
            AND (? = 'all' OR words.category_id = ?)
            ORDER BY 
                COALESCE(flashcard_progress.repetition_level, 0) ASC,
                RAND()`,
            [userId, categoryId || "all", categoryId || "all"]
        );

        res.json(words);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Błąd podczas pobierania fiszek"
        });
    }
};

const updateFlashcardProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { wordId, known } = req.body;

        if (
            !Number.isInteger(wordId) ||
            wordId <= 0 ||
            typeof known !== "boolean"
        ) {
            return res.status(400).json({
                message: "Nieprawidłowe dane"
            });
        }

        const [existing] = await db.query(
            `SELECT repetition_level AS level
             FROM flashcard_progress
             WHERE user_id = ? AND word_id = ?`,
            [userId, wordId]
        );

        let newLevel = known ? 1 : 0;

        if (existing.length > 0) {
            newLevel = known
                ? Math.min(existing[0].level + 1, 3)
                : Math.max(existing[0].level - 1, 0);
        }

        const intervals = [0, 1, 3, 7];
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + intervals[newLevel]);

        await db.query(
            `INSERT INTO flashcard_progress
                (user_id, word_id, repetition_level, next_review_at, last_reviewed_at)
             VALUES (?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE
                repetition_level = VALUES(repetition_level),
                next_review_at = VALUES(next_review_at),
                last_reviewed_at = NOW()`,
            [userId, wordId, newLevel, nextReview]
        );

        res.json({
            message: "Postęp fiszki został zapisany",
            level: newLevel
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Błąd podczas zapisywania postępu fiszki"
        });
    }
};

module.exports = {
    getFlashcards,
    updateFlashcardProgress
};
