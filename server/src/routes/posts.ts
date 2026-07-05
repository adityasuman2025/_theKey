import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { posts, savedPosts, courses } from "../db/schema.js";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { getUser } from "../middleware/auth.js";

const router = Router();

// ── GET /api/posts ──
const feedQuery = z.object({
  courseId: z.string().min(1),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

router.get("/", async (req, res) => {
  try {
    const parsed = feedQuery.safeParse(req.query);
    if (!parsed.success) { res.status(400).json({ error: "Invalid query" }); return; }

    const user = getUser(req);
    if (!user) { res.status(401).json({ error: "Unauthenticated" }); return; }

    const { courseId, page, limit } = parsed.data;

    const [course] = await db.select({ id: courses.id }).from(courses).where(eq(courses.id, courseId));
    if (!course) { res.status(404).json({ error: "Course not found" }); return; }

    const countResult = await db.select({ n: sql<number>`count(*)` }).from(posts).where(and(eq(posts.courseId, courseId), isNull(posts.deletedAt)));
    const total = Number(countResult[0]?.n ?? 0);
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        id: posts.id, title: posts.title, content: posts.content,
        courseId: posts.courseId, authorId: posts.authorId, createdAt: posts.createdAt,
        savesCount: posts.savesCount, savedActive: savedPosts.active,
      })
      .from(posts)
      .leftJoin(savedPosts, and(eq(savedPosts.postId, posts.id), eq(savedPosts.userId, user.userId)))
      .where(and(eq(posts.courseId, courseId), isNull(posts.deletedAt)))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    const data = rows.map((r) => ({
      id: r.id, title: r.title, content: r.content,
      courseId: r.courseId, authorId: r.authorId, createdAt: r.createdAt,
      savesCount: r.savesCount, hasSaved: r.savedActive === true,
    }));

    res.json({ data, meta: { page, limit, totalCount: total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("GET /api/posts failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/posts ──
const createBody = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  courseId: z.string().min(1),
});

router.post("/", async (req, res) => {
  try {
    const parsed = createBody.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Invalid body" }); return; }

    const user = getUser(req);
    if (!user) { res.status(401).json({ error: "Unauthenticated" }); return; }

    const { title, content, courseId } = parsed.data;

    const [course] = await db.select({ id: courses.id }).from(courses).where(eq(courses.id, courseId));
    if (!course) { res.status(404).json({ error: "Course not found" }); return; }

    const id = crypto.randomUUID();
    const now = Date.now();
    await db.insert(posts).values({ id, title, content, courseId, authorId: user.userId, createdAt: now });

    res.status(201).json({
      data: { id, title, content, courseId, authorId: user.userId, createdAt: now, savesCount: 0, hasSaved: false },
    });
  } catch (err) {
    console.error("POST /api/posts failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── DELETE /api/posts/:id ──
router.delete("/:id", async (req, res) => {
  try {
    const user = getUser(req);
    if (!user) { res.status(401).json({ error: "Unauthenticated" }); return; }

    const [post] = await db.select({ id: posts.id }).from(posts).where(and(eq(posts.id, req.params.id), isNull(posts.deletedAt)));
    if (!post) { res.status(404).json({ error: "Post not found" }); return; }
    if (user.userRole !== "moderator") { res.status(403).json({ error: "Only moderators can delete posts" }); return; }

    await db.update(posts).set({ deletedAt: Date.now() }).where(eq(posts.id, req.params.id));
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/posts failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
