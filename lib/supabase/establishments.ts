import { supabase } from '../supabaseClient'

export interface Establishment {
  id: string
  name: string
  category: string
  monthly_fee: number
  commission_rate: number
  status: 'active' | 'paused' | 'inactive'
  address_street?: string
  address_city?: string
  address_state?: string
  address_zipcode?: string
  created_at: string
}

export const establishmentsService = {
  async getEstablishments() {
    const { data, error } = await supabase
      .from('establishments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Establishment[]
  },

  async addEstablishment(establishment: Omit<Establishment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('establishments')
      .insert([establishment])
      .select()
    
    if (error) throw error
    return data[0] as Establishment
  },

  async updateEstablishment(id: string, updates: Partial<Establishment>) {
    const { data, error } = await supabase
      .from('establishments')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0] as Establishment
  },

  async deleteEstablishment(id: string) {
    const { error } = await supabase
      .from('establishments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}