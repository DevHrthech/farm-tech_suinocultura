import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { courseRoutes } from "./routes/course.routes";
import { lessonRoutes } from "./routes/lesson.routes";
import { videoRoutes } from "./routes/video.routes";
import { quizRoutes } from "./routes/quiz.routes";
import { meRoutes } from "./routes/me.routes";
import { userRoutes } from "./routes/user.routes";
import { authRoutes } from "./routes/auth.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import { seedUsers } from "./models/user.model";
import { CourseModel } from "./models/course.model";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "6mb" }));

// Rotas públicas (sem autenticação)
app.get("/api/status", (req, res) => {
  res.json({ message: "LMS Suinocultura API rodando ??" });
});

app.use("/api/auth", authRoutes);

// Rotas protegidas (com autenticação) - middleware aplicado DENTRO de cada router, não globalmente
app.use("/api/courses", authMiddleware, courseRoutes);
app.use("/api/courses/:courseId/lessons", authMiddleware, lessonRoutes);
app.use("/api/courses/:courseId/videos", authMiddleware, videoRoutes);
app.use("/api/courses/:courseId/quiz", authMiddleware, quizRoutes);
app.use("/api/me", authMiddleware, meRoutes);
app.use("/api/users", authMiddleware, userRoutes);

// Serve Angular frontend build (DEPOIS das rotas de API)
app.use(express.static(path.join(__dirname, "../public")));

// Catch-all: serve index.html para Angular Router (por último, SEM middleware de auth)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, async () => {
  const adminUser = await seedUsers();
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
