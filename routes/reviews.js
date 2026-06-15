import express from "express";
import pool from "../config/db.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// okay so this fetches the global feed with the reviews, who wrote them, and what movie it is
// GET /api/reviews
router.get("/", async (req, res) => {
    try {
        const feedResult = await pool.query(
            `SELECT 
                r.id as review_id, 
                r.rating, 
                r.comment, 
                r.created_at,
                u.id as user_id, 
                u.nickname as user_nickname, 
                u.profile_picture_url as user_avatar,
                m.id as movie_id, 
                m.title as movie_title, 
                m.poster_path as movie_poster
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             JOIN movies m ON r.movie_id = m.id
             ORDER BY r.created_at DESC
             LIMIT 50`
        );

        res.json({ reviews: feedResult.rows });
    } catch (error) {
        console.error("Error fetching global feed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// listen this lets a user post a new review for a movie
// POST /api/reviews
router.post("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { movie_id, rating, comment } = req.body;

        if (!movie_id || !rating) {
            return res.status(400).json({ error: "Movie ID and rating are required" });
        }

        const insertResult = await pool.query(
            `INSERT INTO reviews (user_id, movie_id, rating, comment) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [userId, movie_id, rating, comment]
        );

        res.status(201).json({ 
            message: "Review posted successfully!",
            review: insertResult.rows[0]
        });
    } catch (error) {
        console.error("Error posting review:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
