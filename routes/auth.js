import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { email, password, nickname } = req.body;

        // 1. Check if user already exists
        const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: "User already exists with that email" });
        }

        // 2. Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Insert user into database
        const newUser = await pool.query(
            "INSERT INTO users (email, password_hash, nickname) VALUES ($1, $2, $3) RETURNING id, email, nickname",
            [email, passwordHash, nickname]
        );

        // 4. Generate JWT
        const token = jwt.sign(
            { id: newUser.rows[0].id, email: newUser.rows[0].email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } // Token expires in 7 days
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

        // 1. Find user by email
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = userResult.rows[0];

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // 3. Generate JWT
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
