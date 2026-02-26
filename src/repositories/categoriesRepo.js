import { getPool } from "../db/pool.js";

export const categoriesRepo = {
  async list() {
    const pool = getPool();
    const [rows] = await pool.query("SELECT id, name, created_at FROM categories ORDER BY id DESC");
    return rows;
  },
  async create(name) {
    const pool = getPool();
    const [r] = await pool.query("INSERT INTO categories (name) VALUES (?)", [name]);
    return { id: r.insertId, name };
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
  }
};
