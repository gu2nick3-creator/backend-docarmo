import { randomUUID } from "crypto";
import { getPool } from "../db/pool.js";

export const productsRepo = {
  async list() {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.price, p.description, p.image,
             p.category_id, p.subcategory_id,
             p.sizes_json, p.colors_json, p.created_at
      FROM products p
      ORDER BY p.created_at DESC
    `);

    return rows.map((r) => normalizeRow(r));
  },

  async getById(id) {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM products WHERE id=?", [id]);
    const p = rows[0];
    if (!p) return null;
    return normalizeRow(p);
  },

  async create(payload) {
    const pool = getPool();

    const id = randomUUID();

    const name = String(payload?.name ?? "").trim();
    const price = Number(payload?.price ?? 0);

    // aceita categoryId/subcategoryId (front) ou category_id/subcategory_id (antigo)
    const categoryId = String(payload?.categoryId ?? payload?.category_id ?? "").trim();
    const subcategoryIdRaw = String(payload?.subcategoryId ?? payload?.subcategory_id ?? "").trim();
    const subcategoryId = subcategoryIdRaw ? subcategoryIdRaw : null;

    if (!name) throw new Error("name is required");
    if (!categoryId) throw new Error("categoryId is required");

    const description = payload?.description ? String(payload.description) : null;
    const image = payload?.image ? String(payload.image) : null;

    const sizes = Array.isArray(payload?.sizes) ? payload.sizes : [];
    const colors = Array.isArray(payload?.colors) ? payload.colors : [];

    await pool.query(
      `INSERT INTO products
       (id, name, price, description, image, category_id, subcategory_id, sizes_json, colors_json)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        id,
        name,
        price,
        description,
        image,
        categoryId,
        subcategoryId,
        JSON.stringify(sizes),
        JSON.stringify(colors),
      ]
    );

    // retorna no formato que o front usa
    return {
      id,
      name,
      price,
      description: description ?? "",
      image: image ?? "",
      categoryId,
      subcategoryId: subcategoryId ?? "",
      sizes,
      colors,
    };
  },

  async update(id, payload) {
    const pool = getPool();

    const cleanId = String(id ?? "").trim();
    if (!cleanId) throw new Error("id is required");

    const name = String(payload?.name ?? "").trim();
    const price = Number(payload?.price ?? 0);

    const categoryId = String(payload?.categoryId ?? payload?.category_id ?? "").trim();
    const subcategoryIdRaw = String(payload?.subcategoryId ?? payload?.subcategory_id ?? "").trim();
    const subcategoryId = subcategoryIdRaw ? subcategoryIdRaw : null;

    if (!name) throw new Error("name is required");
    if (!categoryId) throw new Error("categoryId is required");

    const description = payload?.description ? String(payload.description) : null;
    const image = payload?.image ? String(payload.image) : null;

    const sizes = Array.isArray(payload?.sizes) ? payload.sizes : [];
    const colors = Array.isArray(payload?.colors) ? payload.colors : [];

    await pool.query(
      `UPDATE products
       SET name=?, price=?, description=?, image=?, category_id=?, subcategory_id=?, sizes_json=?, colors_json=?
       WHERE id=?`,
      [
        name,
        price,
        description,
        image,
        categoryId,
        subcategoryId,
        JSON.stringify(sizes),
        JSON.stringify(colors),
        cleanId,
      ]
    );

    return {
      id: cleanId,
      name,
      price,
      description: description ?? "",
      image: image ?? "",
      categoryId,
      subcategoryId: subcategoryId ?? "",
      sizes,
      colors,
    };
  },

  async remove(id) {
    const pool = getPool();
    const cleanId = String(id ?? "").trim();
    await pool.query("DELETE FROM products WHERE id=?", [cleanId]);
    return { ok: true };
  },
};

function normalizeRow(r) {
  return {
    id: String(r.id ?? ""),
    name: r.name,
    price: Number(r.price ?? 0),
    description: r.description ?? "",
    image: r.image ?? "",
    categoryId: r.category_id ?? "",
    subcategoryId: r.subcategory_id ?? "",
    sizes: safeJson(r.sizes_json, []),
    colors: safeJson(r.colors_json, []),
    created_at: r.created_at,
  };
}

function safeJson(str, fallback) {
  try {
    return JSON.parse(str || "");
  } catch {
    return fallback;
  }
}
