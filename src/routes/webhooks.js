import { Router } from "express";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { httpError } from "../utils/httpError.js";
import { ordersRepo } from "../repositories/ordersRepo.js";

export const webhooksRouter = Router();

// Mercado Pago envia vários formatos. Aqui a gente cobre o mais comum.
webhooksRouter.post("/mercadopago", async (req, res, next) => {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) throw httpError(500, "MERCADOPAGO_ACCESS_TOKEN not set");

    const { type, data } = req.body || {};
    // responder rápido sempre
    res.status(200).json({ ok: true });

    if (type !== "payment" || !data?.id) return;

    const client = new MercadoPagoConfig({ accessToken });
    const paymentApi = new Payment(client);

    const payment = await paymentApi.get({ id: String(data.id) });

    const orderId = payment.external_reference;
    const status = payment.status; // approved / rejected / pending / cancelled etc

    if (!orderId) return;

    // Ajuste de status para o seu padrão
    const mapped =
      status === "approved" ? "approved" :
      status === "rejected" ? "rejected" :
      status === "cancelled" ? "cancelled" :
      "pending";

    await ordersRepo.updateStatus(Number(orderId), mapped, String(payment.id));
  } catch (e) {
    // como já respondemos 200, só loga
    console.error("Webhook error:", e);
  }
});
