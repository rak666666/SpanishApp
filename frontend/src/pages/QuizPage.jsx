
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
    getQuizWords,
    saveQuizResult
} from "../services/quizService";
import ReturnButton from "../components/ReturnButton";

function normalizeExact(text) {
    return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeWithoutAccents(text) {
    return normalizeExact(text)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ł/g, "l");
}

function evaluateAnswer(userAnswer, correctAnswer, allowMissingArticle, isSpanish) {
    let expected = correctAnswer.trim();
    const user = userAnswer.trim();
    let missingArticle = false;

    const articleMatch = expected.match(/^(el|la|los|las)\s+/i);
    const userArticle = user.match(/^(el|la|los|las)\s+/i);

    if (allowMissingArticle && articleMatch && !userArticle) {
        const withoutArticle = expected.replace(/^(el|la|los|las)\s+/i, "");

        if (
            normalizeWithoutAccents(user) ===
            normalizeWithoutAccents(withoutArticle)
        ) {
            expected = withoutArticle;
            missingArticle = true;
        }
    } else if (
        allowMissingArticle &&
        articleMatch &&
        userArticle &&
        articleMatch[1].toLowerCase() !== userArticle[1].toLowerCase()
    ) {
        return {
            correct: false,
            message: `Niepoprawna odpowiedź. Prawidłowo: ${correctAnswer}`
        };
    }

    const withoutAccents =
        normalizeWithoutAccents(user) ===
        normalizeWithoutAccents(expected);

    if (!withoutAccents) {
        return {
            correct: false,
            message: `Niepoprawna odpowiedź. Prawidłowo: ${correctAnswer}`
        };
    }

    if (!isSpanish) {
        return {
            correct: true,
            message: "Poprawna odpowiedź!"
        };
    }

    const accentMissing =
        normalizeExact(user) !== normalizeExact(expected);

    if (missingArticle && accentMissing) {
        return {
            correct: true,
            message: `Odpowiedź poprawna! Pamiętaj o akcencie i rodzajniku. Poprawna forma: ${correctAnswer}`
        };
    }

    if (missingArticle) {
        return {
            correct: true,
            message: `Odpowiedź poprawna! Pamiętaj o rodzajniku. Poprawna forma: ${correctAnswer}`
        };
    }

    if (accentMissing) {
        return {
            correct: true,
            message: `Odpowiedź poprawna! Pamiętaj o akcencie. Poprawna forma: ${correctAnswer}`
        };
    }

    return {
        correct: true,
        message: "Poprawna odpowiedź!"
    };
}

function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function buildQuestionOptions(currentWord, words, direction) {
    if (!currentWord) return [];

    const correctAnswer = direction === "es-pl"
        ? currentWord.polish_translation
        : currentWord.spanish_word;

    const otherAnswers = words
        .filter((word) => word.id !== currentWord.id)
        .map((word) => direction === "es-pl"
            ? word.polish_translation
            : word.spanish_word
        );

    const shuffledOptions = shuffleArray(otherAnswers).slice(0, 3);

    return shuffleArray([correctAnswer, ...shuffledOptions]);
}

