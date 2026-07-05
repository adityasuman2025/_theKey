import { pgTable, text, integer, bigint, boolean, primaryKey } from "drizzle-orm/pg-core";

// ── Users ──
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").$type<"student" | "moderator">().notNull(),
});

// ── Courses ──
export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
});

// ── Posts ──
export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  deletedAt: bigint("deleted_at", { mode: "number" }),
  savesCount: integer("saves_count").notNull().default(0),
});

// ── Saved Posts ──
export const savedPosts = pgTable(
  "saved_posts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id),
    savedAt: bigint("saved_at", { mode: "number" }).notNull(),
    active: boolean("active").notNull().default(true),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.postId] }),
  })
);
