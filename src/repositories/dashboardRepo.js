import { getPool } from "../db/pool.js";

export const dashboardRepo = {
  async metrics() {
    const pool = getPool();

    // total e quantidade
    const [totalsRows] = await pool.query(`
      SELECT
        COALESCE(SUM(total), 0) AS totalRevenue,
        COUNT(*) AS totalOrders
      FROM orders
    `);

    const totalRevenue = Number(totalsRows?.[0]?.totalRevenue ?? 0);
    const totalOrders = Number(totalsRows?.[0]?.totalOrders ?? 0);
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // status counts
    const [statusRows] = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM orders
      GROUP BY status
    `);

    const mapStatus = (s) => {
      const x = String(s || "").toLowerCase();
      if (x === "pending" || x === "pendente") return "Pendente";
      if (x === "delivered" || x === "entregue") return "Entregue";
      if (x === "canceled" || x === "cancelled" || x === "cancelado") return "Cancelado";
      if (x === "finished" || x === "finalizado" || x === "paid" || x === "approved") return "Finalizado";
      return String(s || "");
    };

    const statusCounts = { Pendente: 0, Entregue: 0, Cancelado: 0, Finalizado: 0 };

    for (const r of statusRows || []) {
      const key = mapStatus(r.status);
      statusCounts[key] = Number(statusCounts[key] || 0) + Number(r.count || 0);
    }

    const pendingOrders = Number(statusCounts.Pendente || 0);

    return {
      totalRevenue,
      totalOrders,
      avgTicket,
      pendingOrders,
      statusCounts,
    };
  },
};
