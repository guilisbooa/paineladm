import { supabase } from '../supabaseClient'

export interface Banner {
  id: string
  title: string
  image_url: string
  status: 'active' | 'inactive'
  display_order: number
  created_at: string
}

export const bannersService = {
  async getBanners() {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data as Banner[]
  },

  async addBanner(banner: Omit<Banner, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('banners')
      .insert([banner])
      .select()
    
    if (error) throw error
    return data[0] as Banner
  },

  async updateBanner(id: string, updates: Partial<Banner>) {
    const { data, error } = await supabase
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0] as Banner
  },

  async deleteBanner(id: string) {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}