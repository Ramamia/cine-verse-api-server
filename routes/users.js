import express from "express";
import pool from "../config/db.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// okay listen this gets the current logged in user profile
// GET /api/users/me
router.get("/me", authenticateToken, async (req, res) => {
    try {
        // we grab the user id from the token that the middleware attached
        const userId = req.user.id;

        // go fetch the user from the db but make sure we don't send back the password hash
        const userResult = await pool.query(
            "SELECT id, email, nickname, bio, avatar_skin, avatar_acc, profile_picture_url FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user: userResult.rows[0] });
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

        // update the user row with whatever they sent us
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

export default router;
