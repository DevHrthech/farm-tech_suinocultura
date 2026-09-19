import { Router } from "express";
import { MeController } from "../controllers/me.controller";

export const meRoutes = Router();

meRoutes.get("/dashboard", MeController.dashboard);
