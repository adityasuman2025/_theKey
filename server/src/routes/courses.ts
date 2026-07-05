import { Router } from "express";
import { db } from "../db/index.js";
import { courses } from "../db/schema.js";

const router = Router();

// ── GET /api/courses ──
router.get("/", async (_req, res) => {
  try {
    const list = await db.select().from(courses);
    res.json({ data: list });
  } catch (err) {
    console.error("GET /api/courses failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
