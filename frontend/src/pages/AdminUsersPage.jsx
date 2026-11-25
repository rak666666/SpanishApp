
import { useEffect, useState } from "react";
import {
    getUsers,
    updateUserRole,
    deleteUser
} from "../services/userService";
import ReturnButton from "../components/ReturnButton";

function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const currentUser = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    async function loadUsers() {
        try {
            setError("");
            const data = await getUsers();
            setUsers(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function handleRoleChange(userId, role) {
        try {
            setError("");
            setMessage("");

            await updateUserRole(userId, role);

            setMessage("Rola została zmieniona.");
            await loadUsers();
        } catch (e) {
            setError(e.message);
        }
    }

    async function handleDelete(userId, username) {
        const confirmed = window.confirm(
            `Czy na pewno chcesz usunąć użytkownika ${username}?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await deleteUser(userId);

            setMessage("Użytkownik został usunięty.");
            await loadUsers();
        } catch (e) {
            setError(e.message);
        }
    }
 
    if (loading) {
        return <main className="dashboard">Ładowanie użytkowników...</main>;
    }

    return (
        <main className="dashboard">
            <ReturnButton />
            <h1>Panel administratora</h1>
            <h2>Zarządzanie użytkownikami</h2>

            {error && <p>{error}</p>}
            {message && <p>{message}</p>}

            {users.length === 0 ? (
                <p>Brak użytkowników.</p>
            ) : (
                <div className="learning-cards">
                    {users.map((user) => (
                        <div className="learning-card" key={user.id}>
                            <h3>{user.username}</h3>

                            <p>Email: {user.email}</p>
                            <p>Rola: {user.role}</p>
                            <p>
                                Data rejestracji:{" "}
                                {new Date(user.created_at).toLocaleDateString("pl-PL")}
                            </p>

                            {user.id !== currentUser.id ? (
                                <>
                                    <label>Zmień rolę:</label>

                                    <select
                                        value={user.role}
                                        onChange={(e) =>
                                            handleRoleChange(
                                                user.id,
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="user">User</option>
                                        <option value="editor">Editor</option>
                                        <option value="admin">Admin</option>
                                    </select>

                                    <button
                                        onClick={() =>
                                            handleDelete(user.id, user.username)
                                        }
                                    >
                                        Usuń użytkownika
                                    </button>
                                </>
                            ) : (
                                <p>To jest Twoje konto administratora.</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

export default AdminUsersPage;
