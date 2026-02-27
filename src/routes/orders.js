import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth.js";
import { ordersRepo } from "../repositories/ordersRepo.js";

export const ordersRouter = Router();

ordersRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    res.json(await ordersRepo.list());
  } catch (e) { next(e); }
});

// Pedido criado pelo checkout (público)
ordersRouter.post("/", async (req, res, next) => {
  try {
    const schema = z.object({
      total: z.number().optional(),
      items: z.array(z.any()).optional(),
      customer: z.any().optional(),
    });

    const parsed = schema.parse(req.body);

    const order = await ordersRepo.create({
      status: "pending",
      total: parsed.total || 0,
      items: parsed.items || [],
      customer: parsed.customer || null,
    });

    res.status(201).json(order);
  } catch (e) { next(e); }
});

ordersRouter.get("/:id/status", async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const st = await ordersRepo.getStatus(id);
    if (!st) return res.status(404).json({ message: "Not found" });
    res.json(st);
  } catch (e) { next(e); }
});

ordersRouter.patch("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const id = String(req.params.id);

    const schema = z.object({
      status: z.string().min(1),
      payment_id: z.string().optional().nullable(),
    });

    const parsed = schema.parse(req.body);

    await ordersRepo.updateStatus(id, parsed.status, parsed.payment_id ?? null);
    res.json({ ok: true });
  } catch (e) { next(e); }
});
