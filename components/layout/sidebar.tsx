"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  Lightbulb,
  Kanban,
  BarChart3,
  Target,
  Layers,
  Zap,
} from "lucide-react";

const navigation = [
  {
    label: "Visão Geral",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Portfólio", href: "/portfolio", icon: Layers },
    ],
  },
  {
    label: "Gestão",
    items: [
      { name: "Clientes", href: "/clients", icon: Building2 },
      { name: "Processos", href: "/processes", icon: GitBranch },
    ],
  },
  {
    label: "Análise",
    items: [
      { name: "Oportunidades", href: "/pipeline", icon: Kanban },
      { name: "Priorização", href: "/prioritization", icon: Target },
      { name: "Indicadores", href: "/indicators", icon: BarChart3 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-slate-900 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">ProcessFlow</div>
            <div className="text-slate-400 text-xs">Gestão de Processos</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navigation.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      )}
                    >
                      <Icon size={16} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
            AS
          </div>
          <div>
            <div className="text-white text-xs font-medium">Ana Souza</div>
            <div className="text-slate-500 text-xs">Consultora</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
