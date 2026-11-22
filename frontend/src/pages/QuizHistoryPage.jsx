
import { useEffect, useState } from "react";
import { getQuizHistory } from "../services/quizService";

function QuizHistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadHistory() {
            try {
                const data = await getQuizHistory();
                setHistory(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }

        loadHistory();
    }, []);

    if (loading) {
        return <main className="dashboard">Ładowanie historii...</main>;
    }

    if (error) {
        return <main className="dashboard">{error}</main>;
    }

    return (
        <main className="dashboard">
            <h1>Historia quizów</h1>

            {history.length === 0 ? (
                <p>Nie masz jeszcze żadnych ukończonych quizów.</p>
            ) : (
                <div className="learning-cards">
                    {history.map((quiz) => (
                        <div className="learning-card" key={quiz.id}>
                            <h3>
                                {quiz.score}/{quiz.total_questions}
                            </h3>

                            <p>
                                Wynik: {quiz.percentage}%
                            </p>

                            <p>
                                Data: {new Date(quiz.created_at).toLocaleString("pl-PL")}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

export default QuizHistoryPage;
