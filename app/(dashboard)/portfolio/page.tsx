"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Layers, Search, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PROCESS_TYPE_LABELS,
  COMPLEXITY_LABELS,
  COMPLEXITY_COLORS,
  MATURITY_LABELS,
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_TYPE_COLORS,
  formatCurrency,
  formatMinutes,
} from "@/lib/utils";

type SortField = "name" | "automationLevel" | "standardizationLevel" | "monthlyVolume" | "opportunities" | "savings";
type SortDir = "asc" | "desc";
type OpportunityType = "AUTOMATION" | "AI_USE" | "OPTIMIZATION" | "STANDARDIZATION" | "PROCESS_REDESIGN" | "DIGITALIZATION";

const OPPORTUNITY_DOT_COLORS: Record<OpportunityType, string> = {
  AUTOMATION: "#8b5cf6",
  AI_USE: "#ec4899",
  OPTIMIZATION: "#f59e0b",
  STANDARDIZATION: "#3b82f6",
  PROCESS_REDESIGN: "#f97316",
  DIGITALIZATION: "#06b6d4",
};

export default function PortfolioPage() {
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("savings");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    const fetchProcesses = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/processes");
        if (res.ok) setProcesses(await res.json());
      } finally {
        setLoading(false);
      }
    };
    fetchProcesses();
  }, []);

  const clients = Array.from(
    new Map(processes.map((p) => [p.client?.id, p.client?.name])).entries()
  ).filter(([id]) => id);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filtered = processes
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.area.toLowerCase().includes(search.toLowerCase());
      const matchClient = !clientFilter || p.client?.id === clientFilter;
      return matchSearch && matchClient;
    })
    .sort((a, b) => {
      let aVal: number;
      let bVal: number;
      switch (sortField) {
        case "automationLevel":
          aVal = a.automationLevel || 0;
          bVal = b.automationLevel || 0;
          break;
        case "standardizationLevel":
          aVal = a.standardizationLevel || 0;
          bVal = b.standardizationLevel || 0;
          break;
        case "monthlyVolume":
          aVal = a.monthlyVolume || 0;
          bVal = b.monthlyVolume || 0;
          break;
        case "opportunities":
          aVal = a.opportunities?.length || 0;
          bVal = b.opportunities?.length || 0;
          break;
        case "savings":
          aVal = a.opportunities?.reduce((s: number, o: any) => s + (o.estimatedCostReduction || 0), 0) || 0;
          bVal = b.opportunities?.reduce((s: number, o: any) => s + (o.estimatedCostReduction || 0), 0) || 0;
          break;
        default:
          return sortDir === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={12} className="text-slate-300" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-indigo-600" />
      : <ChevronDown size={12} className="text-indigo-600" />;
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
    >
      {label}
      <SortIcon field={field} />
    </button>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Portfólio de Processos</h2>
        <p className="text-slate-500 text-sm">{processes.length} processo(s) mapeado(s)</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar processo ou área..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="w-48">
          <option value="">Todos os clientes</option>
          {clients.map(([id, name]) => (
            <option key={id} value={id as string}>{name}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3">
                    <SortHeader field="name" label="Processo" />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Área</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Tipo</th>
                  <th className="px-4 py-3">
                    <SortHeader field="monthlyVolume" label="Volume" />
                  </th>
                  <th className="px-4 py-3">
                    <SortHeader field="standardizationLevel" label="Padronização" />
                  </th>
                  <th className="px-4 py-3">
                    <SortHeader field="automationLevel" label="Automação" />
                  </th>
                  <th className="px-4 py-3 text-center">
                    <SortHeader field="opportunities" label="Oport." />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortHeader field="savings" label="Economia Est." />
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-16 text-slate-400">
                      <Layers size={36} className="mx-auto mb-3 text-slate-300" />
                      Nenhum processo encontrado
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const totalSavings = p.opportunities?.reduce(
                      (sum: number, o: any) => sum + (o.estimatedCostReduction || 0),
                      0
                    ) || 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{p.name}</div>
                          {p.analysis && (
                            <Badge className={COMPLEXITY_COLORS[p.analysis.complexity] + " text-xs mt-0.5"}>
                              {COMPLEXITY_LABELS[p.analysis.complexity]}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{p.area}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-indigo-600 font-medium">{p.client?.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">{PROCESS_TYPE_LABELS[p.type]}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700 text-center">
                          {p.monthlyVolume?.toLocaleString("pt-BR") || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Progress value={p.standardizationLevel || 0} className="w-16" />
                            <span className="text-xs text-slate-500 w-8">{p.standardizationLevel || 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Progress value={p.automationLevel || 0} className="w-16" indicatorClassName="bg-purple-500" />
                            <span className="text-xs text-slate-500 w-8">{p.automationLevel || 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-sm font-semibold text-slate-700">
                              {p.opportunities?.length || 0}
                            </span>
                            {p.opportunities?.length > 0 && (
                              <div className="flex gap-0.5 flex-wrap justify-center">
                                {(Array.from(new Set(p.opportunities.map((o: any) => o.type))) as OpportunityType[]).slice(0, 2).map((type) => (
                                  <div
                                    key={type}
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: OPPORTUNITY_DOT_COLORS[type] ?? "#94a3b8" }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-semibold ${totalSavings > 0 ? "text-emerald-600" : "text-slate-300"}`}>
                            {totalSavings > 0 ? formatCurrency(totalSavings) : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/processes/${p.id}`}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Ver →
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
