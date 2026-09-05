import { Router } from "express";
import { VideoController } from "../controllers/video.controller";

export const videoRoutes = Router({ mergeParams: true });

videoRoutes.get("/", VideoController.listByCourse);
videoRoutes.get("/:id", VideoController.getById);
