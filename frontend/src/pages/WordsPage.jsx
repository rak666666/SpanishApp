
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getWords } from "../services/wordService";

function WordsPage() {
    const [words, setWords] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const location = useLocation();

    const categoryId = location.state?.categoryId || "all";

    useEffect(() => {
        async function loadWords() {
            try {
                const data = await getWords();
                setWords(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }

        loadWords();
    }, []);

    const filteredWords = categoryId === "all"
        ? words
        : words.filter((word) => word.category_id === categoryId);

    if (loading) {
        return <p>Ładowanie słówek...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <main className="dashboard">
            <h1>Słówka</h1>

            {filteredWords.length === 0 ? (
                <p>Nie znaleziono słówek w tej kategorii.</p>
            ) : (
                <div className="words-list">
                    {filteredWords.map((word) => (
                        <div className="word-card" key={word.id}>
                            <h3>{word.spanish_word}</h3>
                            <p>{word.polish_translation}</p>
                            <p>Kategoria: {word.category_name}</p>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

export default WordsPage;
