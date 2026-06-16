import express from "express";
import pool from "../config/db.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// okay listen this gets the current logged in user profile and their top movies
// GET /api/users/me
router.get("/me", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // grab the user profile info
        const userResult = await pool.query(
            "SELECT id, email, nickname, bio, avatar_skin, avatar_acc, profile_picture_url FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userResult.rows[0];

        // now we grab their top movies by joining the user_top_movies and movies tables
        const topMoviesResult = await pool.query(
            `SELECT m.*, utm.position 
             FROM movies m 
             JOIN user_top_movies utm ON m.id = utm.movie_id 
             WHERE utm.user_id = $1 
             ORDER BY utm.position ASC`,
            [userId]
        );

        // attach the top movies array to the user object
        user.top_movies = topMoviesResult.rows;

        // grab their followers list
        const followersResult = await pool.query(
            `SELECT u.id, u.nickname, u.profile_picture_url 
             FROM users u 
             JOIN followers f ON u.id = f.follower_id 
             WHERE f.following_id = $1`,
            [userId]
        );

        user.followers = followersResult.rows;
        user.follower_count = followersResult.rows.length;

        // grab who they are following
        const followingResult = await pool.query(
            `SELECT u.id, u.nickname, u.profile_picture_url 
             FROM users u 
             JOIN followers f ON u.id = f.following_id 
             WHERE f.follower_id = $1`,
            [userId]
        );

        user.following = followingResult.rows;
        user.following_count = followingResult.rows.length;

        res.json({ user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// so here we update the user profile info
// PUT /api/users/profile
router.put("/profile", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio, avatar_skin, avatar_acc } = req.body;

        const updateResult = await pool.query(
            `UPDATE users 
             SET bio = COALESCE($1, bio), 
                 avatar_skin = COALESCE($2, avatar_skin), 
                 avatar_acc = COALESCE($3, avatar_acc) 
             WHERE id = $4 
             RETURNING id, email, nickname, bio, avatar_skin, avatar_acc, profile_picture_url`,
            [bio, avatar_skin, avatar_acc, userId]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            message: "Profile updated successfully",
            user: updateResult.rows[0]
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// okay so this saves the user's top movies
// POST /api/users/top-movies
router.post("/top-movies", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { movie_ids, movies } = req.body; // support both legacy movie_ids and new full movies array

        let moviesList = [];
        if (Array.isArray(movies)) {
            moviesList = movies;
        } else if (Array.isArray(movie_ids)) {
            moviesList = movie_ids.map(id => ({ id }));
        } else {
            return res.status(400).json({ error: "Please provide movies or movie_ids array" });
        }

        if (moviesList.length > 5) {
            return res.status(400).json({ error: "Please provide up to 5 movies" });
        }

        // first, ensure all movies in the list are registered in the movies table
        for (const movie of moviesList) {
            const movieCheck = await pool.query("SELECT id FROM movies WHERE id = $1", [movie.id]);
            if (movieCheck.rows.length === 0) {
                // Movie doesn't exist, insert it!
                await pool.query(
                    `INSERT INTO movies (id, title, slogan, description, release_year, director, actors, poster_url, genre)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        movie.id,
                        movie.title || 'Unknown Title',
                        movie.slogan || '',
                        movie.description || 'No description available.',
                        parseInt(movie.release_year || movie.year || 0),
                        movie.director || 'Unknown',
                        movie.actors || 'Unknown',
                        movie.poster_url || movie.poster || '',
                        movie.genre || 'unknown'
                    ]
                );
            }
        }

        // since they are updating the whole list, the easiest way is to delete their old list first
        await pool.query("DELETE FROM user_top_movies WHERE user_id = $1", [userId]);

        // then we insert the new ones with their positions
        for (let i = 0; i < moviesList.length; i++) {
            const movie = moviesList[i];
            const position = i + 1;
            await pool.query(
                "INSERT INTO user_top_movies (user_id, movie_id, position) VALUES ($1, $2, $3)",
                [userId, movie.id, position]
            );
        }

        res.json({ message: "Top movies updated successfully!" });
    } catch (error) {
        console.error("Error updating top movies:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// okay so here we let a user follow or unfollow someone
// POST /api/users/follow/:id
router.post("/follow/:id", authenticateToken, async (req, res) => {
    try {
        const followerId = req.user.id;
        const followingId = req.params.id;

        if (followerId === followingId) {
            return res.status(400).json({ error: "You cannot follow yourself" });
        }

        // check if the user to follow actually exists
        const userCheck = await pool.query("SELECT id FROM users WHERE id = $1", [followingId]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: "User to follow not found" });
        }

        // check if already following
        const followCheck = await pool.query(
            "SELECT * FROM followers WHERE follower_id = $1 AND following_id = $2",
            [followerId, followingId]
        );

        if (followCheck.rows.length > 0) {
            // unfollow them since they already follow
            await pool.query(
                "DELETE FROM followers WHERE follower_id = $1 AND following_id = $2",
                [followerId, followingId]
            );
            res.json({ message: "Successfully unfollowed user" });
        } else {
            // follow them
            await pool.query(
                "INSERT INTO followers (follower_id, following_id) VALUES ($1, $2)",
                [followerId, followingId]
            );
            res.json({ message: "Successfully followed user" });
        }
    } catch (error) {
        console.error("Error toggling follow:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
