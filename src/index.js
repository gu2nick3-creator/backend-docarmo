import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import { authRouter } from "./routes/auth.js";
import { categoriesRouter } from "./routes/categories.js";
import { subcategoriesRouter } from "./routes/subcategories.js";
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { mercadopagoRouter } from "./routes/mercadopago.js";
import { webhooksRouter } from "./routes/webhooks.js";

dotenv.config();

const app = express();

// ✅ Se FRONT_URL não estiver definido, libera tudo
const FRONT_URL = process.env.FRONT_URL || "*";

// ✅ Logs
app.use(morgan("dev"));

// ✅ IMPORTANTÍSSIMO: body parser ANTES das rotas
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ CORS correto (sem origin: "*" com credentials=true)
app.use(
  cors({
    origin: (origin, callback) => {
      // sem Origin (Postman/Render healthcheck) ou liberado geral
      if (!origin || FRONT_URL === "*") return callback(null, true);

      // permite 1 ou mais origens separadas por vírgula
      const allowed = FRONT_URL.split(",").map((s) => s.trim()).filter(Boolean);
      if (allowed.includes(origin)) return callback(null, true);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Preflight
app.options("*", cors());

// ✅ Health
app.get("/health", (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "dev" });
});

// ✅ Rotas
app.use("/auth", authRouter);
app.use("/categories", categoriesRouter);
app.use("/subcategories", subcategoriesRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use("/mercadopago", mercadopagoRouter);
app.use("/webhooks", webhooksRouter);

// ✅ 404 (opcional, mas ajuda a debugar)
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    details: err.details || undefined,
  });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});
