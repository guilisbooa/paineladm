import { supabase } from '../supabaseClient'

export interface Notification {
  id: string
  title: string
  message: string
  target_audience: 'all' | 'users' | 'establishments' | 'specific'
  sent_at: string
  created_by?: string
  created_at: string
  created_by_name?: string
}

export const notificationsService = {
  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        created_by_user:users(name)
      `)
      .order('sent_at', { ascending: false })
    
    if (error) throw error
    
    return data.map(notification => ({
      ...notification,
      created_by_name: notification.created_by_user?.name
    })) as Notification[]
  },

  async sendNotification(notification: Omit<Notification, 'id' | 'sent_at' | 'created_at' | 'created_by_name'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        ...notification,
        sent_at: new Date().toISOString()
      }])
      .select(`
        *,
        created_by_user:users(name)
      `)
    
    if (error) throw error
    
    const newNotification = data[0]
    return {
      ...newNotification,
      created_by_name: newNotification.created_by_user?.name
    } as Notification
  },

  async deleteNotification(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async getNotificationsStats() {
    const { data, error } = await supabase
      .from('notifications')
      .select('target_audience, sent_at')
    
    if (error) throw error

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayNotifications = data.filter(notification => 
      new Date(notification.sent_at) >= today
    )

    return {
      totalNotifications: data.length,
      todayNotifications: todayNotifications.length,
      allAudience: data.filter(n => n.target_audience === 'all').length,
      usersAudience: data.filter(n => n.target_audience === 'users').length,
      establishmentsAudience: data.filter(n => n.target_audience === 'establishments').length
    }
  }
}