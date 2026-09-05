import { Request, Response } from "express";
import { VideoModel } from "../models/video.model";

export const VideoController = {
  listByCourse: (req: Request, res: Response) => {
    const tenantId = req.headers["x-tenant-id"] as string;
    const { courseId } = req.params;
    const videos = VideoModel.findByCourseId(courseId, tenantId);
    res.json(videos);
  },

  listAll: (req: Request, res: Response) => {
    const tenantId = req.headers["x-tenant-id"] as string;
    const videos = VideoModel.findAll(tenantId);
    res.json(videos);
  },

  getById: (req: Request, res: Response) => {
    const tenantId = req.headers["x-tenant-id"] as string;
    const video = VideoModel.findById(req.params.id, tenantId);
    if (!video)
      return res.status(404).json({ error: "Vídeo não encontrado" });
    res.json(video);
  },
};
