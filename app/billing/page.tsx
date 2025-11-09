'use client';

import { useState, useEffect } from 'react';
import { billingService, Billing } from '../../lib/supabase/billing';
import { establishmentsService, Establishment } from '../../lib/supabase/establishments';

export default function BillingPage() {
  const [billing, setBilling] = useState<Billing[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    establishment_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [calculationResult, setCalculationResult] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [billingData, establishmentsData] = await Promise.all([
        billingService.getBilling(),
        establishmentsService.getEstablishments()
      ]);
      setBilling(billingData);
      setEstablishments(establishmentsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const calculateBilling = async () => {
    try {
      const result = await billingService.calculateBilling(
        calculatorData.establishment_id,
        calculatorData.month,
        calculatorData.year
      );
      setCalculationResult(result);
    } catch (error) {
      console.error('Erro ao calcular cobrança:', error);
      alert('Erro ao calcular cobrança');
    }
  };

  const createBilling = async () => {
    if (!calculationResult) return;

    try {
      await billingService.createBilling({
        establishment_id: calculatorData.establishment_id,
        month: calculatorData.month,
        year: calculatorData.year,
        total_sales: calculationResult.total_sales,
        app_commission: calculationResult.app_commission,
        monthly_fee: calculationResult.monthly_fee,
        amount_due: calculationResult.amount_due,
        status: 'pending'
      });

      setShowCalculator(false);
      setCalculationResult(null);
      await loadData();
      alert('Cobrança criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar cobrança:', error);
      alert('Erro ao criar cobrança');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await billingService.updateBillingStatus(id, status as Billing['status']);
      await loadData();
      alert('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const getStatusColor = (status: Billing['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando cobranças...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Painel de Cobranças</h1>
        <button 
          onClick={() => setShowCalculator(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Nova Cobrança
        </button>
      </div>

      {showCalculator && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Calcular Cobrança</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select
              value={calculatorData.establishment_id}
              onChange={(e) => setCalculatorData({...calculatorData, establishment_id: e.target.value})}
              className="border p-2 rounded"
              required
            >
              <option value="">Selecione um estabelecimento</option>
              {establishments.map((est) => (
                <option key={est.id} value={est.id}>{est.name}</option>
              ))}
            </select>
            <select
              value={calculatorData.month}
              onChange={(e) => setCalculatorData({...calculatorData, month: parseInt(e.target.value)})}
              className="border p-2 rounded"
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{getMonthName(month)}</option>
              ))}
            </select>
            <select
              value={calculatorData.year}
              onChange={(e) => setCalculatorData({...calculatorData, year: parseInt(e.target.value)})}
              className="border p-2 rounded"
            >
              {Array.from({length: 3}, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={calculateBilling}
              disabled={!calculatorData.establishment_id}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              Calcular
            </button>
            <button 
              onClick={() => setShowCalculator(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>

          {calculationResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold mb-3">Resultado do Cálculo:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Vendas Totais</p>
                  <p className="font-bold">R$ {calculationResult.total_sales.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Comissão do App</p>
                  <p className="font-bold">R$ {calculationResult.app_commission.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Taxa Mensal</p>
                  <p className="font-bold">R$ {calculationResult.monthly_fee.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total a Pagar</p>
                  <p className="font-bold text-green-600">R$ {calculationResult.amount_due.toFixed(2)}</p>
                </div>
              </div>
              <button 
                onClick={createBilling}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Criar Cobrança
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estabelecimento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comissão</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {billing.map((bill) => (
              <tr key={bill.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {bill.establishment_name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getMonthName(bill.month)}/{bill.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  R$ {bill.total_sales.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  R$ {bill.app_commission.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  R$ {bill.monthly_fee.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                  R$ {bill.amount_due.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select 
                    value={bill.status}
                    onChange={(e) => updateStatus(bill.id, e.target.value)}
                    className={`border rounded px-2 py-1 text-sm ${getStatusColor(bill.status)}`}
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="overdue">Atrasado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {billing.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">Nenhuma cobrança encontrada.</p>
          <button 
            onClick={() => setShowCalculator(true)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Criar Primeira Cobrança
          </button>
        </div>
      )}
    </div>
  );
}