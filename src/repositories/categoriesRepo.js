import { randomUUID } from "crypto";
import { getPool } from "../db/pool.js";

export const categoriesRepo = {
  async list() {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, name, created_at FROM categories ORDER BY created_at DESC"
    );

    // remove registros bugados (id vazio) pra não quebrar o front
    return rows.filter((r) => r.id && String(r.id).trim().length > 0);
  },

  async create(name) {
    const pool = getPool();
    const cleanName = String(name ?? "").trim();
    if (!cleanName) throw new Error("name is required");

    const id = randomUUID();
    await pool.query("INSERT INTO categories (id, name) VALUES (?, ?)", [id, cleanName]);
    return { id, name: cleanName };
  },

  async update(id, name) {
    const pool = getPool();
    const cleanId = String(id ?? "").trim();
    const cleanName = String(name ?? "").trim();
    if (!cleanId) throw new Error("id is required");
    if (!cleanName) throw new Error("name is required");

    await pool.query("UPDATE categories SET name=? WHERE id=?", [cleanName, cleanId]);
    return { id: cleanId, name: cleanName };
  },

  async remove(id) {
    const pool = getPool();
    const cleanId = String(id ?? "").trim();
    if (!cleanId) throw new Error("id is required");

    await pool.query("DELETE FROM categories WHERE id=?", [cleanId]);
    return { ok: true };
  },
};
