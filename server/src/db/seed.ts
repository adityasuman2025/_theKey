import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing");
}

const pool = new pg.Pool({ connectionString });
const db = drizzle(pool, { schema });

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Recreating tables on Neon Postgres...");

    // Drop tables in order
    await client.query(`
      DROP TABLE IF EXISTS saved_posts CASCADE;
      DROP TABLE IF EXISTS posts CASCADE;
      DROP TABLE IF EXISTS courses CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create tables
    await client.query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'moderator'))
      );

      CREATE TABLE courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL
      );

      CREATE TABLE posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        course_id TEXT NOT NULL REFERENCES courses(id),
        author_id TEXT NOT NULL REFERENCES users(id),
        created_at BIGINT NOT NULL,
        deleted_at BIGINT,
        saves_count INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE saved_posts (
        user_id TEXT NOT NULL REFERENCES users(id),
        post_id TEXT NOT NULL REFERENCES posts(id),
        saved_at BIGINT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        PRIMARY KEY (user_id, post_id)
      );
    `);

    console.log("Inserting seed data...");

    const usersData = [
      { id: "mod-1", name: "Aditya", role: "moderator" as const },
      { id: "student-1", name: "Adarsh", role: "student" as const },
      { id: "student-2", name: "Aditi", role: "student" as const },
      { id: "student-3", name: "Nimisha", role: "student" as const },
      { id: "student-4", name: "Archana", role: "student" as const },
      { id: "student-5", name: "Biresh", role: "student" as const },
      { id: "student-6", name: "Rezy", role: "student" as const },
      { id: "student-7", name: "Neha", role: "student" as const },
      { id: "student-8", name: "Nisha", role: "student" as const },
    ];

    const coursesData = [
      { id: "cs101", title: "Introduction to Computer Science" },
      { id: "math201", title: "Linear Algebra" },
      { id: "physics301", title: "Classical Mechanics" },
      { id: "lit101", title: "World Literature" },
      { id: "chem101", title: "General Chemistry" },
    ];

    const now = Date.now();
    const HOUR = 3600_000;

    const postsData = [
      {
        id: "post-1",
        title: "Welcome to CS101!",
        content:
          "Hi everyone! Looking forward to learning computer science together. Feel free to introduce yourselves.",
        courseId: "cs101",
        authorId: "student-1",
        createdAt: now - 12 * HOUR,
      },
      {
        id: "post-2",
        title: "Homework 1 — questions?",
        content:
          "Does anyone know if we need to submit HW1 as a PDF or can we just paste code directly?",
        courseId: "cs101",
        authorId: "student-2",
        createdAt: now - 10 * HOUR,
      },
      {
        id: "post-3",
        title: "Study group for midterm",
        content:
          "I'm organizing a study group for the upcoming midterm. Library, Saturday 2PM. Who's in?",
        courseId: "cs101",
        authorId: "student-4",
        createdAt: now - 8 * HOUR,
      },
      {
        id: "post-4",
        title: "Great resources for recursion",
        content:
          "Found this amazing video series on recursion and dynamic programming. Highly recommend it for anyone struggling with the topic.",
        courseId: "cs101",
        authorId: "student-1",
        createdAt: now - 6 * HOUR,
      },
      {
        id: "post-5",
        title: "Eigenvalues intuition",
        content:
          "Can someone explain eigenvalues intuitively? The textbook is very formal and I'm struggling to build geometric intuition.",
        courseId: "math201",
        authorId: "student-1",
        createdAt: now - 11 * HOUR,
      },
      {
        id: "post-6",
        title: "Matrix multiplication tips",
        content:
          "Here's a trick I learned: think of each column of the result as a linear combination of the columns of the first matrix.",
        courseId: "math201",
        authorId: "student-3",
        createdAt: now - 9 * HOUR,
      },
      {
        id: "post-7",
        title: "Newton's laws in everyday life",
        content:
          "How do you visualize action-reaction forces when a heavy block sits on a table? Let's discuss.",
        courseId: "physics301",
        authorId: "student-2",
        createdAt: now - 7 * HOUR,
      },
      {
        id: "post-8",
        title: "Rotational motion struggles",
        content:
          "Finding torque and moment of inertia formulas confusing. Any good YouTube channel recommendations?",
        courseId: "physics301",
        authorId: "student-5",
        createdAt: now - 5 * HOUR,
      },
      {
        id: "post-9",
        title: "Analysis of Shakespeare's sonnets",
        content:
          "Let's share insights on Sonnet 18. The comparison to a summer's day is beautifully structured.",
        courseId: "lit101",
        authorId: "student-3",
        createdAt: now - 4 * HOUR,
      },
      {
        id: "post-10",
        title: "Magical Realism recommendations",
        content:
          "Loved Gabriel García Márquez. Which authors or books should I read next in this genre?",
        courseId: "lit101",
        authorId: "student-7",
        createdAt: now - 3 * HOUR,
      },
      {
        id: "post-11",
        title: "Balancing redox equations",
        content:
          "Struggling with the half-reaction method in acidic solutions. Can someone post step-by-step notes?",
        courseId: "chem101",
        authorId: "student-8",
        createdAt: now - 2 * HOUR,
      },
      {
        id: "post-12",
        title: "Periodic table trends cheat sheet",
        content:
          "Remember: Electronegativity increases up and to the right. Atomic radius increases down and to the left.",
        courseId: "chem101",
        authorId: "student-6",
        createdAt: now - 1 * HOUR,
      },
    ];

    await db.insert(schema.users).values(usersData);
    await db.insert(schema.courses).values(coursesData);
    await db.insert(schema.posts).values(postsData);

    const savedData = [
      { userId: "student-1", postId: "post-2", savedAt: now - 8 * HOUR, active: true },
      { userId: "student-1", postId: "post-6", savedAt: now - 7 * HOUR, active: true },
      { userId: "student-2", postId: "post-1", savedAt: now - 6 * HOUR, active: true },
      { userId: "student-2", postId: "post-8", savedAt: now - 4 * HOUR, active: true },
    ];

    await db.insert(schema.savedPosts).values(savedData);

    // Sync savesCount
    await client.query(`
      UPDATE posts SET saves_count = (
        SELECT COUNT(*) FROM saved_posts
        WHERE saved_posts.post_id = posts.id AND saved_posts.active = true
      );
    `);

    console.log("✓ Neon database seeded successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
