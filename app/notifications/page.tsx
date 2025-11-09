'use client';

import { useState, useEffect } from 'react';
import { notificationsService, Notification } from '../../lib/supabase/notifications';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_audience: 'all' as 'all' | 'users' | 'establishments' | 'specific'
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notificationsData = await notificationsService.getNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      alert('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await notificationsService.sendNotification({
        ...formData,
        created_by: 'current-user-id' // Em uma app real, pegaria do auth
      });
      
      setFormData({
        title: '',
        message: '',
        target_audience: 'all'
      });
      setShowForm(false);
      await loadNotifications();
      alert('Notificação enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      alert('Erro ao enviar notificação');
    }
  };

  const deleteNotification = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta notificação?')) {
      try {
        await notificationsService.deleteNotification(id);
        await loadNotifications();
        alert('Notificação excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir notificação:', error);
        alert('Erro ao excluir notificação');
      }
    }
  };

  const getTargetColor = (target: Notification['target_audience']) => {
    const colors = {
      all: 'bg-purple-100 text-purple-800',
      users: 'bg-blue-100 text-blue-800',
      establishments: 'bg-green-100 text-green-800',
      specific: 'bg-orange-100 text-orange-800'
    };
    return colors[target];
  };

  const getTargetText = (target: Notification['target_audience']) => {
    const texts = {
      all: 'Todos',
      users: 'Usuários',
      establishments: 'Estabelecimentos',
      specific: 'Específico'
    };
    return texts[target];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sistema de Notificações</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          📢 Nova Notificação
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Enviar Notificação</h2>
          <form onSubmit={sendNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                placeholder="Título da notificação"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem
              </label>
              <textarea
                placeholder="Mensagem da notificação"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full border p-2 rounded h-24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Público-alvo
              </label>
              <select
                value={formData.target_audience}
                onChange={(e) => setFormData({...formData, target_audience: e.target.value as Notification['target_audience']})}
                className="w-full border p-2 rounded"
              >
                <option value="all">Todos os usuários</option>
                <option value="users">Apenas usuários</option>
                <option value="establishments">Apenas estabelecimentos</option>
                <option value="specific">Público específico</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                📤 Enviar Notificação
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{notification.title}</h3>
                <span className={`inline-block px-2 py-1 rounded text-xs ${getTargetColor(notification.target_audience)}`}>
                  {getTargetText(notification.target_audience)}
                </span>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>Enviado em: {new Date(notification.sent_at).toLocaleString('pt-BR')}</div>
                {notification.created_by_name && (
                  <div>Por: {notification.created_by_name}</div>
                )}
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{notification.message}</p>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                ID: {notification.id.slice(0, 8)}...
              </div>
              <button 
                onClick={() => deleteNotification(notification.id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">Nenhuma notificação enviada.</p>
          <button 
            onClick={() => setShowForm(true)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Enviar Primeira Notificação
          </button>
        </div>
      )}
    </div>
  );
}