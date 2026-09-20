import { Router } from "express";
import { QuizController } from "../controllers/quiz.controller";

export const quizRoutes = Router({ mergeParams: true });

quizRoutes.get("/summary", QuizController.summary);

quizRoutes.get("/quizzes", QuizController.listQuizzes);
quizRoutes.post("/quizzes", QuizController.createQuiz);
quizRoutes.get("/quizzes/:quizId", QuizController.getQuiz);
quizRoutes.put("/quizzes/:quizId", QuizController.updateQuiz);
quizRoutes.delete("/quizzes/:quizId", QuizController.removeQuiz);

quizRoutes.get("/quizzes/:quizId/questions", QuizController.listQuestions);
quizRoutes.post("/quizzes/:quizId/questions", QuizController.createQuestion);
quizRoutes.put("/quizzes/:quizId/questions/:id", QuizController.updateQuestion);
quizRoutes.delete("/quizzes/:quizId/questions/:id", QuizController.removeQuestion);

quizRoutes.get("/quizzes/:quizId/attempts/last", QuizController.getLastAttempt);
quizRoutes.post("/quizzes/:quizId/attempts", QuizController.createAttempt);
