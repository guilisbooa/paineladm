"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Store, Truck, Settings, Tag, Image as ImageIcon, Package } from "lucide-react";

const menu = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Usuários", href: "/users", icon: Users },
  { label: "Estabelecimentos", href: "/establishments", icon: Store },
  { label: "Entregadores", href: "/drivers", icon: Truck },
  { label: "Pedidos", href: "/orders", icon: Package },
  { label: "Promoções", href: "/promotions", icon: Tag },
  { label: "Banners", href: "/banners", icon: ImageIcon },
  { label: "Configurações", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0f172a] text-gray-100 flex flex-col shadow-xl border-r border-blue-900">
      <div className="p-5 text-2xl font-semibold tracking-wide border-b border-blue-800 text-blue-400">
        Meu Painel
      </div>
      <nav className="mt-4 flex flex-col">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = path === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors duration-150 ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-blue-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto text-center text-xs text-gray-500 pb-4">
        © 2025 Meu Admin
      </div>
    </aside>
  );
}
