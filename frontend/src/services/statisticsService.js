const API_URL = "http://localhost:3000/statistics";

export async function getStatistics() {
    const token = localStorage.getItem("token");

    const response = await fetch(API_URL, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Błąd podczas pobierania statystyk");
    }

    return data;
}
