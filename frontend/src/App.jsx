
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashBoardPage from "./pages/DashBoardPage";
import WordsPage from "./pages/WordsPage";
import ManageWordsPage from "./pages/ManageWordsPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import QuizPage from "./pages/QuizPage";
import StatisticsPage from "./pages/StatisticsPage";
import QuizHistoryPage from "./pages/QuizHistoryPage";
import AdminUsersPage from "./pages/AdminUsersPage";

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashBoardPage /></ProtectedRoute>} />
            <Route path="/words" element={<ProtectedRoute><WordsPage /></ProtectedRoute>} />
            <Route path="/manage-words" element={<ProtectedRoute allowedRoles={["editor", "admin"]}><ManageWordsPage /></ProtectedRoute>} />
            <Route path="/flashcards" element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />    
            <Route path="/statistics" element={<ProtectedRoute><StatisticsPage /></ProtectedRoute>} />
            <Route path="/quiz-history" element={<ProtectedRoute><QuizHistoryPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
        </Routes>
    );
}

export default App;
