import express from "express";
import pool from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//test endpoint
app.get("/", (req, res) => {
    res.send("Cine-Verse server is running yay");
});

// Database test endpoint
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            success: true,
            message: "Successfully connected to PostgreSQL database!",
            timestamp: result.rows[0].now
        });
    } catch (error) {
        console.error("Database test failed:", error);
        res.status(500).json({ success: false, error: "Database connection failed" });
    }
});

app.use((req,res) => {
    res.status(404).json({
        error: "Not Found"
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
