'use client';

import { useState, useEffect } from 'react';
import { promotionsService, Promotion } from '../../lib/supabase/promotions';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_value: '',
    max_uses: '',
    valid_until: ''
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const promotionsData = await promotionsService.getPromotions();
      setPromotions(promotionsData);
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
      alert('Erro ao carregar promoções');
    } finally {
      setLoading(false);
    }
  };

  const addPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await promotionsService.addPromotion({
        title: formData.title,
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) : undefined,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : undefined,
        valid_until: formData.valid_until || undefined,
        status: 'active'
      });
      
      setFormData({
        title: '',
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_value: '',
        max_uses: '',
        valid_until: ''
      });
      setShowForm(false);
      await loadPromotions();
      alert('Promoção criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar promoção:', error);
      alert('Erro ao criar promoção');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await promotionsService.updatePromotion(id, { 
        status: status as Promotion['status'] 
      });
      await loadPromotions();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const deletePromotion = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta promoção?')) {
      try {
        await promotionsService.deletePromotion(id);
        await loadPromotions();
        alert('Promoção excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir promoção:', error);
        alert('Erro ao excluir promoção');
      }
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando promoções...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Promoções e Cupons</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Nova Promoção
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Criar Nova Promoção</h2>
          <form onSubmit={addPromotion} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Título da Promoção"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Código do Cupom"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <select
              value={formData.discount_type}
              onChange={(e) => setFormData({...formData, discount_type: e.target.value as 'percentage' | 'fixed'})}
              className="border p-2 rounded"
            >
              <option value="percentage">Porcentagem</option>
              <option value="fixed">Valor Fixo</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder={formData.discount_type === 'percentage' ? 'Desconto (%)' : 'Desconto (R$)'}
              value={formData.discount_value}
              onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Valor Mínimo do Pedido (opcional)"
              value={formData.min_order_value}
              onChange={(e) => setFormData({...formData, min_order_value: e.target.value})}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Máximo de Usos (opcional)"
              value={formData.max_uses}
              onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
              className="border p-2 rounded"
            />
            <input
              type="datetime-local"
              placeholder="Válido Até (opcional)"
              value={formData.valid_until}
              onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
              className="border p-2 rounded md:col-span-2"
            />
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                Criar Promoção
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
        {promotions.map((promotion) => (
          <div key={promotion.id} className={`bg-white rounded-lg shadow overflow-hidden border-l-4 ${
            promotion.status === 'active' && (!promotion.valid_until || !isExpired(promotion.valid_until)) 
              ? 'border-green-500' 
              : 'border-red-500'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{promotion.title}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {promotion.code}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-2xl font-bold text-green-600">
                  {promotion.discount_type === 'percentage' 
                    ? `${promotion.discount_value}%` 
                    : `R$ ${promotion.discount_value.toFixed(2)}`
                  }
                </p>
                {promotion.min_order_value && (
                  <p className="text-sm text-gray-600">
                    Mínimo: R$ {promotion.min_order_value.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Usos:</span>
                  <span>{promotion.used_count}{promotion.max_uses ? ` / ${promotion.max_uses}` : ''}</span>
                </div>
                {promotion.valid_until && (
                  <div className="flex justify-between">
                    <span>Válido até:</span>
                    <span className={isExpired(promotion.valid_until) ? 'text-red-600' : ''}>
                      {new Date(promotion.valid_until).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-4">
                <select 
                  value={promotion.status}
                  onChange={(e) => updateStatus(promotion.id, e.target.value)}
                  className={`border rounded px-2 py-1 text-sm ${
                    promotion.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
                
                <button 
                  onClick={() => deletePromotion(promotion.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {promotions.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">Nenhuma promoção cadastrada.</p>
          <button 
            onClick={() => setShowForm(true)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Criar Primeira Promoção
          </button>
        </div>
      )}
    </div>
  );
}