import { getPool } from "../db/pool.js";

export const ordersRepo = {
  async list() {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM orders ORDER BY id DESC");
    return rows;
  },
  async create(payload) {
    const pool = getPool();
    const [r] = await pool.query(
      `INSERT INTO orders (status, total_amount, customer_name, customer_email)
       VALUES (?,?,?,?)`,
      [payload.status || "pending", payload.total_amount || 0, payload.customer_name || null, payload.customer_email || null]
    );
    return { id: r.insertId, ...payload };
  },
  async updateStatus(id, status, payment_id=null) {
    const pool = getPool();
    await pool.query("UPDATE orders SET status=?, payment_id=? WHERE id=?", [status, payment_id, id]);
    return { ok: true };
  },
  async getStatus(id) {
    const pool = getPool();
    const [rows] = await pool.query("SELECT id, status, payment_id FROM orders WHERE id=?", [id]);
    return rows[0] || null;
  }
};
