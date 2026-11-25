
const db = require("../config/db");

const getQuizWords = async (req, res) => {
    try {
        const { categoryId } = req.query;

        const [words] = await db.query(
            `SELECT
                id,
                spanish_word,
                polish_translation,
                category_id
             FROM words
             WHERE (? = 'all' OR category_id = ?)
             ORDER BY RAND()`,
            [categoryId || "all", categoryId || "all"]
        );

        res.json(words);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Błąd podczas pobierania słówek do quizu"
        });
    }
};

const saveQuizResult = async (req, res) => {
    let connection;
    let transactionStarted = false;

    try {
        const userId = req.user.id;
        const { score, totalQuestions, answers } = req.body;

        if (
            !Number.isInteger(score) ||
            !Number.isInteger(totalQuestions) ||
            totalQuestions <= 0 ||
            score < 0 ||
            score > totalQuestions ||
            !Array.isArray(answers)
        ) {
            return res.status(400).json({
                message: "Nieprawidłowe dane quizu"
            });
        }

        if (answers.length !== totalQuestions) {
            return res.status(400).json({
                message: "Liczba odpowiedzi nie zgadza się z liczbą pytań"
            });
        }

        for (const answer of answers) {
            if (
                !Number.isInteger(answer.wordId) ||
                answer.wordId <= 0 ||
                typeof answer.correct !== "boolean"
            ) {
                return res.status(400).json({
                    message: "Nieprawidłowe dane odpowiedzi"
                });
            }
        }

        const wordIds = answers.map(answer => answer.wordId);

        if (new Set(wordIds).size !== wordIds.length) {
            return res.status(400).json({
                message: "Quiz zawiera powtórzone słówka"
            });
        }

        const calculatedScore = answers.filter(
            answer => answer.correct
        ).length;

        if (score !== calculatedScore) {
            return res.status(400).json({
                message: "Wynik nie zgadza się z odpowiedziami"
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();
        transactionStarted = true;

        const placeholders = wordIds.map(() => "?").join(", ");

        const [words] = await connection.query(
            `SELECT id FROM words WHERE id IN (${placeholders})`,
            wordIds
        );

        if (words.length !== wordIds.length) {
            await connection.rollback();
            transactionStarted = false;

            return res.status(400).json({
                message: "Niektóre słówka nie istnieją"
            });
        }

        await connection.query(
            `INSERT INTO quiz_results
             (user_id, score, total_questions)
             VALUES (?, ?, ?)`,
            [userId, score, totalQuestions]
        );

        // Aktualizujemy postępy użytkownika
        for (const answer of answers) {
            const { wordId, correct } = answer;

            const [existing] = await connection.query(
                `SELECT id, correct_answers, wrong_answers
                 FROM user_progress
                 WHERE user_id = ? AND word_id = ?`,
                [userId, wordId]
            );

            if (existing.length === 0) {
                await connection.query(
                    `INSERT INTO user_progress
                     (user_id, word_id, correct_answers, wrong_answers, level)
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        userId,
                        wordId,
                        correct ? 1 : 0,
                        correct ? 0 : 1,
                        correct ? 1 : 0
                    ]
                );
            } else {
                const current = existing[0];

                const correctAnswers =
                    current.correct_answers + (correct ? 1 : 0);

                const wrongAnswers =
                    current.wrong_answers + (correct ? 0 : 1);

                const totalAnswers = correctAnswers + wrongAnswers;
                const accuracy = correctAnswers / totalAnswers;

                let level = 0;

                if (totalAnswers >= 3 && accuracy >= 0.9) {
                    level = 3;
                } else if (totalAnswers >= 2 && accuracy >= 0.75) {
                    level = 2;
                } else if (correctAnswers >= 1) {
                    level = 1;
                }

                await connection.query(
                    `UPDATE user_progress
                     SET correct_answers = ?,
                         wrong_answers = ?,
                         level = ?
                     WHERE id = ?`,
                    [
                        correctAnswers,
                        wrongAnswers,
                        level,
                        current.id
                    ]
                );
            }
        }

        await connection.commit();
        transactionStarted = false;

        res.json({
            message: "Wynik quizu został zapisany"
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await connection.rollback();
        }

        console.error(error);

        res.status(500).json({
            message: "Błąd podczas zapisywania wyniku quizu"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const getQuizHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const [history] = await db.query(
            `SELECT
                id,
                score,
                total_questions,
                ROUND(score / total_questions * 100) AS percentage,
                created_at
             FROM quiz_results
             WHERE user_id = ?
             ORDER BY created_at DESC, id DESC
             LIMIT 20`,
            [userId]
        );

        res.json(history);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Błąd podczas pobierania historii quizów"
        });
    }
};

module.exports = {
    getQuizWords,
    saveQuizResult,
    getQuizHistory
};
