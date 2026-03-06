"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard Executivo",
  "/clients": "Gestão de Clientes",
  "/processes": "Gestão de Processos",
  "/pipeline": "Pipeline de Implementação",
  "/portfolio": "Portfólio de Processos",
  "/prioritization": "Priorização Inteligente",
  "/indicators": "Indicadores de Processo",
};

export function Topbar() {
  const pathname = usePathname();

  const title =
    Object.entries(PAGE_TITLES).find(([path]) =>
      path === "/" ? pathname === "/" : pathname.startsWith(path)
    )?.[1] || "ProcessFlow";

  return (
    <header className="fixed top-0 left-60 right-0 h-14 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-6">
      <h1 className="text-sm font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-2">
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <Search size={16} />
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}
