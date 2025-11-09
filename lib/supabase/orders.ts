import { supabase } from '../supabaseClient'

export interface OrderItem {
  name: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  user_id: string
  establishment_id: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  total_amount: number
  items: OrderItem[]
  created_at: string
  user_name?: string
  establishment_name?: string
}

export const ordersService = {
  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(name),
        establishment:establishments(name)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Formatando os dados
    return data.map(order => ({
      ...order,
      user_name: order.user?.name,
      establishment_name: order.establishment?.name
    })) as Order[]
  },

  async addOrder(order: Omit<Order, 'id' | 'created_at' | 'user_name' | 'establishment_name'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select(`
        *,
        user:users(name),
        establishment:establishments(name)
      `)
    
    if (error) throw error
    
    const newOrder = data[0]
    return {
      ...newOrder,
      user_name: newOrder.user?.name,
      establishment_name: newOrder.establishment?.name
    } as Order
  },

  async updateOrderStatus(id: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        user:users(name),
        establishment:establishments(name)
      `)
    
    if (error) throw error
    
    const updatedOrder = data[0]
    return {
      ...updatedOrder,
      user_name: updatedOrder.user?.name,
      establishment_name: updatedOrder.establishment?.name
    } as Order
  },

  async getOrdersStats() {
    const { data, error } = await supabase
      .from('orders')
      .select('status, total_amount, created_at')
    
    if (error) throw error

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = data.filter(order => 
      new Date(order.created_at) >= today
    )

    const totalRevenue = data
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total_amount, 0)

    return {
      totalOrders: data.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      pendingOrders: data.filter(order => order.status === 'pending').length,
      deliveredOrders: data.filter(order => order.status === 'delivered').length
    }
  }
}