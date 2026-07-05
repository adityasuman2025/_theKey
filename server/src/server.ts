import express from "express";
import cors from "cors";
import { attachUser } from "./middleware/auth.js";
import postsRouter from "./routes/posts.js";
import savedRouter from "./routes/saved.js";
import usersRouter from "./routes/users.js";
import coursesRouter from "./routes/courses.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(attachUser);

app.use("/api/posts", postsRouter);
app.use("/api/saved", savedRouter);
app.use("/api/users", usersRouter);
app.use("/api/courses", coursesRouter);

const PORT = process.env.PORT ?? 3001;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
