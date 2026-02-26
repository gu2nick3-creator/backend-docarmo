import { getPool } from "../db/pool.js";

export const subcategoriesRepo = {
  async list() {
    const pool = getPool();
    const [rows] = await pool.query("SELECT id, category_id, name, created_at FROM subcategories ORDER BY id DESC");
    return rows;
  },
  async create({ name, category_id }) {
    const pool = getPool();
    const [r] = await pool.query("INSERT INTO subcategories (name, category_id) VALUES (?,?)", [name, category_id]);
    return { id: r.insertId, name, category_id };
  },
  async update(id, payload) {
    const pool = getPool();
    await pool.query("UPDATE subcategories SET name=?, category_id=? WHERE id=?", [payload.name, payload.category_id, id]);
    return { id, ...payload };
  },
  async remove(id) {
    const pool = getPool();
    await pool.query("DELETE FROM subcategories WHERE id=?", [id]);
    return { ok: true };
  }
};
