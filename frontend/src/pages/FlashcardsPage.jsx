
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    getFlashcards,
    saveFlashcardProgress
} from "../services/flashcardService";
import ReturnButton from "../components/ReturnButton.jsx";

function FlashcardsPage() {
    const location = useLocation();
    const categoryId = location.state?.categoryId || "all";

    const [flashcards, setFlashcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadFlashcards() {
            try {
                const data = await getFlashcards(categoryId);
                setFlashcards(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }

        loadFlashcards();
    }, [categoryId]);

    async function handleAnswer(known) {
        const currentCard = flashcards[currentIndex];

        try {
            await saveFlashcardProgress(currentCard.id, known);

            const updatedCards = flashcards.filter(
                (card) => card.id !== currentCard.id
            );

            setFlashcards(updatedCards);
            setCurrentIndex(0);
            setShowAnswer(false);
        } catch (e) {
            setError(e.message);
        }
    }

    if (loading) {
        return <p>Ładowanie fiszek...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (flashcards.length === 0) {
        return (
            <main className="dashboard">
                <h1>Fiszki</h1>
                <p>Na ten moment nie ma słówek do powtórki!</p>
                <ReturnButton />
            </main>
        );
    }

    const currentCard = flashcards[currentIndex];

    return (
        <main className="dashboard">
            <h1>Fiszki</h1>

            <section className="flashcard">
                <h2>{currentCard.spanish_word}</h2>

            {currentCard.image_url ? (
                <div>
                    <img
                        src={currentCard.image_url}
                        alt={currentCard.spanish_word}
                        style={{
                            maxWidth: "200px",
                            maxHeight: "120px",
                            margin: "15px auto"
                        }}
                    />
                </div>
            ) : (
                <p>Brak obrazka dla tego słówka.</p>
            )}

                {showAnswer && (
                    <p>{currentCard.polish_translation}</p>
                )}

                <button onClick={() => setShowAnswer(!showAnswer)}>
                    {showAnswer ? "Ukryj odpowiedź" : "Pokaż odpowiedź"}
                </button>

                {showAnswer && (
                    <div>
                        <button onClick={() => handleAnswer(true)}>
                            Znam
                        </button>

                        <button onClick={() => handleAnswer(false)}>
                            Nie znam
                        </button>
                    </div>
                )}
            </section>

            <p>
                Pozostało fiszek: {flashcards.length}
            </p>

            <br />
            <br />

            <ReturnButton />
        </main>
    );
}

export default FlashcardsPage;
