'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase/auth-client';

export default function SetupAdmin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const setupAdmin = async () => {
    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();

      // Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'admin@email.com',
        password: '123456',
      });

      if (authError) {
        setMessage('Erro no Auth: ' + authError.message);
        return;
      }

      // Criar usuário na tabela users
      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user?.id,
            email: 'admin@email.com',
            name: 'Administrador',
            role: 'admin',
            status: 'active'
          }
        ]);

      if (userError) {
        setMessage('Erro ao criar usuário: ' + userError.message);
        return;
      }

      setMessage('✅ Usuário admin criado com sucesso! Email: admin@email.com, Senha: 123456');
    } catch (error: any) {
      setMessage('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Configurar Admin</h1>
        <button
          onClick={setupAdmin}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Criando...' : 'Criar Usuário Admin'}
        </button>
        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}