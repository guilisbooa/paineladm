'use client';

import { useState, useEffect } from 'react';
import { establishmentsService, Establishment } from '../../lib/supabase/establishments';

export default function EstablishmentsPage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    monthly_fee: '',
    commission_rate: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_zipcode: ''
  });

  useEffect(() => {
    loadEstablishments();
  }, []);

  const loadEstablishments = async () => {
    try {
      setLoading(true);
      const establishmentsData = await establishmentsService.getEstablishments();
      setEstablishments(establishmentsData);
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
      alert('Erro ao carregar estabelecimentos');
    } finally {
      setLoading(false);
    }
  };

  const addEstablishment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await establishmentsService.addEstablishment({
        name: formData.name,
        category: formData.category,
        monthly_fee: parseFloat(formData.monthly_fee),
        commission_rate: parseFloat(formData.commission_rate),
        status: 'active',
        address_street: formData.address_street || undefined,
        address_city: formData.address_city || undefined,
        address_state: formData.address_state || undefined,
        address_zipcode: formData.address_zipcode || undefined
      });
      
      setFormData({
        name: '',
        category: '',
        monthly_fee: '',
        commission_rate: '',
        address_street: '',
        address_city: '',
        address_state: '',
        address_zipcode: ''
      });
      setShowForm(false);
      await loadEstablishments();
      alert('Estabelecimento adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar estabelecimento:', error);
      alert('Erro ao adicionar estabelecimento');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await establishmentsService.updateEstablishment(id, { 
        status: status as Establishment['status'] 
      });
      await loadEstablishments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const deleteEstablishment = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este estabelecimento?')) {
      try {
        await establishmentsService.deleteEstablishment(id);
        await loadEstablishments();
        alert('Estabelecimento excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir estabelecimento:', error);
        alert('Erro ao excluir estabelecimento');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando estabelecimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Estabelecimentos</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Novo Estabelecimento
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Adicionar Estabelecimento</h2>
          <form onSubmit={addEstablishment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome do Estabelecimento"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Categoria (ex: Pizzaria, Lanches)"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Taxa Mensal (R$)"
              value={formData.monthly_fee}
              onChange={(e) => setFormData({...formData, monthly_fee: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Comissão (%)"
              value={formData.commission_rate}
              onChange={(e) => setFormData({...formData, commission_rate: e.target.value})}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Rua"
              value={formData.address_street}
              onChange={(e) => setFormData({...formData, address_street: e.target.value})}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Cidade"
              value={formData.address_city}
              onChange={(e) => setFormData({...formData, address_city: e.target.value})}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Estado"
              value={formData.address_state}
              onChange={(e) => setFormData({...formData, address_state: e.target.value})}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="CEP"
              value={formData.address_zipcode}
              onChange={(e) => setFormData({...formData, address_zipcode: e.target.value})}
              className="border p-2 rounded"
            />
            <div className="md:col-span-2 flex gap-2">
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa Mensal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comissão</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {establishments.map((est) => (
              <tr key={est.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{est.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{est.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">R$ {est.monthly_fee.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{est.commission_rate}%</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select 
                    value={est.status}
                    onChange={(e) => updateStatus(est.id, e.target.value)}
                    className={`border rounded px-2 py-1 text-sm ${
                      est.status === 'active' ? 'bg-green-100' :
                      est.status === 'paused' ? 'bg-yellow-100' :
                      'bg-red-100'
                    }`}
                  >
                    <option value="active">Ativo</option>
                    <option value="paused">Pausado</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => deleteEstablishment(est.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {establishments.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">Nenhum estabelecimento cadastrado.</p>
          <button 
            onClick={() => setShowForm(true)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Adicionar Primeiro Estabelecimento
          </button>
        </div>
      )}
    </div>
  );
}