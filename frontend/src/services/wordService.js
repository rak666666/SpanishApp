
import API_URL from "./api";

const WORDS_URL = `${API_URL}/words`;

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

export async function getWords() {
    return sendRequest(WORDS_URL);
}

export async function createWord(wordData) {
    return sendRequest(WORDS_URL, {
        method: "POST",
        body: JSON.stringify(wordData)
    });
}

export async function updateWord(id, wordData) {
    return sendRequest(`${WORDS_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(wordData)
    });
}

export async function deleteWord(id) {
    return sendRequest(`${WORDS_URL}/${id}`, {
        method: "DELETE"
    });
}

export async function uploadWordImage(id, image) {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("image", image);

    const response = await fetch(`${WORDS_URL}/${id}/image`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Nie udało się przesłać obrazka");
    }

    return data;
}
