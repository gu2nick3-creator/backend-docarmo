import { randomUUID } from "crypto";
import { getPool } from "../db/pool.js";

function safeJsonParse(str, fallback) {
  try {
    if (!str) return fallback;
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export const ordersRepo = {
  async list() {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, status, total, items, customer, payment_id, created_at, updated_at
       FROM orders
       ORDER BY created_at DESC`
    );

    return (rows || []).map(r => ({
      ...r,
      total: Number(r.total || 0),
      items: safeJsonParse(r.items, []),
      customer: safeJsonParse(r.customer, null),
    }));
  },

  async create(payload) {
    const pool = getPool();

    const id = randomUUID();
    const status = payload.status || "pending";
    const total = Number(payload.total || 0);

    const itemsJson = JSON.stringify(payload.items || []);
    const customerJson = JSON.stringify(payload.customer || null);

    await pool.query(
      `INSERT INTO orders (id, status, total, items, customer, payment_id)
       VALUES (?,?,?,?,?,?)`,
      [id, status, total, itemsJson, customerJson, payload.payment_id || null]
    );

    return { id, status, total, items: payload.items || [], customer: payload.customer || null, payment_id: payload.payment_id || null };
  },

  async updateStatus(id, status, payment_id = null) {
    const pool = getPool();
    await pool.query(
      "UPDATE orders SET status=?, payment_id=? WHERE id=?",
      [status, payment_id, String(id)]
    );
    return { ok: true };
  },

  async getStatus(id) {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT id, status, payment_id FROM orders WHERE id=?",
      [String(id)]
    );
    return rows?.[0] || null;
  },
};
