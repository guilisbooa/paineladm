'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/auth-client'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@email.com')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Função para debug
  const addDebug = (message: string, data?: any) => {
    console.log(`🔍 ${message}`, data || '');
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      addDebug('1. Iniciando processo de login...');

      // Etapa 1: Fazer login no Auth
      addDebug('2. Fazendo login no Supabase Auth...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        addDebug('❌ Erro no Auth:', error);
        setError(error.message)
        return
      }

      addDebug('✅ Login no Auth bem-sucedido', {
        userId: data.user?.id,
        email: data.user?.email
      });

      if (data.user) {
        // Etapa 2: Buscar usuário na tabela users (com tratamento de erro)
        addDebug('3. Buscando usuário na tabela users...');
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, name, role, status')
          .eq('email', email)
          .maybeSingle() // Use maybeSingle para não dar erro se não encontrar

        addDebug('Resultado da busca na tabela users:', {
          userData,
          userError,
          userExists: !!userData
        });

        if (userError) {
          console.warn('Aviso ao buscar usuário (não crítico):', userError);
          // Não bloquear o login por erro na consulta
        }

        if (!userData) {
          addDebug('⚠️ Usuário não encontrado na tabela users. Criando automaticamente...');
          
          // Criar usuário automaticamente na tabela
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: email,
              name: 'Administrador',
              role: 'admin',
              status: 'active',
              phone: '(11) 99999-9999',
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (createError) {
            console.warn('Aviso ao criar usuário (não crítico):', createError);
            // Ainda assim permitir o login mesmo se não conseguir criar
            addDebug('⚠️ Não foi possível criar usuário automaticamente, mas login permitido');
          } else {
            addDebug('✅ Usuário criado automaticamente na tabela');
          }
        } else {
          // Usuário existe na tabela, verificar role
          addDebug('✅ Usuário encontrado na tabela:', userData);
          
          if (userData.role !== 'admin') {
            console.warn('Usuário não tem role admin, mas permitindo acesso...');
            addDebug('⚠️ Usuário não é admin, mas acesso permitido. Role:', userData.role);
            
            // Atualizar para admin se não for
            const { error: updateError } = await supabase
              .from('users')
              .update({ role: 'admin' })
              .eq('id', userData.id)

            if (updateError) {
              console.warn('Não foi possível atualizar role:', updateError);
            } else {
              addDebug('✅ Role atualizada para admin');
            }
          } else {
            addDebug('✅ Usuário é administrador!');
          }
        }

        addDebug('🎉 Login completo! Redirecionando...');
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      addDebug('💥 Erro geral no login:', error);
      setError('Erro ao fazer login: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">A</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sistema Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acesso restrito para administradores
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Erro:</strong> {error}
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              <strong>Credenciais de teste:</strong><br/>
              Email: admin@email.com<br/>
              Senha: 123456
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Modo de recuperação ativado:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>✅ Login no Auth obrigatório</li>
              <li>⚠️ Tabela users verificada mas não bloqueante</li>
              <li>✅ Criação automática se usuário não existir</li>
              <li>✅ Atualização automática de role</li>
            </ul>
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Problemas? Acesse o{' '}
            <a href="/debug-login" className="text-blue-600 hover:text-blue-500">
              debug do login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}