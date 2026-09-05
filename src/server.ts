import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { courseRoutes } from "./routes/course.routes";
import { lessonRoutes } from "./routes/lesson.routes";
import { videoRoutes } from "./routes/video.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "LMS Suinocultura API rodando 🐷" });
});

app.use("/api/courses", courseRoutes);
app.use("/api/courses/:courseId/lessons", lessonRoutes);
app.use("/api/courses/:courseId/videos", videoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
