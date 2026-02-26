import { randomUUID } from "crypto";
import { getPool } from "../db/pool.js";

export const categoriesRepo = {
  async list() {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, name, created_at FROM categories ORDER BY created_at DESC"
    );
    return rows;
  },

  async create(name) {
    const pool = getPool();
    const id = randomUUID();
    await pool.query("INSERT INTO categories (id, name) VALUES (?, ?)", [id, name]);
    return { id, name };
  },

  async update(id, name) {
    const pool = getPool();
    await pool.query("UPDATE categories SET name=? WHERE id=?", [name, id]);
    return { id, name };
  },

  async remove(id) {
    const pool = getPool();
    await pool.query("DELETE FROM categories WHERE id=?", [id]);
    return { ok: true };
  },
};
