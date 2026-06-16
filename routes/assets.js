import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET /api/assets
router.get("/", async (req, res) => {
    try {
        const { prefix } = req.query;
        let queryText = "SELECT * FROM ui_assets";
        let queryParams = [];

        if (prefix) {
            // we look for names starting with the prefix
            queryText += " WHERE name LIKE $1";
            queryParams.push(`${prefix}%`);
        }

        const result = await pool.query(queryText, queryParams);
        res.json({ assets: result.rows });
    } catch (error) {
        console.error("Error fetching assets:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
