import { supabase } from '../supabaseClient'

export interface Billing {
  id: string
  establishment_id: string
  month: number
  year: number
  total_sales: number
  app_commission: number
  monthly_fee: number
  amount_due: number
  status: 'pending' | 'paid' | 'overdue'
  created_at: string
  establishment_name?: string
}

export const billingService = {
  async getBilling() {
    const { data, error } = await supabase
      .from('billing')
      .select(`
        *,
        establishment:establishments(name)
      `)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
    
    if (error) throw error
    
    return data.map(billing => ({
      ...billing,
      establishment_name: billing.establishment?.name
    })) as Billing[]
  },

  async createBilling(billing: Omit<Billing, 'id' | 'created_at' | 'establishment_name'>) {
    const { data, error } = await supabase
      .from('billing')
      .insert([billing])
      .select(`
        *,
        establishment:establishments(name)
      `)
    
    if (error) throw error
    
    const newBilling = data[0]
    return {
      ...newBilling,
      establishment_name: newBilling.establishment?.name
    } as Billing
  },

  async updateBillingStatus(id: string, status: Billing['status']) {
    const { data, error } = await supabase
      .from('billing')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        establishment:establishments(name)
      `)
    
    if (error) throw error
    
    const updatedBilling = data[0]
    return {
      ...updatedBilling,
      establishment_name: updatedBilling.establishment?.name
    } as Billing
  },

  async calculateBilling(establishmentId: string, month: number, year: number) {
    // Buscar estabelecimento
    const { data: establishment, error: estError } = await supabase
      .from('establishments')
      .select('monthly_fee, commission_rate')
      .eq('id', establishmentId)
      .single()

    if (estError) throw estError

    // Buscar pedidos do mês
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('establishment_id', establishmentId)
      .eq('status', 'delivered')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (ordersError) throw ordersError

    const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0)
    const appCommission = totalSales * (establishment.commission_rate / 100)
    const amountDue = appCommission + establishment.monthly_fee

    return {
      total_sales: totalSales,
      app_commission: appCommission,
      monthly_fee: establishment.monthly_fee,
      amount_due: amountDue
    }
  }
}