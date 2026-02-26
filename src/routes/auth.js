import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid body", details: parsed.error.flatten() });

  const { email, password } = parsed.data;

const adminEmail = process.env.ADMIN_EMAIL || "admin@docarmo.store";
const adminPass = process.env.ADMIN_PASSWORD || "admin123";

const isValid = email === adminEmail && password === adminPass;

if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

  if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
  res.json({ token, user: { email, role: "admin" } });
});
