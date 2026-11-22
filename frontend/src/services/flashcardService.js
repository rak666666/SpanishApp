const API_URL = "http://localhost:3000/flashcards";

async function sendRequest(url, options = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Wystąpił błąd");
    }

    return data;
}

export async function getFlashcards(categoryId) {
    const query = categoryId && categoryId !== "all"
        ? `?categoryId=${categoryId}`
        : "";

    return sendRequest(`${API_URL}${query}`);
}

export async function saveFlashcardProgress(wordId, known) {
    return sendRequest(`${API_URL}/progress`, {
        method: "POST",
        body: JSON.stringify({
            wordId,
            known
        })
    });
}