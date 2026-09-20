import { Router } from "express";
import { MeController } from "../controllers/me.controller";

export const meRoutes = Router();

meRoutes.get("/dashboard", MeController.dashboard);
meRoutes.get("/profile", MeController.profile);
meRoutes.put("/profile", MeController.updateProfile);
meRoutes.put("/password", MeController.changePassword);
