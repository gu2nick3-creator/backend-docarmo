import { Router } from "express";
import { z } from "zod";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { httpError } from "../utils/httpError.js";

export const mercadopagoRouter = Router();

const bodySchema = z.object({
  orderId: z.union([z.string(), z.number()]),
  items: z.array(z.object({
    title: z.string(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive()
  })),
  customer: z.object({
    name: z.string().optional(),
    email: z.string().email().optional()
  }).optional()
});

mercadopagoRouter.post("/preference", async (req, res, next) => {
  try {
    const parsed = bodySchema.parse(req.body);

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) throw httpError(500, "MERCADOPAGO_ACCESS_TOKEN not set");

    const PUBLIC_API_URL = process.env.PUBLIC_API_URL || "";
    const FRONT_URL = process.env.FRONT_URL || "";

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: parsed.items,
        external_reference: String(parsed.orderId),
        back_urls: {
          success: `${FRONT_URL}/checkout/success?orderId=${parsed.orderId}`,
          failure: `${FRONT_URL}/checkout/failure?orderId=${parsed.orderId}`,
          pending: `${FRONT_URL}/checkout/pending?orderId=${parsed.orderId}`
        },
        auto_return: "approved",
        notification_url: `${PUBLIC_API_URL}/webhooks/mercadopago`
      }
    });

    res.json({
      preferenceId: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    });
  } catch (e) { next(e); }
});
