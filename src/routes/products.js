import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth.js";
import { productsRepo } from "../repositories/productsRepo.js";

export const productsRouter = Router();

const bodySchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().min(0).default(0),

  // aceita camelCase e snake_case
  categoryId: z.string().min(1).optional(),
  category_id: z.string().min(1).optional(),

  subcategoryId: z.string().optional(),
  subcategory_id: z.string().optional(),

  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),

  // front pode mandar [] de string, ou [] de objetos (a gente normaliza)
  sizes: z.array(z.any()).optional().default([]),
  colors: z.array(z.any()).optional().default([]),
});

function pick(body, camel, snake) {
  return (body?.[camel] ?? body?.[snake] ?? "").toString().trim();
}

function normalizeStringArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((x) => String(x ?? "").trim()).filter(Boolean);
}

function normalizeColors(arr) {
  // aceita ["#000"] ou [{hex:"#000"}]
  if (!Array.isArray(arr)) return [];
  return arr
    .map((c) => {
      if (typeof c === "string") return c.trim();
      if (c && typeof c === "object") return String(c.hex ?? c.name ?? "").trim();
      return "";
    })
    .filter(Boolean);
}

productsRouter.get("/", async (req, res, next) => {
  try {
    const rows = await productsRepo.list();
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const p = await productsRepo.getById(id);
    if (!p) return res.status(404).json({ message: "Not found" });
    res.json(p);
  } catch (e) {
    next(e);
  }
});

productsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const parsed = bodySchema.parse(req.body);

    const categoryId = pick(req.body, "categoryId", "category_id");
    if (!categoryId) return res.status(400).json({ message: "categoryId is required" });

    const subcategoryId = pick(req.body, "subcategoryId", "subcategory_id");

    const payload = {
      name: parsed.name,
      price: Number(parsed.price || 0),
      description: parsed.description ?? null,
      image: parsed.image ?? null,
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      sizes: normalizeStringArray(parsed.sizes),
      colors: normalizeColors(parsed.colors),
    };

    const created = await productsRepo.create(payload);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

productsRouter.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const parsed = bodySchema.partial().parse(req.body);

    const categoryId = pick(req.body, "categoryId", "category_id");
    if (!categoryId) return res.status(400).json({ message: "categoryId is required" });

    const subcategoryId = pick(req.body, "subcategoryId", "subcategory_id");

    const payload = {
      name: parsed.name,
      price: Number(parsed.price || 0),
      description: parsed.description ?? null,
      image: parsed.image ?? null,
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      sizes: normalizeStringArray(parsed.sizes),
      colors: normalizeColors(parsed.colors),
    };

    const updated = await productsRepo.update(id, payload);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

productsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const r = await productsRepo.remove(id);
    res.json(r);
  } catch (e) {
    next(e);
  }
});
