'use client';

import { useState, useEffect } from 'react';
import { bannersService, Banner } from '../../lib/supabase/banners';

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    display_order: ''
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const bannersData = await bannersService.getBanners();
      setBanners(bannersData);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
      alert('Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  };

  const addBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bannersService.addBanner({
        title: formData.title,
        image_url: formData.image_url,
        display_order: parseInt(formData.display_order),
        status: 'active'
      });
      
      setFormData({
        title: '',
        image_url: '',
        display_order: ''
      });
      setShowForm(false);
      await loadBanners();
      alert('Banner adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar banner:', error);
      alert('Erro ao adicionar banner');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await bannersService.updateBanner(id, { 
        status: status as Banner['status'] 
      });
      await loadBanners();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const deleteBanner = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este banner?')) {
      try {
        await bannersService.deleteBanner(id);
        await loadBanners();
        alert('Banner excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir banner:', error);
        alert('Erro ao excluir banner');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Banners</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Novo Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Adicionar Banner</h2>
          <form onSubmit={addBanner} className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Título do Banner"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <input
              type="url"
              placeholder="URL da Imagem"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Ordem de Exibição"
              value={formData.display_order}
              onChange={(e) => setFormData({...formData, display_order: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                Salvar
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-lg shadow overflow-hidden">
            <img 
              src={banner.image_url} 
              alt={banner.title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x300?text=Imagem+Não+Encontrada';
              }}
            />
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{banner.title}</h3>
              <p className="text-gray-600 text-sm">Ordem: {banner.display_order}</p>
              
              <div className="flex justify-between items-center mt-4">
                <select 
                  value={banner.status}
                  onChange={(e) => updateStatus(banner.id, e.target.value)}
                  className={`border rounded px-2 py-1 text-sm ${
                    banner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
                
                <button 
                  onClick={() => deleteBanner(banner.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">Nenhum banner cadastrado.</p>
          <button 
            onClick={() => setShowForm(true)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Adicionar Primeiro Banner
          </button>
        </div>
      )}
    </div>
  );
}