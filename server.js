import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import movieRoutes from "./routes/movies.js";
import reviewRoutes from "./routes/reviews.js";
import assetRoutes from "./routes/assets.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// okay so here are our routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/assets", assetRoutes);

// test endpoint just to make sure it works
app.get("/", (req, res) => {
  res.send("PostgreSQL + Express API is running!");
});

// database connection test endpoint
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

app.use((req, res) => {
    res.status(404).json({
        error: "Not Found"
    });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT} (0.0.0.0)`);
});


