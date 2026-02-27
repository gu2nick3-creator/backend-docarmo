import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth.js";
import { ordersRepo } from "../repositories/ordersRepo.js";

export const ordersRouter = Router();

// GET /orders (admin)
ordersRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    res.json(await ordersRepo.list());
  } catch (e) {
    next(e);
  }
});

// POST /orders (checkout público)
// Aceita:
// - novo: { total, items, customer }
// - antigo: { total_amount, customer_name, customer_email }
ordersRouter.post("/", async (req, res, next) => {
  try {
    const schema = z.object({
      // novo
      total: z.coerce.number().optional(),
      items: z.any().optional(),      // pode ser array/obj/string
      customer: z.any().optional(),   // pode ser obj/string

      // antigo (compat)
      total_amount: z.coerce.number().optional(),
      customer_name: z.string().optional(),
      customer_email: z.string().email().optional(),
    });

    const body = schema.parse(req.body);

    const payload = {
      status: "pending",
      total: body.total ?? body.total_amount ?? 0,
      items: body.items ?? null,
      customer:
        body.customer ??
        (body.customer_name || body.customer_email
          ? { name: body.customer_name || null, email: body.customer_email || null }
          : null),
    };

    const order = await ordersRepo.create(payload);
    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
});

// GET /orders/:id/status (público)
ordersRouter.get("/:id/status", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const st = await ordersRepo.getStatus(id);
    if (!st) return res.status(404).json({ message: "Not found" });
    res.json(st);
  } catch (e) {
    next(e);
  }
});

// PATCH /orders/:id/status (admin)
ordersRouter.patch("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const schema = z.object({
      status: z.string().min(1),
      payment_id: z.string().optional().nullable(),
    });

    const parsed = schema.parse(req.body);
    await ordersRepo.updateStatus(id, parsed.status, parsed.payment_id ?? null);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
