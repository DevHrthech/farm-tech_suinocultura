import { Response } from "express";
import { VideoModel } from "../models/video.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const VideoController = {
  listByCourse: (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const courseId = Array.isArray(req.params.courseId)
      ? req.params.courseId[0]
      : (req.params.courseId as string);
    const videos = VideoModel.findByCourseId(courseId as string, tenantId);
    res.json(videos);
  },

  listAll: (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const videos = VideoModel.findAll(tenantId);
    res.json(videos);
  },

  getById: (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const videoId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const video = VideoModel.findById(videoId as string, tenantId);
    if (!video)
      return res.status(404).json({ error: "Vídeo não encontrado" });
    res.json(video);
  },
};
