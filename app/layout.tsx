import './globals.css';
import AuthGuard from '../components/AuthGuard';

export const metadata = {
  title: 'Sistema Admin - Dashboard',
  description: 'Sistema completo de administração com Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50">
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}