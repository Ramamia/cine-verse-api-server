import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { email, password, nickname } = req.body;

        // okay so first we gotta check if this user is already in the system yk case-insensitively
        const userCheck = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: "User already exists with that email" });
        }

        // listen we cant just save the password we gotta hash it so its safe
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // boom insert the new user into the db
        const newUser = await pool.query(
            "INSERT INTO users (email, password_hash, nickname) VALUES ($1, $2, $3) RETURNING id, email, nickname",
            [email, passwordHash, nickname]
        );

        // make a token so they can stay logged in for a week
        const token = jwt.sign(
            { id: newUser.rows[0].id, email: newUser.rows[0].email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } 
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // alright lets find the user by their email or nickname case-insensitively
        const userResult = await pool.query(
            "SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(nickname) = LOWER($2)",
            [email, email]
        );
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials. Check your email/nickname and password." });
        }

        const user = userResult.rows[0];

        // check if the password matches what we have hashed yk
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials. Check your email/nickname and password." });
        }

        // give them a fresh token 
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                avatar_skin: user.avatar_skin,
                avatar_acc: user.avatar_acc,
                profile_picture_url: user.profile_picture_url
            }
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
