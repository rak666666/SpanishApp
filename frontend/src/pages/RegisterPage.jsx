
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        setError("");
        setSuccess("");

        try {
            await registerUser(username, email, password);

            setSuccess("Konto zostało utworzone!");

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <h1>SpanishApp</h1>
                <p>Utwórz konto i zacznij naukę!</p>

                <form onSubmit={handleSubmit}>
                    <label>Nazwa użytkownika</label>
                    <input
                        type="text"
                        placeholder="Wpisz nazwę użytkownika"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Wpisz swój email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Hasło</label>
                    <input
                        type="password"
                        placeholder="Wpisz hasło"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                    />

                    <button type="submit">
                        Zarejestruj się
                    </button>
                </form>

                {error && <p>{error}</p>}
                {success && <p>{success}</p>}

                <p>
                    Masz już konto? <Link to="/login">Zaloguj się</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
