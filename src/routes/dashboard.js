import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { dashboardRepo } from "../repositories/dashboardRepo.js";

export const dashboardRouter = Router();

dashboardRouter.get("/metrics", requireAuth, async (req, res, next) => {
  try {
    res.json(await dashboardRepo.metrics());
  } catch (e) {
    next(e);
  }
});
