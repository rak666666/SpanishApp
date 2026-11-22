
import { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

function LoginPage() {
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
            const data = await loginUser(email, password);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/dashboard");
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <h1>SpanishApp</h1>
                <p>Ucz się hiszpańskiego na własnych zasadach!</p>

                <form onSubmit={handleSubmit}>
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
                        placeholder="Wpisz swoje hasło"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">
                        Zaloguj się
                    </button>
                </form>

                {error && <p>{error}</p>}
                {success && <p>{success}</p>}

                <p>
                    Nie masz konta? <Link to="/register">Zarejestruj się</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
