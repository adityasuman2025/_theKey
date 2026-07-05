import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { posts, savedPosts } from "../db/schema.js";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { computeSaveTransition } from "../core/business.js";
import { getUser } from "../middleware/auth.js";

const router = Router();

// ── GET /api/saved ──
const savedQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

router.get("/", async (req, res) => {
  try {
    const parsed = savedQuery.safeParse(req.query);
    if (!parsed.success) { res.status(400).json({ error: "Invalid query" }); return; }

    const user = getUser(req);
    if (!user) { res.status(401).json({ error: "Unauthenticated" }); return; }

    const { page, limit } = parsed.data;

    const countResult = await db
      .select({ n: sql<number>`count(*)` })
      .from(savedPosts)
      .innerJoin(posts, eq(posts.id, savedPosts.postId))
      .where(and(eq(savedPosts.userId, user.userId), eq(savedPosts.active, true), isNull(posts.deletedAt)));
    const total = Number(countResult[0]?.n ?? 0);

    const rows = await db
      .select({
        id: posts.id, title: posts.title, content: posts.content,
        courseId: posts.courseId, authorId: posts.authorId, createdAt: posts.createdAt,
        savesCount: posts.savesCount, savedAt: savedPosts.savedAt,
      })
      .from(savedPosts)
      .innerJoin(posts, eq(posts.id, savedPosts.postId))
      .where(and(eq(savedPosts.userId, user.userId), eq(savedPosts.active, true), isNull(posts.deletedAt)))
      .orderBy(desc(savedPosts.savedAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const data = rows.map((r) => ({
      id: r.id, title: r.title, content: r.content,
      courseId: r.courseId, authorId: r.authorId, createdAt: r.createdAt,
      savesCount: r.savesCount, savedAt: r.savedAt, hasSaved: true,
    }));

    res.json({ data, meta: { page, limit, totalCount: total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("GET /api/saved failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/saved ──
const toggleBody = z.object({
  postId: z.string().min(1),
  intent: z.enum(["save", "unsave"]),
});

router.post("/", async (req, res) => {
  try {
    const parsed = toggleBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }

    const user = getUser(req);
    if (!user) { res.status(401).json({ error: "Unauthenticated" }); return; }

    const { postId, intent } = parsed.data;

    // Check post exists
    const [post] = await db.select({ id: posts.id, courseId: posts.courseId, savesCount: posts.savesCount })
      .from(posts).where(and(eq(posts.id, postId), isNull(posts.deletedAt)));
    if (!post) { res.status(404).json({ error: "Post not found" }); return; }

    // Load existing save status
    const [existing] = await db.select({ active: savedPosts.active }).from(savedPosts)
      .where(and(eq(savedPosts.userId, user.userId), eq(savedPosts.postId, postId)));

    const transition = computeSaveTransition(
      existing ? { active: !!existing.active } : null,
      intent
    );

    const now = Date.now();

    if (transition.action === "INSERT") {
      await db.insert(savedPosts).values({ userId: user.userId, postId, savedAt: now, active: true });
    } else if (transition.action === "REACTIVATE") {
      await db.update(savedPosts).set({ active: true, savedAt: now }).where(and(eq(savedPosts.userId, user.userId), eq(savedPosts.postId, postId)));
    } else if (transition.action === "SOFT_DELETE") {
      await db.update(savedPosts).set({ active: false }).where(and(eq(savedPosts.userId, user.userId), eq(savedPosts.postId, postId)));
    }

    if (transition.countDelta !== 0) {
      await db.update(posts).set({ savesCount: sql`${posts.savesCount} + ${transition.countDelta}` }).where(eq(posts.id, postId));
    }

    const [updated] = await db.select({ savesCount: posts.savesCount }).from(posts).where(eq(posts.id, postId));
    res.json({ data: { postId, hasSaved: transition.hasSaved, savesCount: updated?.savesCount ?? 0 } });
  } catch (err) {
    console.error("POST /api/saved failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