function QuizPage() {
    const location = useLocation();
    const categoryId = location.state?.categoryId || "all";

    const [words, setWords] = useState([]);
    const [direction, setDirection] = useState("");
    const [quizType, setQuizType] = useState("");

    const [quizWords, setQuizWords] = useState([]);
    const [questionOptions, setQuestionOptions] = useState([]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);

    const [answer, setAnswer] = useState("");
    const [selectedAnswer, setSelectedAnswer] = useState("");

    const [quizAnswers, setQuizAnswers] = useState([]);

    const [checked, setChecked] = useState(false);
    const [finished, setFinished] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [feedbackMessage, setFeedbackMessage] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadWords() {
            try {
                const data = await getQuizWords(categoryId);
                setWords(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }

        loadWords();
    }, [categoryId]);

    function startQuiz() {
        const shuffled = shuffleArray(words);
        const selectedWords = shuffled.slice(0, 10);

        setQuizWords(selectedWords);
        setQuestionOptions(
            buildQuestionOptions(selectedWords[0], words, direction)
        );

        setCurrentIndex(0);
        setScore(0);
        setAnswer("");
        setSelectedAnswer("");
        setQuizAnswers([]);

        setChecked(false);
        setFinished(false);
        setSaving(false);
        setSaveError("");
        setFeedbackMessage("");
    }

    function checkAnswer() {
        if (checked) return;

        const currentWord = quizWords[currentIndex];

        const correctAnswer = direction === "es-pl"
            ? currentWord.polish_translation
            : currentWord.spanish_word;

        const userAnswer = quizType === "typing"
            ? answer
            : selectedAnswer;

        const result = evaluateAnswer(
            userAnswer,
            correctAnswer,
            direction === "pl-es" && quizType === "typing",
            direction === "pl-es"
        );

        if (result.correct) {
            setScore((prev) => prev + 1);
        }

        setQuizAnswers((prev) => [
            ...prev,
            {
                wordId: currentWord.id,
                correct: result.correct
            }
        ]);

        setFeedbackMessage(result.message);
        setChecked(true);
    }

    async function finishQuiz() {
        setSaving(true);
        setSaveError("");

        const finalScore = score;

        try {
            await saveQuizResult(
                finalScore,
                quizWords.length,
                quizAnswers
            );

            setFinished(true);
        } catch (e) {
            setSaveError(e.message);
        } finally {
            setSaving(false);
        }
    }

    async function nextQuestion() {
        if (currentIndex + 1 >= quizWords.length) {
            await finishQuiz();
            return;
        }

        const nextIndex = currentIndex + 1;

        setCurrentIndex(nextIndex);
        setQuestionOptions(
            buildQuestionOptions(quizWords[nextIndex], words, direction)
        );

        setAnswer("");
        setSelectedAnswer("");
        setChecked(false);
        setFeedbackMessage("");
    }

    function resetQuiz() {
        setDirection("");
        setQuizType("");
        setQuizWords([]);
        setQuestionOptions([]);
        setQuizAnswers([]);

        setCurrentIndex(0);
        setScore(0);

        setAnswer("");
        setSelectedAnswer("");

        setChecked(false);
        setFinished(false);
        setSaving(false);
        setSaveError("");
        setFeedbackMessage("");
    }

    if (loading) {
        return <p>Ładowanie quizu...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (words.length === 0) {
        return (
            <main className="dashboard">
                <h1>Quizy</h1>
                <p>Brak słówek w wybranej kategorii.</p>
            </main>
        );
    }

    const currentWord = quizWords[currentIndex];

    const question = currentWord
        ? direction === "es-pl"
            ? currentWord.spanish_word
            : currentWord.polish_translation
        : "";

    return (
        <main className="dashboard">
            <h1>Quizy</h1>

            {!direction ? (
                <section>
                    <h2>Wybierz kierunek tłumaczenia</h2>

                    <button onClick={() => setDirection("es-pl")}>
                        Hiszpański → Polski
                    </button>

                    <button onClick={() => setDirection("pl-es")}>
                        Polski → Hiszpański
                    </button> <br /> <br />
                    <ReturnButton />
                </section>
            ) : !quizType ? (
                <section>
                    <h2>
                        {direction === "es-pl"
                            ? "Hiszpański → Polski"
                            : "Polski → Hiszpański"}
                    </h2>

                    <h2>Wybierz sposób odpowiadania</h2>

                    <button onClick={() => setQuizType("typing")}>
                        Wpisywanie odpowiedzi
                    </button>

                    <button onClick={() => setQuizType("choice")}>
                        Wybór odpowiedzi
                    </button>

                    <button onClick={() => setDirection("")}>
                        Zmień kierunek
                    </button><br /><br />
                    <ReturnButton />
                </section>
            ) : quizWords.length === 0 ? (
                <section>
                    <h2>Gotowy do quizu?</h2>
                    <p>Liczba pytań: {Math.min(words.length, 10)}</p>

                    <button onClick={startQuiz}>
                        Rozpocznij quiz
                    </button>

                    <button onClick={() => setQuizType("")}>
                        Zmień sposób odpowiadania
                    </button><br /><br />
                    <ReturnButton />
                </section>
            ) : finished ? (
                <section>
                    <h2>Koniec quizu!</h2>

                    <h3>
                        Twój wynik: {score}/{quizWords.length}
                    </h3>

                    <p>
                        {Math.round((score / quizWords.length) * 100)}% poprawnych odpowiedzi
                    </p>

                    <button onClick={startQuiz}>
                        Zagraj ponownie
                    </button>

                    <button onClick={resetQuiz}>
                        Wróć do wyboru trybu
                    </button><br /><br />
                    <ReturnButton />
                </section>
            ) : (
                <section>
                    <p>
                        Pytanie {currentIndex + 1} z {quizWords.length}
                    </p>

                    <h2>{question}</h2>

                    {quizType === "typing" ? (
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Wpisz tłumaczenie..."
                            disabled={checked}
                        />
                    ) : (
                        <div>
                            {questionOptions.map((option, index) => (
                                <button
                                    className="QuizAnswers"
                                    key={index}
                                    onClick={() => setSelectedAnswer(option)}
                                    disabled={checked}
                                    style={{
                                        backgroundColor: selectedAnswer === option
                                            ? "#8b442d"
                                            : undefined
                                    }}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}

                    {!checked ? (
                        <button
                            onClick={checkAnswer}
                            disabled={
                                quizType === "typing"
                                    ? !answer.trim()
                                    : !selectedAnswer
                            }
                        >
                            Sprawdź odpowiedź
                        </button>
                    ) : (
                        <div>
                            <p>{feedbackMessage}</p>

                            {saveError && (
                                <p className="error-message">{saveError}</p>
                            )}

                            <button
                                onClick={nextQuestion}
                                disabled={saving}
                            >
                                {saving
                                    ? "Zapisywanie wyniku..."
                                    : currentIndex + 1 === quizWords.length
                                        ? "Zakończ quiz"
                                        : "Następne pytanie"}
                            </button>

                            {saveError && currentIndex + 1 === quizWords.length && (
                                <button
                                    onClick={finishQuiz}
                                    disabled={saving}
                                >
                                    Spróbuj zapisać ponownie
                                </button>
                            )}
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}

export default QuizPage;
