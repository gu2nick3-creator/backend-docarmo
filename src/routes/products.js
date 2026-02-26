import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth.js";
import { productsRepo } from "../repositories/productsRepo.js";

export const productsRouter = Router();

productsRouter.get("/", async (req, res, next) => {
  try {
    res.json(await productsRepo.list());
  } catch (e) { next(e); }
});

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const p = await productsRepo.getById(id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (e) { next(e); }
});

productsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      price: z.number(),
      description: z.string().optional(),
      category_id: z.number().nullable().optional(),
      subcategory_id: z.number().nullable().optional(),
      sizes: z.array(z.string()).optional(),
      colors: z.array(z.string()).optional(),
      images: z.array(z.string().url()).optional()
    });
    const parsed = schema.parse(req.body);
    // TODO: salvar images em tabela product_images se você quiser múltiplas
    res.status(201).json(await productsRepo.create(parsed));
  } catch (e) { next(e); }
});

productsRouter.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const schema = z.object({
      name: z.string().min(1),
      price: z.number(),
      description: z.string().optional(),
      category_id: z.number().nullable().optional(),
      subcategory_id: z.number().nullable().optional(),
      sizes: z.array(z.string()).optional(),
      colors: z.array(z.string()).optional(),
      images: z.array(z.string().url()).optional()
    });
    const parsed = schema.parse(req.body);
    res.json(await productsRepo.update(id, parsed));
  } catch (e) { next(e); }
});

productsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    res.json(await productsRepo.remove(id));
  } catch (e) { next(e); }
});
