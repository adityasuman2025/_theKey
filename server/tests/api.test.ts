import { describe, it, expect, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import request from "supertest";
import app from "../src/server.js";

/**
 * API integration tests.
 * These run against the actual Express app + seeded SQLite database.
 * The database is re-seeded before each test run so tests are idempotent.
 */

beforeAll(() => {
  execSync("tsx --env-file=.env src/db/seed.ts", { cwd: import.meta.dirname + "/.." });
});


// Seed data reference:
// student-1 (Aarav): enrolled in cs101, math201
// student-2 (Rohan): enrolled in cs101 only
// student-3 (Priya): enrolled in math201 only
// student-4 (Amit): enrolled in cs101, math201
// mod-1 (Anjali): moderator

const asStudent1 = { "x-user-id": "student-1", "x-user-role": "student" };
const asStudent2 = { "x-user-id": "student-2", "x-user-role": "student" };
const asStudent3 = { "x-user-id": "student-3", "x-user-role": "student" };
const asMod = { "x-user-id": "mod-1", "x-user-role": "moderator" };

describe("GET /api/posts", () => {
  it("returns 401 when no auth headers", async () => {
    const res = await request(app).get("/api/posts?courseId=cs101");
    expect(res.status).toBe(401);
  });

  it("returns 404 for a non-existent course", async () => {
    const res = await request(app)
      .get("/api/posts?courseId=nonexistent")
      .set(asStudent1);
    expect(res.status).toBe(404);
  });

  it("returns paginated posts for student (happy path)", async () => {
    const res = await request(app)
      .get("/api/posts?courseId=cs101&page=1&limit=5")
      .set(asStudent1);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.meta).toHaveProperty("page", 1);
    expect(res.body.meta).toHaveProperty("totalCount");
    expect(res.body.meta).toHaveProperty("totalPages");

    // Each post should have hasSaved and savesCount
    for (const post of res.body.data) {
      expect(post).toHaveProperty("hasSaved");
      expect(post).toHaveProperty("savesCount");
      expect(typeof post.hasSaved).toBe("boolean");
      expect(typeof post.savesCount).toBe("number");
    }
  });

  it("allows moderator to access any course", async () => {
    const res = await request(app)
      .get("/api/posts?courseId=cs101")
      .set(asMod);
    expect(res.status).toBe(200);
  });
});

describe("POST /api/saved — toggle save", () => {
  it("returns 401 when unauthenticated", async () => {
    const res = await request(app)
      .post("/api/saved")
      .send({ postId: "post-1", intent: "save" });
    expect(res.status).toBe(401);
  });


  it("returns 404 for a non-existent post", async () => {
    const res = await request(app)
      .post("/api/saved")
      .set(asStudent1)
      .send({ postId: "nonexistent", intent: "save" });
    expect(res.status).toBe(404);
  });

  it("happy path: save a post and verify hasSaved + savesCount", async () => {
    // student-4 saves post-4 (cs101, not saved yet)
    const asStudent4 = { "x-user-id": "student-4", "x-user-role": "student" };

    const saveRes = await request(app)
      .post("/api/saved")
      .set(asStudent4)
      .send({ postId: "post-4", intent: "save" });

    expect(saveRes.status).toBe(200);
    expect(saveRes.body.data.hasSaved).toBe(true);
    expect(saveRes.body.data.savesCount).toBeGreaterThan(0);

    // Saving again should be idempotent (no-op)
    const saveAgain = await request(app)
      .post("/api/saved")
      .set(asStudent4)
      .send({ postId: "post-4", intent: "save" });

    expect(saveAgain.status).toBe(200);
    expect(saveAgain.body.data.savesCount).toBe(saveRes.body.data.savesCount);
  });
});

describe("GET /api/saved — saved list", () => {
  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).get("/api/saved");
    expect(res.status).toBe(401);
  });

  it("returns saved posts for authenticated student", async () => {
    // student-1 has pre-seeded saved posts
    const res = await request(app).get("/api/saved").set(asStudent1);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.meta).toHaveProperty("totalCount");
  });
});

describe("DELETE /api/posts/:id — moderator removal", () => {
  it("returns 403 when student tries to delete", async () => {
    const res = await request(app)
      .delete("/api/posts/post-9")
      .set(asStudent1);
    expect(res.status).toBe(403);
  });

  it("allows moderator to delete a post", async () => {
    const res = await request(app)
      .delete("/api/posts/post-9")
      .set(asMod);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify post is no longer in feed
    const feedRes = await request(app)
      .get("/api/posts?courseId=cs101")
      .set(asMod);
    const deleted = feedRes.body.data.find(
      (p: { id: string }) => p.id === "post-9"
    );
    expect(deleted).toBeUndefined();
  });
});
