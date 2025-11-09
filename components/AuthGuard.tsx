'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '../lib/supabase/auth-client';

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/login',
  '/debug-connection',
  '/test-supabase',
  '/create-admin',
  '/setup',
  '/create-alt-user',
  '/login-simple',
  '/debug-login',
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔄 AuthGuard: Verificando autenticação para rota:', pathname);

      if (publicRoutes.includes(pathname)) {
        console.log('✅ Rota pública, pulando verificação');
        setLoading(false);
        return;
      }

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('💥 Erro ao obter sessão:', sessionError);
        }

        if (!session) {
          console.log('❌ Nenhuma sessão encontrada, redirecionando para login');
          router.push('/login');
          return;
        }

        console.log('✅ Sessão encontrada, verificando usuário na tabela...');

        // Usar maybeSingle para não lançar se não encontrar
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .maybeSingle();

        if (userError) {
          // Detecção específica de RLS recursiva (mensagem padrão do Postgres)
          const msg = (userError as any).message || JSON.stringify(userError);
          console.error('💥 Erro ao buscar usuário:', msg);

          if (msg && msg.toString().toLowerCase().includes('infinite recursion')) {
            console.error(
              '⚠️ Detectada recursion/infinite recursion nas policies RLS da tabela "users".',
              'Verifique as policies no Supabase e remova qualquer consulta que consulte a própria tabela "users" dentro da policy.'
            );
            // opcional: redirecionar ou permitir acesso com aviso
          }
        }

        if (!userData) {
          console.warn('⚠️ Usuário não encontrado na tabela, criando automaticamente...');

          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || 'Administrador',
                role: 'admin',
                status: 'active',
                phone: '(11) 99999-9999',
                created_at: new Date().toISOString(),
              },
            ]);

          if (insertError) {
            console.error(
              '❌ Erro ao criar usuário automaticamente:',
              insertError.message || insertError.details || insertError
            );
            console.warn('⚠️ Permitindo acesso mesmo sem usuário na tabela');
          } else {
            console.log('✅ Usuário criado automaticamente com sucesso!');
          }
        } else {
          console.log('✅ Usuário encontrado na tabela:', userData);

          if (userData.role !== 'admin') {
            console.warn('⚠️ Usuário não é admin, atualizando...');
            const { error: updateError } = await supabase
              .from('users')
              .update({ role: 'admin' })
              .eq('id', userData.id);

            if (updateError) {
              console.error('💥 Erro ao atualizar usuário:', updateError.message || updateError);
            } else {
              console.log('✅ Usuário atualizado para admin com sucesso!');
            }
          }
        }

        console.log('🎉 Autenticação bem-sucedida!');
      } catch (error: any) {
        console.error('💥 Erro inesperado no AuthGuard:', error?.message ?? error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('🔄 Mudança no estado de autenticação:', event);
      if (event === 'SIGNED_OUT') {
        console.log('🚪 Usuário fez logout, redirecionando...');
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

