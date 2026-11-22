
const API_URL = "http://localhost:3000/categories";

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

export async function getCategories() {
    return sendRequest(API_URL);
}

export async function createCategory(categoryData) {
    return sendRequest(API_URL, {
        method: "POST",
        body: JSON.stringify(categoryData)
    });
}

export async function updateCategory(id, categoryData) {
    return sendRequest(`${API_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(categoryData)
    });
}

export async function deleteCategory(id) {
    return sendRequest(`${API_URL}/${id}`, {
        method: "DELETE"
    });
}
