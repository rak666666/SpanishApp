
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    }

    return (
        <nav className="navbar">
            <Link to="/dashboard" className="navbar-logo">
                SpanishApp
            </Link>

            <div className="navbar-links">
                <Link to="/statistics">
                    Statystyki
                </Link>

                <Link to="/quiz-history">
                    Historia quizów
                </Link>
                {user.role === "admin" || "editor" && (
                    <Link to="/manage-words">
                        Zarządzanie danymi
                    </Link>
                )}

                {user.role === "admin" && (
                    <Link to="/admin/users">
                        Panel administratora
                    </Link>
                )}

                <button onClick={handleLogout}>
                    Wyloguj się
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
