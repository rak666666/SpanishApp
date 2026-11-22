
const API_URL = "http://localhost:3000/quiz";

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

export async function getQuizWords(categoryId) {
    const query = categoryId && categoryId !== "all"
        ? `?categoryId=${categoryId}`
        : "";

    return sendRequest(`${API_URL}/words${query}`);
}

export async function saveQuizResult(score, totalQuestions, answers) {
    return sendRequest(`${API_URL}/results`, {
        method: "POST",
        body: JSON.stringify({
            score,
            totalQuestions,
            answers
        })
    });
}

export async function getQuizHistory() {
    return sendRequest(`${API_URL}/history`);
}

