import { supabase } from '../supabaseClient'

export interface Promotion {
  id: string
  title: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_value?: number
  max_uses?: number
  used_count: number
  valid_until?: string
  status: 'active' | 'inactive'
  created_at: string
}

export const promotionsService = {
  async getPromotions() {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Promotion[]
  },

  async addPromotion(promotion: Omit<Promotion, 'id' | 'created_at' | 'used_count'>) {
    const { data, error } = await supabase
      .from('promotions')
      .insert([{
        ...promotion,
        used_count: 0
      }])
      .select()
    
    if (error) throw error
    return data[0] as Promotion
  },

  async updatePromotion(id: string, updates: Partial<Promotion>) {
    const { data, error } = await supabase
      .from('promotions')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0] as Promotion
  },

  async deletePromotion(id: string) {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}