'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase/auth-client';

export default function DebugLogin() {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any[]>([]);

  const addDebug = (message: string, data?: any) => {
    console.log(`🔍 ${message}`, data);
    setDebugInfo(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      message,
      data: data || null
    }]);
  };

  const testLogin = async () => {
    setLoading(true);
    setDebugInfo([]);

    try {
      const supabase = createClient();

      addDebug('1. Iniciando teste de login...');

      // Etapa 1: Fazer login no Auth
      addDebug('2. Fazendo login no Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@email.com',
        password: '123456',
      });

      if (authError) {
        addDebug('❌ ERRO no Auth:', authError);
        return;
      }

      addDebug('✅ Login no Auth bem-sucedido', {
        userId: authData.user?.id,
        email: authData.user?.email
      });

      // Etapa 2: Buscar usuário na tabela users
      addDebug('3. Buscando usuário na tabela users...');
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@email.com');

      addDebug('Resultado da busca na tabela users:', {
        data: userData,
        error: userError,
        count: userData?.length
      });

      if (userError) {
        addDebug('❌ ERRO na consulta da tabela:', userError);
        return;
      }

      if (!userData || userData.length === 0) {
        addDebug('❌ Nenhum usuário encontrado na tabela');
        
        // Verificar todos os usuários na tabela
        addDebug('4. Listando TODOS os usuários na tabela...');
        const { data: allUsers } = await supabase
          .from('users')
          .select('*')
          .limit(10);

        addDebug('Todos os usuários na tabela:', allUsers);
        return;
      }

      addDebug('✅ Usuário encontrado na tabela:', userData[0]);

      // Etapa 3: Verificar role
      if (userData[0].role !== 'admin') {
        addDebug('⚠️ Usuário não é admin. Role:', userData[0].role);
      } else {
        addDebug('✅ Usuário é administrador!');
      }

      addDebug('🎉 Teste completo! O login deve funcionar.');

    } catch (error: any) {
      addDebug('💥 ERRO GERAL:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Debug do Login</h1>
      
      <button
        onClick={testLogin}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:bg-blue-300 mb-6"
      >
        {loading ? 'Testando...' : '🔍 Testar Login'}
      </button>

      <div className="space-y-4">
        {debugInfo.map((info, index) => (
          <div key={index} className={`p-4 rounded-lg border ${
            info.message.includes('❌') || info.message.includes('💥') 
              ? 'bg-red-100 border-red-300' 
              : info.message.includes('✅') 
              ? 'bg-green-100 border-green-300'
              : info.message.includes('⚠️')
              ? 'bg-yellow-100 border-yellow-300'
              : 'bg-white border-gray-300'
          }`}>
            <div className="flex items-start space-x-3">
              <span className="text-sm text-gray-500 mt-1">{info.time}</span>
              <div className="flex-1">
                <p className="font-medium">{info.message}</p>
                {info.data && (
                  <pre className="mt-2 text-sm bg-black bg-opacity-5 p-2 rounded overflow-auto">
                    {JSON.stringify(info.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {debugInfo.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold mb-2">Próximos passos baseados no debug:</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Se o usuário não for encontrado: usar a página /create-admin</li>
            <li>Se houver erro de permissão: verificar RLS policies</li>
            <li>Se o role não for admin: atualizar o usuário na tabela</li>
          </ul>
        </div>
      )}
    </div>
  );
}