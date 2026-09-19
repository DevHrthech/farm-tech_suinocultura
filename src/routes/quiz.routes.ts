import { Router } from "express";
import { QuizController } from "../controllers/quiz.controller";

export const quizRoutes = Router({ mergeParams: true });

quizRoutes.get("/questions", QuizController.listQuestions);
quizRoutes.post("/questions", QuizController.createQuestion);
quizRoutes.put("/questions/:id", QuizController.updateQuestion);
quizRoutes.delete("/questions/:id", QuizController.removeQuestion);
quizRoutes.get("/attempts/last", QuizController.getLastAttempt);
quizRoutes.post("/attempts", QuizController.createAttempt);
