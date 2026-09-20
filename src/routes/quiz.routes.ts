import { Router } from "express";
import { QuizController } from "../controllers/quiz.controller";
import { requireRole, requireCourseOwnership } from "../middleware/role.middleware";

export const quizRoutes = Router({ mergeParams: true });

const requireOwner = [requireRole("instrutor", "admin"), requireCourseOwnership()];

quizRoutes.get("/summary", QuizController.summary);

quizRoutes.get("/quizzes", QuizController.listQuizzes);
quizRoutes.post("/quizzes", ...requireOwner, QuizController.createQuiz);
quizRoutes.get("/quizzes/:quizId", QuizController.getQuiz);
quizRoutes.put("/quizzes/:quizId", ...requireOwner, QuizController.updateQuiz);
quizRoutes.delete("/quizzes/:quizId", ...requireOwner, QuizController.removeQuiz);

quizRoutes.get("/quizzes/:quizId/questions", QuizController.listQuestions);
quizRoutes.post("/quizzes/:quizId/questions", ...requireOwner, QuizController.createQuestion);
quizRoutes.put("/quizzes/:quizId/questions/:id", ...requireOwner, QuizController.updateQuestion);
quizRoutes.delete("/quizzes/:quizId/questions/:id", ...requireOwner, QuizController.removeQuestion);

quizRoutes.get("/quizzes/:quizId/attempts/last", QuizController.getLastAttempt);
quizRoutes.post("/quizzes/:quizId/attempts", QuizController.createAttempt);
