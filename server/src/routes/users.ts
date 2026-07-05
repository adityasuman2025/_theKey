import { Router } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

const router = Router();

// ── GET /api/users ──
router.get("/", async (_req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json({ data: allUsers });
  } catch (err) {
    console.error("GET /api/users failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
