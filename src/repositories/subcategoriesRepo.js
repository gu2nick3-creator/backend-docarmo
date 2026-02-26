import { randomUUID } from "crypto";
import { getPool } from "../db/pool.js";

export const subcategoriesRepo = {
  async list() {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, category_id, name, created_at FROM subcategories ORDER BY created_at DESC"
    );

    // normaliza pra categoryId no JSON
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      categoryId: r.category_id,
      created_at: r.created_at,
    }));
  },

  async create({ name, categoryId }) {
    const pool = getPool();
    const id = randomUUID();
    await pool.query(
      "INSERT INTO subcategories (id, name, category_id) VALUES (?,?,?)",
      [id, name, categoryId]
    );
    return { id, name, categoryId };
  },

  async update(id, { name, categoryId }) {
    const pool = getPool();
    await pool.query(
      "UPDATE subcategories SET name=?, category_id=? WHERE id=?",
      [name, categoryId, id]
    );
    return { id, name, categoryId };
  },

  async remove(id) {
    const pool = getPool();
    await pool.query("DELETE FROM subcategories WHERE id=?", [id]);
    return { ok: true };
  },
};
