import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// listen this returns the movies and optionally filters them by genre
// GET /api/movies
router.get("/", async (req, res) => {
    try {
        const { genre } = req.query;

        // so if they passed a genre we filter by it otherwise just give them everything
        if (genre) {
            const moviesResult = await pool.query("SELECT * FROM movies WHERE genre = $1", [genre]);
            const mapped = moviesResult.rows.map(m => ({ ...m, poster: m.poster_url }));
            res.json({ movies: mapped });
        } else {
            const moviesResult = await pool.query("SELECT * FROM movies");
            const mapped = moviesResult.rows.map(m => ({ ...m, poster: m.poster_url }));
            res.json({ movies: mapped });
        }
    } catch (error) {
        console.error("error fetching movies:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
