
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStatistics } from "../services/statisticsService";

function StatisticsPage() {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        async function loadStatistics() {
            try {
                const data = await getStatistics();
                setStatistics(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }

        loadStatistics();
    }, []);

    if (loading) {
        return <main className="dashboard">Ładowanie statystyk...</main>;
    }

    if (error) {
        return <main className="dashboard">{error}</main>;
    }

    const { quizzes, words } = statistics;

    return (
        <main className="dashboard">
            <h1>Twoje statystyki</h1>

            <section>
                <h2>Quizy</h2>

                <div className="learning-cards">
                    <div className="learning-card">
                        <h3>{quizzes.completed}</h3>
                        <p>Ukończone quizy</p>
                    </div>

                    <div className="learning-card">
                        <h3>{quizzes.accuracy}%</h3>
                        <p>Średnia poprawnych odpowiedzi</p>
                    </div>

                    <div className="learning-card">
                        <h3>{quizzes.correctAnswers}/{quizzes.totalQuestions}</h3>
                        <p>Poprawne odpowiedzi</p>
                    </div>
                </div>

                <button onClick={() => navigate("/quiz-history")}>
                    Zobacz historię quizów
                </button>
            </section>

            <section>
                <h2>Postęp słówek</h2>

                <div className="learning-cards">
                    <div className="learning-card">
                        <h3>{words.learned}</h3>
                        <p>Słówka, które ćwiczyłeś</p>
                    </div>

                    <div className="learning-card">
                        <h3>{words.correctAnswers}</h3>
                        <p>Poprawne odpowiedzi</p>
                    </div>

                    <div className="learning-card">
                        <h3>{words.wrongAnswers}</h3>
                        <p>Błędne odpowiedzi</p>
                    </div>
                </div>
            </section>

            <section>
                <h2>Poziomy znajomości słówek</h2>

                <div className="learning-cards">
                    <div className="learning-card">
                        <h3>{words.levels[0]}</h3>
                        <p>Nieznane</p>
                    </div>

                    <div className="learning-card">
                        <h3>{words.levels[1]}</h3>
                        <p>Początkujący</p>
                    </div>

                    <div className="learning-card">
                        <h3>{words.levels[2]}</h3>
                        <p>Średnio zaawansowany</p>
                    </div>

                    <div className="learning-card">
                        <h3>{words.levels[3]}</h3>
                        <p>Opanowane</p>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default StatisticsPage;
