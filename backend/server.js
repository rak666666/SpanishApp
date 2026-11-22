
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const categoryRoutes = require("./routes/categoryRoutes");
const wordRoutes = require("./routes/wordRoutes");
const authRoutes = require("./routes/authRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const quizRoutes = require("./routes/quizRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => {
    res.send("SpanishApp API działa!");
});

// Tymczasowy test połączenia z bazą
if (process.env.NODE_ENV !== "production") {
    app.get("/test-db", async (req, res) => {
        try {
            const [rows] = await db.query("SHOW TABLES");
            res.json(rows);
        } catch (error) {
            console.error(error);

            res.status(500).send(
                "Błąd połączenia z bazą danych"
            );
        }
    });
}

app.use("/categories", categoryRoutes);
app.use("/words", wordRoutes);
app.use("/auth", authRoutes);
app.use("/flashcards", flashcardRoutes);
app.use("/quiz", quizRoutes);
app.use("/statistics", statisticsRoutes);
app.use("/users", userRoutes);

app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
