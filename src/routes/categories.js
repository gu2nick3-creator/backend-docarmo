import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth.js";
import { categoriesRepo } from "../repositories/categoriesRepo.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (req, res, next) => {
  try {
    res.json(await categoriesRepo.list());
  } catch (e) { next(e); }
});

categoriesRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({ name: z.string().min(1) });
    const parsed = schema.parse(req.body);
    res.status(201).json(await categoriesRepo.create(parsed.name));
  } catch (e) { next(e); }
});

categoriesRouter.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const schema = z.object({ name: z.string().min(1) });
    const parsed = schema.parse(req.body);
    res.json(await categoriesRepo.update(id, parsed.name));
  } catch (e) { next(e); }
});

categoriesRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    res.json(await categoriesRepo.remove(id));
  } catch (e) { next(e); }
});
