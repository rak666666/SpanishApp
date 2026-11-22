
import API_URL from "./api";

const USERS_URL = `${API_URL}/users`;

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

export async function getUsers() {
    return sendRequest(USERS_URL);
}

export async function updateUserRole(userId, role) {
    return sendRequest(`${USERS_URL}/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role })
    });
}

export async function deleteUser(userId) {
    return sendRequest(`${USERS_URL}/${userId}`, {
        method: "DELETE"
    });
}
