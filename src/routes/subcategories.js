import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth.js";
import { subcategoriesRepo } from "../repositories/subcategoriesRepo.js";

export const subcategoriesRouter = Router();

const bodySchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1).optional(),
  category_id: z.string().min(1).optional(),
});

function pickCategoryId(body) {
  return body?.categoryId ?? body?.category_id;
}

subcategoriesRouter.get("/", async (req, res, next) => {
  try {
    res.json(await subcategoriesRepo.list());
  } catch (e) {
    next(e);
  }
});

subcategoriesRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const parsed = bodySchema.parse(req.body);
    const categoryId = pickCategoryId(req.body);
    if (!categoryId) return res.status(400).json({ message: "categoryId is required" });

    res.status(201).json(await subcategoriesRepo.create({ name: parsed.name, categoryId }));
  } catch (e) {
    next(e);
  }
});

subcategoriesRouter.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const parsed = bodySchema.parse(req.body);
    const categoryId = pickCategoryId(req.body);
    if (!categoryId) return res.status(400).json({ message: "categoryId is required" });

    res.json(await subcategoriesRepo.update(id, { name: parsed.name, categoryId }));
  } catch (e) {
    next(e);
  }
});

subcategoriesRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    res.json(await subcategoriesRepo.remove(id));
  } catch (e) {
    next(e);
  }
});
