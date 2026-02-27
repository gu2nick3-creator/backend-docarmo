import { getPool } from "../db/pool.js";

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const ordersRepo = {
  async list() {
    const pool = getPool();
    // sua tabela tem created_at, então ordena por ele (melhor que id)
    const [rows] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    return rows;
  },

  async create(payload) {
    const pool = getPool();

    // aceita vários formatos pra não quebrar o front
    const total = toNumber(payload.total ?? payload.total_amount ?? payload.totalAmount, 0);

    // no seu banco: items LONGTEXT, customer LONGTEXT (ideal guardar JSON)
    const items =
      payload.items !== undefined
        ? JSON.stringify(payload.items)
        : null;

    const customer =
      payload.customer !== undefined
        ? JSON.stringify(payload.customer)
        : null;

    const status = payload.status || "pending";

    const [r] = await pool.query(
      `INSERT INTO orders (status, total, items, customer)
       VALUES (?,?,?,?)`,
      [status, total, items, customer]
    );

    return { id: r.insertId, status, total, items, customer };
  },

  async updateStatus(id, status, payment_id = null) {
    const pool = getPool();
    await pool.query("UPDATE orders SET status=?, payment_id=? WHERE id=?", [
      status,
      payment_id,
      id,
    ]);
    return { ok: true };
  },

  async getStatus(id) {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, status, payment_id FROM orders WHERE id=?",
      [id]
    );
    return rows[0] || null;
  },
};
