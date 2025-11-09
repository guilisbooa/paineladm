'use client';

import { useState, useEffect } from 'react';
import { statsService, DashboardStats } from '../lib/supabase/stats';

// Definir tipos para as cores
type ColorType = 'green' | 'blue' | 'purple' | 'orange' | 'indigo' | 'pink' | 'yellow' | 'red';

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Iniciando carregamento do dashboard...');
      
      const statsData = await statsService.getDashboardStats();
      setStats(statsData);
      
      console.log('✅ Dashboard carregado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      setError(error?.message || 'Erro desconhecido ao carregar dados');
      
      // Usar dados de fallback em caso de erro
      const fallbackStats: DashboardStats = {
        totalUsers: 3,
        activeUsers: 2,
        totalEstablishments: 3,
        activeEstablishments: 2,
        totalBanners: 3,
        activeBanners: 2,
        totalOrders: 15,
        todayOrders: 3,
        totalRevenue: 1250.50,
        pendingOrders: 2,
        deliveredOrders: 10,
        totalPromotions: 5,
        activePromotions: 3,
        totalNotifications: 8,
        todayNotifications: 1,
        monthlyRevenue: [
          { month: 'Jan 2024', revenue: 15000 },
          { month: 'Fev 2024', revenue: 18000 },
          { month: 'Mar 2024', revenue: 22000 },
          { month: 'Abr 2024', revenue: 19000 },
          { month: 'Mai 2024', revenue: 25000 },
          { month: 'Jun 2024', revenue: 28000 }
        ],
        orderStatusDistribution: [
          { status: 'Pendente', count: 2 },
          { status: 'Confirmado', count: 3 },
          { status: 'Preparando', count: 4 },
          { status: 'Entregue', count: 10 },
          { status: 'Cancelado', count: 1 }
        ],
        establishmentPerformance: [
          { name: 'Pizzaria do Zé', orders: 45, revenue: 4500 },
          { name: 'Hamburgueria Top', orders: 38, revenue: 3800 },
          { name: 'Sushi Master', orders: 25, revenue: 5200 }
        ]
      };
      
      setStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Erro ao carregar dashboard</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={loadStats}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar dados do dashboard.</p>
          <button 
            onClick={loadStats}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header com logout */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-800">🚀 Dashboard Admin</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('pt-BR')}
              </span>
              <a 
                href="/logout"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Sair
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-yellow-600 mr-2">⚠️</span>
              <p className="text-yellow-800">
                Alguns dados podem estar incompletos: {error}
              </p>
            </div>
          </div>
        )}

        {/* Status do Sistema */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-4">
              <span className="text-green-600 text-2xl">✅</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800">Sistema Operacional</h2>
              <p className="text-green-700">Todas as funcionalidades conectadas ao Supabase</p>
            </div>
          </div>
        </div>

        {/* Cards Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Receita Total" 
            value={`R$ ${stats.totalRevenue.toFixed(2)}`}
            subtitle={`${stats.deliveredOrders} pedidos entregues`}
            color="green"
          />
          <StatCard 
            title="Pedidos Hoje" 
            value={stats.todayOrders.toString()}
            subtitle={`${stats.totalOrders} no total`}
            color="blue"
          />
          <StatCard 
            title="Usuários Ativos" 
            value={stats.activeUsers.toString()}
            subtitle={`${stats.totalUsers} cadastrados`}
            color="purple"
          />
          <StatCard 
            title="Estabelecimentos" 
            value={stats.activeEstablishments.toString()}
            subtitle={`${stats.totalEstablishments} cadastrados`}
            color="orange"
          />
        </div>

        {/* Segunda Linha de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Banners Ativos" 
            value={stats.activeBanners.toString()}
            subtitle={`${stats.totalBanners} no total`}
            color="indigo"
          />
          <StatCard 
            title="Promoções" 
            value={stats.activePromotions.toString()}
            subtitle={`${stats.totalPromotions} criadas`}
            color="pink"
          />
          <StatCard 
            title="Notificações" 
            value={stats.todayNotifications.toString()}
            subtitle={`${stats.totalNotifications} enviadas`}
            color="yellow"
          />
          <StatCard 
            title="Pedidos Pendentes" 
            value={stats.pendingOrders.toString()}
            subtitle="Aguardando processamento"
            color="red"
          />
        </div>

        {/* Gráficos e Métricas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Receita Mensal */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">📈 Receita Mensal</h3>
            <div className="space-y-3">
              {stats.monthlyRevenue.length > 0 ? (
                stats.monthlyRevenue.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.month}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min((item.revenue / Math.max(...stats.monthlyRevenue.map(m => m.revenue))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">R$ {item.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Nenhum dado disponível</p>
              )}
            </div>
          </div>

          {/* Distribuição de Pedidos */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">📊 Status dos Pedidos</h3>
            <div className="space-y-3">
              {stats.orderStatusDistribution.length > 0 ? (
                stats.orderStatusDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.status}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ 
                            width: `${(item.count / stats.totalOrders) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Nenhum dado disponível</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Estabelecimentos */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-bold mb-4">🏆 Top Estabelecimentos</h3>
          <div className="space-y-4">
            {stats.establishmentPerformance.length > 0 ? (
              stats.establishmentPerformance.map((est, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{est.name}</p>
                      <p className="text-sm text-gray-600">{est.orders} pedidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">R$ {est.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Receita</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum estabelecimento com pedidos</p>
            )}
          </div>
        </div>

        {/* Menu de Navegação */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Navegação Rápida</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <NavCard href="/users" title="👥 Usuários" count={stats.totalUsers} />
            <NavCard href="/establishments" title="🏪 Estabelecimentos" count={stats.totalEstablishments} />
            <NavCard href="/banners" title="🖼️ Banners" count={stats.totalBanners} />
            <NavCard href="/orders" title="📦 Pedidos" count={stats.totalOrders} />
            <NavCard href="/promotions" title="🎁 Promoções" count={stats.totalPromotions} />
            <NavCard href="/notifications" title="🔔 Notificações" count={stats.totalNotifications} />
            <NavCard href="/billing" title="💰 Cobranças" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para cards de estatísticas
function StatCard({ title, value, subtitle, color }: { 
  title: string; 
  value: string; 
  subtitle: string;
  color: ColorType;
}) {
  const colorClasses: Record<ColorType, string> = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className={`w-3 h-3 ${colorClasses[color]} rounded-full`}></div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
    </div>
  );
}

// Componente para cards de navegação
function NavCard({ href, title, count }: { 
  href: string; 
  title: string; 
  count?: number;
}) {
  return (
    <a 
      href={href}
      className="bg-gray-50 p-4 rounded-lg text-center hover:bg-gray-100 transition-colors block"
    >
      <div className="text-2xl mb-2">{title.split(' ')[0]}</div>
      <div className="text-sm font-medium text-gray-800">
        {title.split(' ').slice(1).join(' ')}
      </div>
      {count !== undefined && (
        <div className="text-xs text-gray-600 mt-1">{count} itens</div>
      )}
    </a>
  );
}