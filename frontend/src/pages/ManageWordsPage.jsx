
import { useCallback, useEffect, useState } from "react";

import {
    getWords,
    createWord,
    updateWord,
    deleteWord,
    uploadWordImage
} from "../services/wordService";

import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../services/categoryService";

import ReturnButton from "../components/ReturnButton";

function ManageWordsPage() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const isAdmin = user.role === "admin";

    const [activeTab, setActiveTab] = useState("words");

    const [words, setWords] = useState([]);
    const [categories, setCategories] = useState([]);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    // Formularz słówek
    const [spanishWord, setSpanishWord] = useState("");
    const [polishTranslation, setPolishTranslation] = useState("");
    const [wordCategoryId, setWordCategoryId] = useState("");
    const [editingWordId, setEditingWordId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Formularz kategorii
    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState(null);

    const loadData = useCallback(async () => {
        try {
            const [wordsData, categoriesData] = await Promise.all([
                getWords(),
                getCategories()
            ]);

            setWords(wordsData);
            setCategories(categoriesData);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Dodawanie i edytowanie słówek
    async function handleWordSubmit(e) {
        e.preventDefault();

        setError("");
        setMessage("");

        const wordData = {
            spanish_word: spanishWord,
            polish_translation: polishTranslation,
            category_id: Number(wordCategoryId)
        };

        try {
            let wordId = editingWordId;

            if (editingWordId) {
                await updateWord(editingWordId, wordData);
                setMessage("Słówko zostało zaktualizowane.");
            } else {
                const result = await createWord(wordData);
                wordId = result.id;
                setMessage("Słówko zostało dodane.");
            }

            if (selectedImage) {
                setUploadingImage(true);
                await uploadWordImage(wordId, selectedImage);
                setMessage("Słówko i obrazek zostały zapisane.");
            }

            resetWordForm();
            await loadData();
        } catch (e) {
            setError(e.message);
        } finally {
            setUploadingImage(false);
        }
    }

    function resetWordForm() {
        setSpanishWord("");
        setPolishTranslation("");
        setWordCategoryId("");
        setEditingWordId(null);
        setSelectedImage(null);
    }

    function handleWordEdit(word) {
            console.log("Edytowane słówko:", word);
    console.log("ID kategorii:", word.category_id)
        setSpanishWord(word.spanish_word);
        setPolishTranslation(word.polish_translation);
        setWordCategoryId(String(word.category_id));
        setEditingWordId(word.id);
        setSelectedImage(null);
    }

    async function handleWordDelete(id) {
        if (!window.confirm("Czy na pewno chcesz usunąć to słówko?")) {
            return;
        }

        setError("");
        setMessage("");

        try {
            await deleteWord(id);
            setMessage("Słówko zostało usunięte.");

            if (editingWordId === id) {
                resetWordForm();
            }

            await loadData();
        } catch (e) {
            setError(e.message);
        }
    }

    // Dodawanie i edytowanie kategorii
    async function handleCategorySubmit(e) {
        e.preventDefault();

        setError("");
        setMessage("");

        const categoryData = {
            name: categoryName,
            description: categoryDescription
        };

        try {
            if (editingCategoryId) {
                await updateCategory(editingCategoryId, categoryData);
                setMessage("Kategoria została zaktualizowana.");
            } else {
                await createCategory(categoryData);
                setMessage("Kategoria została dodana.");
            }

            resetCategoryForm();
            await loadData();
        } catch (e) {
            setError(e.message);
        }
    }

    function resetCategoryForm() {
        setCategoryName("");
        setCategoryDescription("");
        setEditingCategoryId(null);
    }

    function handleCategoryEdit(category) {
        setCategoryName(category.name);
        setCategoryDescription(category.description || "");
        setEditingCategoryId(category.id);
    }

    async function handleCategoryDelete(id) {
        if (!window.confirm("Czy na pewno chcesz usunąć tę kategorię?")) {
            return;
        }

        setError("");
        setMessage("");

        try {
            await deleteCategory(id);
            setMessage("Kategoria została usunięta.");

            if (editingCategoryId === id) {
                resetCategoryForm();
            }

            await loadData();
        } catch (e) {
            setError(e.message);
        }
    }

    if (loading) {
        return <p>Ładowanie...</p>;
    }

    return (
        <main className="dashboard">
            <ReturnButton />

            <h1>Zarządzanie</h1>

            <div className="management-tabs">
                <button
                    className={activeTab === "words" ? "active" : ""}
                    onClick={() => setActiveTab("words")}
                >
                    Słówka
                </button>

                <button
                    className={activeTab === "categories" ? "active" : ""}
                    onClick={() => setActiveTab("categories")}
                >
                    Kategorie
                </button>
            </div>

            {error && <p>{error}</p>}
            {message && <p>{message}</p>}

            {activeTab === "words" && (
                <section>
                    <h2>
                        {editingWordId ? "Edytuj słówko" : "Dodaj słówko"}
                    </h2>

                    <form onSubmit={handleWordSubmit}>
                        <label>Hiszpańskie słówko</label>
                        <input
                            type="text"
                            value={spanishWord}
                            onChange={(e) => setSpanishWord(e.target.value)}
                            required
                        />

                        <label>Polskie tłumaczenie</label>
                        <input
                            type="text"
                            value={polishTranslation}
                            onChange={(e) => setPolishTranslation(e.target.value)}
                            required
                        />

                        <label>Kategoria</label>
                        <select
                            value={wordCategoryId}
                            onChange={(e) => setWordCategoryId(e.target.value)}
                            required
                        >
                            <option value="">Wybierz kategorię</option>

                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <label>Obrazek</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                setSelectedImage(e.target.files[0] || null);
                            }}
                        />

                        {selectedImage && (
                            <p>Wybrany plik: {selectedImage.name}</p>
                        )}

                        <button type="submit" disabled={uploadingImage}>
                            {uploadingImage
                                ? "Przesyłanie obrazka..."
                                : editingWordId
                                    ? "Zapisz zmiany"
                                    : "Dodaj słówko"}
                        </button>

                        {editingWordId && (
                            <button type="button" onClick={resetWordForm}>
                                Anuluj
                            </button>
                        )}
                    </form>

                    <h2>Lista słówek</h2>
                    
                    {words.length === 0 ? (
                        <p>Nie ma jeszcze żadnych słówek.</p>
                    ) : (
                        <div className="word-cards">
                        {words.map((word) => (
                            <div className="word-card" key={word.id}>
                                {word.image_url && (
                                    <img
                                        className="WordImage"
                                        src={word.image_url}
                                        alt={word.spanish_word}
                                        style={{
                                            width: "150px",
                                            height: "120px",
                                            objectFit: "cover"
                                        }}
                                    />
                                )}

                                <h3>{word.spanish_word}</h3>
                                <p>{word.polish_translation}</p>
                                <p>Kategoria: {word.category_name}</p>

                                <button onClick={() => handleWordEdit(word)}>
                                    Edytuj
                                </button>

                                {isAdmin && (
                                    <button onClick={() => handleWordDelete(word.id)}>
                                        Usuń
                                    </button>
                                )}
                            </div>
                        ))} </div>
                    )}
                </section>
            )}

            {activeTab === "categories" && (
                <section>
                    <h2>
                        {editingCategoryId
                            ? "Edytuj kategorię"
                            : "Dodaj kategorię"}
                    </h2>

                    <form onSubmit={handleCategorySubmit}>
                        <label>Nazwa kategorii</label>
                        <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            required
                        />

                        <label>Opis kategorii</label>
                        <textarea
                            value={categoryDescription}
                            onChange={(e) => setCategoryDescription(e.target.value)}
                        />

                        <button type="submit">
                            {editingCategoryId
                                ? "Zapisz zmiany"
                                : "Dodaj kategorię"}
                        </button>

                        {editingCategoryId && (
                            <button type="button" onClick={resetCategoryForm}>
                                Anuluj
                            </button>
                        )}
                    </form>

                    <h2>Lista kategorii</h2>

                    {categories.length === 0 ? (
                        <p>Nie ma jeszcze żadnych kategorii.</p>
                    ) : (
                        categories.map((category) => (
                            <div className="category-card" key={category.id}>
                                <h3>{category.name}</h3>
                                <p>{category.description}</p>

                                <button onClick={() => handleCategoryEdit(category)}>
                                    Edytuj
                                </button>

                                {isAdmin && (
                                    <button
                                        onClick={() => handleCategoryDelete(category.id)}
                                    >
                                        Usuń
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </section>
            )}
        </main>
    );
}

export default ManageWordsPage;
