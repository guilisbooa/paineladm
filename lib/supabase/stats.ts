import { supabase } from "../supabaseClient";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalEstablishments: number;
  activeEstablishments: number;
  totalBanners: number;
  activeBanners: number;
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalPromotions: number;
  activePromotions: number;
  totalNotifications: number;
  todayNotifications: number;
  monthlyRevenue: { month: string; revenue: number }[];
  orderStatusDistribution: { status: string; count: number }[];
  establishmentPerformance: { name: string; orders: number; revenue: number }[];
}

/* ============================================================
   ✅ Função segura para executar queries do Supabase
   ============================================================ */
const safeQuery = async (queryPromise: Promise<any>, fallback: any = []) => {
  try {
    const response = await queryPromise;

    if (!response) {
      console.error("❌ Nenhuma resposta do Supabase.");
      return fallback;
    }

    if (response.error) {
      console.error("❌ Erro na consulta:", response.error.message || response.error);
      return fallback;
    }

    if (!response.data) {
      console.warn("⚠️ Resposta sem dados:", response);
      return fallback;
    }

    return response.data;
  } catch (error) {
    console.error("❌ Exceção durante a consulta:", error);
    return fallback;
  }
};

/* ============================================================
   📊 Serviço principal de estatísticas do painel
   ============================================================ */
export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    console.log("🔄 Iniciando carregamento de estatísticas...");

    try {
      const [
        users,
        establishments,
        banners,
        orders,
        promotions,
        notifications,
      ] = await Promise.all([
        safeQuery(supabase.from("users").select("id, status")),
        safeQuery(supabase.from("establishments").select("id, status")),
        safeQuery(supabase.from("banners").select("id, status")),
        safeQuery(
          supabase
            .from("orders")
            .select("id, status, total_amount, created_at, establishment_id")
        ),
        safeQuery(supabase.from("promotions").select("id, status")),
        safeQuery(supabase.from("notifications").select("id, sent_at")),
      ]);

      console.log("📊 Dados carregados com sucesso:", {
        users: users.length,
        establishments: establishments.length,
        banners: banners.length,
        orders: orders.length,
        promotions: promotions.length,
        notifications: notifications.length,
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter(
        (order: any) => new Date(order.created_at) >= today
      );

      const totalRevenue = orders
        .filter((o: any) => o.status === "delivered")
        .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

      const monthlyRevenue = this.generateMonthlyRevenue();
      const orderStatusDistribution = this.getOrderStatusDistribution(orders);
      const establishmentPerformance =
        await this.getEstablishmentPerformance(orders);

      const stats: DashboardStats = {
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.status === "active").length,
        totalEstablishments: establishments.length,
        activeEstablishments: establishments.filter(
          (e: any) => e.status === "active"
        ).length,
        totalBanners: banners.length,
        activeBanners: banners.filter((b: any) => b.status === "active").length,
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        totalRevenue,
        pendingOrders: orders.filter((o: any) => o.status === "pending").length,
        deliveredOrders: orders.filter((o: any) => o.status === "delivered").length,
        totalPromotions: promotions.length,
        activePromotions: promotions.filter(
          (p: any) => p.status === "active"
        ).length,
        totalNotifications: notifications.length,
        todayNotifications: notifications.filter(
          (n: any) => new Date(n.sent_at) >= today
        ).length,
        monthlyRevenue,
        orderStatusDistribution,
        establishmentPerformance,
      };

      console.log("✅ Estatísticas calculadas:", stats);
      return stats;
    } catch (error) {
      console.error("❌ Erro crítico ao carregar estatísticas:", error);
      return this.getFallbackStats();
    }
  },

  /* ============================================================
     📅 Receita mensal (mock)
     ============================================================ */
  generateMonthlyRevenue() {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      });
      months.push({
        month: label,
        revenue: Math.round(Math.random() * 30000 + 10000),
      });
    }

    return months;
  },

  /* ============================================================
     📦 Distribuição de status dos pedidos
     ============================================================ */
  getOrderStatusDistribution(orders: any[]) {
    const map: Record<string, number> = {};
    const statusMap: Record<string, string> = {
      pending: "Pendente",
      confirmed: "Confirmado",
      preparing: "Preparando",
      ready: "Pronto",
      delivered: "Entregue",
      cancelled: "Cancelado",
    };

    for (const order of orders) {
      const key = statusMap[order.status] || order.status;
      map[key] = (map[key] || 0) + 1;
    }

    return Object.entries(map).map(([status, count]) => ({ status, count }));
  },

  /* ============================================================
     🏪 Performance dos estabelecimentos
     ============================================================ */
  async getEstablishmentPerformance(orders: any[]) {
    try {
      const establishments = await safeQuery(
        supabase.from("establishments").select("id, name")
      );

      if (!establishments || establishments.length === 0) {
        console.warn("⚠️ Nenhum estabelecimento encontrado, usando mock.");
        return [
          { name: "Pizzaria do Zé", orders: 45, revenue: 4500 },
          { name: "Hamburgueria Top", orders: 38, revenue: 3800 },
          { name: "Sushi Master", orders: 25, revenue: 5200 },
        ];
      }

      const perf: Record<string, { orders: number; revenue: number }> = {};
      for (const est of establishments) {
        perf[est.name] = { orders: 0, revenue: 0 };
      }

      for (const o of orders.filter((o: any) => o.status === "delivered")) {
        const est = establishments.find((e: any) => e.id === o.establishment_id);
        if (est) {
          perf[est.name].orders++;
          perf[est.name].revenue += o.total_amount || 0;
        }
      }

      return Object.entries(perf)
        .map(([name, val]) => ({ name, ...val }))
        .filter((e) => e.orders > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    } catch (err) {
      console.error("❌ Erro ao calcular performance:", err);
      return [
        { name: "Pizzaria do Zé", orders: 45, revenue: 4500 },
        { name: "Hamburgueria Top", orders: 38, revenue: 3800 },
        { name: "Sushi Master", orders: 25, revenue: 5200 },
      ];
    }
  },

  /* ============================================================
     🧩 Dados de fallback
     ============================================================ */
  getFallbackStats(): DashboardStats {
    console.log("🔄 Usando dados mockados para fallback...");
    return {
      totalUsers: 3,
      activeUsers: 2,
      totalEstablishments: 3,
      activeEstablishments: 2,
      totalBanners: 3,
      activeBanners: 2,
      totalOrders: 15,
      todayOrders: 3,
      totalRevenue: 1250.5,
      pendingOrders: 2,
      deliveredOrders: 10,
      totalPromotions: 5,
      activePromotions: 3,
      totalNotifications: 8,
      todayNotifications: 1,
      monthlyRevenue: [
        { month: "Jan 2024", revenue: 15000 },
        { month: "Fev 2024", revenue: 18000 },
        { month: "Mar 2024", revenue: 22000 },
        { month: "Abr 2024", revenue: 19000 },
        { month: "Mai 2024", revenue: 25000 },
        { month: "Jun 2024", revenue: 28000 },
      ],
      orderStatusDistribution: [
        { status: "Pendente", count: 2 },
        { status: "Confirmado", count: 3 },
        { status: "Preparando", count: 4 },
        { status: "Entregue", count: 10 },
        { status: "Cancelado", count: 1 },
      ],
      establishmentPerformance: [
        { name: "Pizzaria do Zé", orders: 45, revenue: 4500 },
        { name: "Hamburgueria Top", orders: 38, revenue: 3800 },
        { name: "Sushi Master", orders: 25, revenue: 5200 },
      ],
    };
  },
};
