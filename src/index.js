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

const FRONT_URL = process.env.FRONT_URL || "*";

app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: FRONT_URL === "*" ? "*" : [FRONT_URL],
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.get("/health", (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "dev" });
});

app.use("/auth", authRouter);
app.use("/categories", categoriesRouter);
app.use("/subcategories", subcategoriesRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);
app.use("/mercadopago", mercadopagoRouter);
app.use("/webhooks", webhooksRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    details: err.details || undefined
  });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});
