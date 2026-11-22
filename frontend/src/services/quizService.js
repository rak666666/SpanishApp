
import API_URL from "./api";

const QUIZ_URL = `${API_URL}/quiz`;

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

    return sendRequest(`${QUIZ_URL}/words${query}`);
}

export async function saveQuizResult(score, totalQuestions, answers) {
    return sendRequest(`${QUIZ_URL}/results`, {
        method: "POST",
        body: JSON.stringify({
            score,
            totalQuestions,
            answers
        })
    });
}

export async function getQuizHistory() {
    return sendRequest(`${QUIZ_URL}/history`);
}
