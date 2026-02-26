import { getPool } from "../db/pool.js";

export const productsRepo = {
  async list() {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.price, p.description, p.category_id, p.subcategory_id,
             p.sizes_json, p.colors_json, p.created_at
      FROM products p
      ORDER BY p.id DESC
    `);
    return rows.map(r => ({
      ...r,
      sizes: safeJson(r.sizes_json, []),
      colors: safeJson(r.colors_json, [])
    }));
  },
  async getById(id) {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM products WHERE id=?", [id]);
    const p = rows[0];
    if (!p) return null;
    return {
      ...p,
      sizes: safeJson(p.sizes_json, []),
      colors: safeJson(p.colors_json, [])
    };
  },
  async create(payload) {
    const pool = getPool();
    const [r] = await pool.query(
      `INSERT INTO products (name, price, description, category_id, subcategory_id, sizes_json, colors_json)
       VALUES (?,?,?,?,?,?,?)`,
      [
        payload.name,
        payload.price,
        payload.description || null,
        payload.category_id || null,
        payload.subcategory_id || null,
        JSON.stringify(payload.sizes || []),
        JSON.stringify(payload.colors || [])
      ]
    );
    return { id: r.insertId, ...payload };
  },
  async update(id, payload) {
    const pool = getPool();
    await pool.query(
      `UPDATE products
       SET name=?, price=?, description=?, category_id=?, subcategory_id=?, sizes_json=?, colors_json=?
       WHERE id=?`,
      [
        payload.name,
        payload.price,
        payload.description || null,
        payload.category_id || null,
        payload.subcategory_id || null,
        JSON.stringify(payload.sizes || []),
        JSON.stringify(payload.colors || []),
        id
      ]
    );
    return { id, ...payload };
  },
  async remove(id) {
    const pool = getPool();
    await pool.query("DELETE FROM products WHERE id=?", [id]);
    return { ok: true };
  }
};

function safeJson(str, fallback) {
  try { return JSON.parse(str || ""); } catch { return fallback; }
}
