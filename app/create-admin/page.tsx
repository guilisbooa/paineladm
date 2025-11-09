'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase/auth-client';

export default function CreateAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');

  const createAdminUser = async () => {
    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();

      // 1. Fazer login para pegar o ID do usuário
      setMessage('Fazendo login para obter ID do usuário...');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@email.com',
        password: '123456',
      });

      if (signInError) {
        setMessage('❌ Erro ao fazer login: ' + signInError.message);
        return;
      }

      if (!signInData.user) {
        setMessage('❌ Usuário não retornado do login');
        return;
      }

      const userAuthId = signInData.user.id;
      setUserId(userAuthId);
      setMessage(`✅ Login realizado! ID do usuário: ${userAuthId}`);

      // 2. Adicionar usuário à tabela users
      setMessage('Adicionando usuário à tabela users...');

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userAuthId,
          email: 'admin@email.com',
          name: 'Administrador',
          role: 'admin',
          status: 'active',
          phone: '(11) 99999-9999',
          created_at: new Date().toISOString()
        });

      if (insertError) {
        // Se já existe, tentar atualizar
        if (insertError.code === '23505') { // Violação de chave única
          setMessage('Usuário já existe na tabela. Atualizando...');
          
          const { error: updateError } = await supabase
            .from('users')
            .update({
              role: 'admin',
              status: 'active',
              name: 'Administrador'
            })
            .eq('id', userAuthId);

          if (updateError) {
            setMessage('❌ Erro ao atualizar usuário: ' + updateError.message);
            return;
          }
          
          setMessage('✅ Usuário atualizado na tabela users!');
        } else {
          setMessage('❌ Erro ao inserir usuário: ' + insertError.message);
          return;
        }
      } else {
        setMessage('✅ Usuário adicionado à tabela users!');
      }

      // 3. Verificar se foi criado com sucesso
      setMessage('Verificando criação do usuário...');
      
      const { data: userData, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@email.com')
        .single();

      if (selectError) {
        setMessage('❌ Erro ao verificar usuário: ' + selectError.message);
        return;
      }

      setMessage(`✅ Configuração completa! 
      
📧 Email: admin@email.com
🔑 Senha: 123456
👑 Role: ${userData.role}
✅ Status: ${userData.status}

➡️ Agora você pode fazer login no sistema.`);

    } catch (error: any) {
      setMessage('❌ Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">👑</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Criar Usuário Admin</h1>
          <p className="text-gray-600 mt-2">
            Adicionar usuário à tabela users
          </p>
        </div>

        <button
          onClick={createAdminUser}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Configurando...' : '➕ Criar Usuário na Tabela'}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded-md text-sm whitespace-pre-line ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : message.includes('❌')
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {message}
          </div>
        )}

        {userId && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm font-mono break-all">User ID: {userId}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 rounded-md">
          <h3 className="font-medium text-gray-900 mb-2">Pré-requisitos:</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>✅ Usuário deve existir no Auth (Authentication → Users)</p>
            <p>📧 Email: admin@email.com</p>
            <p>🔑 Senha: 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}