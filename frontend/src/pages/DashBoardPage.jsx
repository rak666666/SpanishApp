
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../services/categoryService";

function DashBoardPage() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        async function loadCategories() {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (e) {
                setError(e.message);
            }
        }

        loadCategories();
    }, []);

    function openLearningPage(path) {
        navigate(path, {
            state: {
                categoryId: selectedCategory
            }
        });
    }

    return (
        <main className="dashboard">
            <section className="welcome-section">
                <h1>Rozpocznij naukę hiszpańskiego</h1>
                <p>Wybierz kategorię i rozpocznij naukę.</p>
            </section>

            <section className="category-section">
                <h2>Wybierz kategorię</h2>

                <div className="category-list">
                    <button
                        className={selectedCategory === "all" ? "active" : ""}
                        onClick={() => setSelectedCategory("all")}
                    >
                        Wszystkie
                    </button>

                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className={
                                selectedCategory === category.id ? "active" : ""
                            }
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {error && <p className="error-message">{error}</p>}
            </section>

            <section className="learning-section">
                <h2>Wybierz sposób nauki</h2>

                <div className="learning-cards">
                    <div className="learning-card">
                        <h3>Fiszki</h3>
                        <p>
                            Ucz się nowych słówek i powtarzaj te,
                            które już znasz.
                        </p>
                        <button onClick={() => openLearningPage("/flashcards")}>
                            Rozpocznij naukę
                        </button>
                    </div>

                    <div className="learning-card">
                        <h3>Quizy</h3>
                        <p>
                            Sprawdź swoją wiedzę i przekonaj się,
                            ile już pamiętasz.
                        </p>
                        <button onClick={() => openLearningPage("/quiz")}>
                            Rozpocznij quiz
                        </button>
                    </div>
                </div>

                <div className="word-list-link">
                    <Link
                        to="/words"
                        state={{ categoryId: selectedCategory }}
                    >
                        Zobacz listę słówek →
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default DashBoardPage;
