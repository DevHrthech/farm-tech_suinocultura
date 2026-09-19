import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { courseRoutes } from "./routes/course.routes";
import { lessonRoutes } from "./routes/lesson.routes";
import { videoRoutes } from "./routes/video.routes";
import { quizRoutes } from "./routes/quiz.routes";
import { meRoutes } from "./routes/me.routes";
import { authRoutes } from "./routes/auth.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import { seedUsers } from "./models/user.model";
import { CourseModel } from "./models/course.model";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "LMS Suinocultura API rodando 🐷" });
});

app.use("/api/auth", authRoutes);

app.use(authMiddleware);
app.use("/api/courses", courseRoutes);
app.use("/api/courses/:courseId/lessons", lessonRoutes);
app.use("/api/courses/:courseId/videos", videoRoutes);
app.use("/api/courses/:courseId/quiz", quizRoutes);
app.use("/api/me", meRoutes);

// Serve Angular frontend build
app.use(express.static(path.join(__dirname, "../public")));

// Catch-all: serve index.html para Angular Router lidar com rotas diretas
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, async () => {
  const adminUser = await seedUsers();
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
