import Sidebar from "@/components/Sidebar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#f1f5f9] text-gray-900 flex font-sans">
        <Sidebar />
        <main className="ml-64 w-full min-h-screen p-8 bg-[#f8fafc]">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
