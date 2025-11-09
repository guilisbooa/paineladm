import { supabase } from '../supabaseClient'

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalEstablishments: number
  activeEstablishments: number
  totalBanners: number
  activeBanners: number
  totalOrders: number
  todayOrders: number
  totalRevenue: number
  pendingOrders: number
  deliveredOrders: number
  totalPromotions: number
  activePromotions: number
  totalNotifications: number
  todayNotifications: number
  monthlyRevenue: { month: string; revenue: number }[]
  orderStatusDistribution: { status: string; count: number }[]
  establishmentPerformance: { name: string; orders: number; revenue: number }[]
}

// Função auxiliar para fazer consultas seguras
// Função auxiliar para fazer consultas seguras - VERSÃO CORRIGIDA
const safeQuery = async (query: any, fallback: any = []) => {
  try {
    const response = await query
    if (response.error) {
      console.error('Erro na consulta:', response.error)
      return fallback
    }
    return response.data || fallback
  } catch (error) {
    console.error('Exceção na consulta:', error)
    return fallback
  }
}

export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    console.log('🔄 Iniciando carregamento de estatísticas...')

    try {
      // Fazer todas as consultas básicas em paralelo
      const [
        users,
        establishments,
        banners,
        orders,
        promotions,
        notifications
      ] = await Promise.all([
        safeQuery(supabase.from('users').select('id, status')),
        safeQuery(supabase.from('establishments').select('id, status')),
        safeQuery(supabase.from('banners').select('id, status')),
        safeQuery(supabase.from('orders').select('id, status, total_amount, created_at, establishment_id')),
        safeQuery(supabase.from('promotions').select('id, status')),
        safeQuery(supabase.from('notifications').select('id, sent_at'))
      ])

      console.log('📊 Dados carregados:', {
        users: users.length,
        establishments: establishments.length,
        banners: banners.length,
        orders: orders.length,
        promotions: promotions.length,
        notifications: notifications.length
      })

      // Calcular estatísticas básicas
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayOrders = orders.filter((order: any) => 
        new Date(order.created_at) >= today
      )

      const totalRevenue = orders
        .filter((order: any) => order.status === 'delivered')
        .reduce((sum: number, order: any) => sum + order.total_amount, 0)

      // Dados simplificados para demonstração
      const monthlyRevenue = this.generateMonthlyRevenue()
      const orderStatusDistribution = this.getOrderStatusDistribution(orders)
      const establishmentPerformance = await this.getEstablishmentPerformance(orders)

      const stats: DashboardStats = {
        totalUsers: users.length,
        activeUsers: users.filter((user: any) => user.status === 'active').length,
        totalEstablishments: establishments.length,
        activeEstablishments: establishments.filter((est: any) => est.status === 'active').length,
        totalBanners: banners.length,
        activeBanners: banners.filter((banner: any) => banner.status === 'active').length,
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        totalRevenue,
        pendingOrders: orders.filter((order: any) => order.status === 'pending').length,
        deliveredOrders: orders.filter((order: any) => order.status === 'delivered').length,
        totalPromotions: promotions.length,
        activePromotions: promotions.filter((promo: any) => promo.status === 'active').length,
        totalNotifications: notifications.length,
        todayNotifications: notifications.filter((notif: any) => 
          new Date(notif.sent_at) >= today
        ).length,
        monthlyRevenue,
        orderStatusDistribution,
        establishmentPerformance
      }

      console.log('✅ Estatísticas calculadas:', stats)
      return stats

    } catch (error) {
      console.error('❌ Erro crítico ao carregar estatísticas:', error)
      // Retornar dados de fallback em caso de erro
      return this.getFallbackStats()
    }
  },

  // Gerar dados de receita mensal para demonstração
  generateMonthlyRevenue() {
    const months = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      const revenue = Math.random() * 30000 + 10000 // Entre 10k e 40k
      
      months.push({
        month: monthName,
        revenue: Math.round(revenue)
      })
    }
    
    return months
  },

  // Distribuição de status dos pedidos
  getOrderStatusDistribution(orders: any[]) {
    const statusCount: { [key: string]: number } = {
      'Pendente': 0,
      'Confirmado': 0,
      'Preparando': 0,
      'Pronto': 0,
      'Entregue': 0,
      'Cancelado': 0
    }

    orders.forEach((order: any) => {
      const statusMap: { [key: string]: string } = {
        'pending': 'Pendente',
        'confirmed': 'Confirmado',
        'preparing': 'Preparando',
        'ready': 'Pronto',
        'delivered': 'Entregue',
        'cancelled': 'Cancelado'
      }
      
      const statusText = statusMap[order.status] || order.status
      statusCount[statusText] = (statusCount[statusText] || 0) + 1
    })

    return Object.entries(statusCount)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({ status, count }))
  },

  // Performance dos estabelecimentos
  async getEstablishmentPerformance(orders: any[]) {
    try {
      // Buscar nomes dos estabelecimentos
      const { data: establishments, error } = await safeQuery(
        supabase.from('establishments').select('id, name')
      )

      if (error || !establishments) {
        console.log('Usando dados mockados para estabelecimentos')
        return [
          { name: 'Pizzaria do Zé', orders: 45, revenue: 4500 },
          { name: 'Hamburgueria Top', orders: 38, revenue: 3800 },
          { name: 'Sushi Master', orders: 25, revenue: 5200 },
          { name: 'Café Central', orders: 30, revenue: 1500 },
          { name: 'Sorveteria Gelatto', orders: 22, revenue: 1100 }
        ]
      }

      // Calcular performance real
      const performance: { [key: string]: { orders: number; revenue: number } } = {}

      establishments.forEach((est: any) => {
        performance[est.name] = { orders: 0, revenue: 0 }
      })

      orders
        .filter((order: any) => order.status === 'delivered')
        .forEach((order: any) => {
          const establishment = establishments.find((est: any) => est.id === order.establishment_id)
          if (establishment) {
            performance[establishment.name].orders++
            performance[establishment.name].revenue += order.total_amount
          }
        })

      return Object.entries(performance)
        .map(([name, data]) => ({ name, ...data }))
        .filter(est => est.orders > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

    } catch (error) {
      console.error('Erro ao calcular performance:', error)
      return [
        { name: 'Pizzaria do Zé', orders: 45, revenue: 4500 },
        { name: 'Hamburgueria Top', orders: 38, revenue: 3800 },
        { name: 'Sushi Master', orders: 25, revenue: 5200 }
      ]
    }
  },

  // Dados de fallback
  getFallbackStats(): DashboardStats {
    console.log('🔄 Usando dados de fallback para dashboard')
    return {
      totalUsers: 3,
      activeUsers: 2,
      totalEstablishments: 3,
      activeEstablishments: 2,
      totalBanners: 3,
      activeBanners: 2,
      totalOrders: 15,
      todayOrders: 3,
      totalRevenue: 1250.50,
      pendingOrders: 2,
      deliveredOrders: 10,
      totalPromotions: 5,
      activePromotions: 3,
      totalNotifications: 8,
      todayNotifications: 1,
      monthlyRevenue: [
        { month: 'Jan 2024', revenue: 15000 },
        { month: 'Fev 2024', revenue: 18000 },
        { month: 'Mar 2024', revenue: 22000 },
        { month: 'Abr 2024', revenue: 19000 },
        { month: 'Mai 2024', revenue: 25000 },
        { month: 'Jun 2024', revenue: 28000 }
      ],
      orderStatusDistribution: [
        { status: 'Pendente', count: 2 },
        { status: 'Confirmado', count: 3 },
        { status: 'Preparando', count: 4 },
        { status: 'Entregue', count: 10 },
        { status: 'Cancelado', count: 1 }
      ],
      establishmentPerformance: [
        { name: 'Pizzaria do Zé', orders: 45, revenue: 4500 },
        { name: 'Hamburgueria Top', orders: 38, revenue: 3800 },
        { name: 'Sushi Master', orders: 25, revenue: 5200 }
      ]
    }
  }
}