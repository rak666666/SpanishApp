
import API_URL from "./api";

const STATISTICS_URL = `${API_URL}/statistics`;

export async function getStatistics() {
    const token = localStorage.getItem("token");

    const response = await fetch(STATISTICS_URL, {
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
