import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// this route grabs the ui assets like loading backgrounds and avatars from the db
// GET /api/assets
// also supports ?prefix=images/loadingBackgrounds to filter by category
router.get("/", async (req, res) => {
    try {
        const { prefix } = req.query;
        let assetsResult;
        
        if (prefix) {
            // filter by prefix when the query param is provided
            assetsResult = await pool.query(
                "SELECT name, url FROM ui_assets WHERE name LIKE $1",
                [`${prefix}%`]
            );
        } else {
            assetsResult = await pool.query("SELECT name, url FROM ui_assets");
        }
        
        res.json({ assets: assetsResult.rows });
    } catch (error) {
        console.error("error fetching assets:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// this one filters by a specific asset name if you need just one
// GET /api/assets/byname/:name
router.get("/byname/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const assetResult = await pool.query("SELECT name, url FROM ui_assets WHERE name = $1", [name]);

        if (assetResult.rows.length === 0) {
            return res.status(404).json({ error: "Asset not found" });
        }

        res.json({ asset: assetResult.rows[0] });
    } catch (error) {
        console.error("error fetching asset:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
