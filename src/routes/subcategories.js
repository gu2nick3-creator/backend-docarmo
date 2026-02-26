import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth.js";
import { subcategoriesRepo } from "../repositories/subcategoriesRepo.js";

export const subcategoriesRouter = Router();

subcategoriesRouter.get("/", async (req, res, next) => {
  try {
    res.json(await subcategoriesRepo.list());
  } catch (e) { next(e); }
});

subcategoriesRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({ name: z.string().min(1), category_id: z.number() });
    const parsed = schema.parse(req.body);
    res.status(201).json(await subcategoriesRepo.create(parsed));
  } catch (e) { next(e); }
});

subcategoriesRouter.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const schema = z.object({ name: z.string().min(1), category_id: z.number() });
    const parsed = schema.parse(req.body);
    res.json(await subcategoriesRepo.update(id, parsed));
  } catch (e) { next(e); }
});

subcategoriesRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    res.json(await subcategoriesRepo.remove(id));
  } catch (e) { next(e); }
});
