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

ordersRouter.post("/", async (req, res, next) => {
  try {
    const schema = z.object({
      total_amount: z.number().optional(),
      customer_name: z.string().optional(),
      customer_email: z.string().email().optional()
    });
    const parsed = schema.parse(req.body);
    const order = await ordersRepo.create({ ...parsed, status: "pending" });
    res.status(201).json(order);
  } catch (e) { next(e); }
});

ordersRouter.get("/:id/status", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const st = await ordersRepo.getStatus(id);
    if (!st) return res.status(404).json({ message: "Not found" });
    res.json(st);
  } catch (e) { next(e); }
});

ordersRouter.patch("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const schema = z.object({ status: z.string().min(1), payment_id: z.string().optional().nullable() });
    const parsed = schema.parse(req.body);
    await ordersRepo.updateStatus(id, parsed.status, parsed.payment_id || null);
    res.json({ ok: true });
  } catch (e) { next(e); }
});
