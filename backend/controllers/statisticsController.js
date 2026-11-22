
const db = require("../config/db");

const getStatistics = async (req, res) => {
    try {
        const userId = req.user.id;

        const [[quizStats]] = await db.query(
            `SELECT
                COUNT(*) AS completedQuizzes,
                COALESCE(SUM(score), 0) AS totalCorrect,
                COALESCE(SUM(total_questions), 0) AS totalQuestions
             FROM quiz_results
             WHERE user_id = ?`,
            [userId]
        );

        const [[wordStats]] = await db.query(
            `SELECT
                COUNT(*) AS learnedWords,
                COALESCE(SUM(correct_answers), 0) AS correctAnswers,
                COALESCE(SUM(wrong_answers), 0) AS wrongAnswers,
                SUM(CASE WHEN level = 0 THEN 1 ELSE 0 END) AS level0,
                SUM(CASE WHEN level = 1 THEN 1 ELSE 0 END) AS level1,
                SUM(CASE WHEN level = 2 THEN 1 ELSE 0 END) AS level2,
                SUM(CASE WHEN level = 3 THEN 1 ELSE 0 END) AS level3
             FROM user_progress
             WHERE user_id = ?`,
            [userId]
        );

        const accuracy = quizStats.totalQuestions > 0
            ? Math.round(
                (quizStats.totalCorrect / quizStats.totalQuestions) * 100
            )
            : 0;

        res.json({
            quizzes: {
                completed: quizStats.completedQuizzes,
                correctAnswers: quizStats.totalCorrect,
                totalQuestions: quizStats.totalQuestions,
                accuracy
            },
            words: {
                learned: wordStats.learnedWords,
                correctAnswers: wordStats.correctAnswers,
                wrongAnswers: wordStats.wrongAnswers,
                levels: {
                    0: wordStats.level0 || 0,
                    1: wordStats.level1 || 0,
                    2: wordStats.level2 || 0,
                    3: wordStats.level3 || 0
                }
            }
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Błąd podczas pobierania statystyk"
        });
    }
};

module.exports = {
    getStatistics
};
