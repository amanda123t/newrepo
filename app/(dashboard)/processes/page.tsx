"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitBranch, Search, ChevronRight, Lightbulb, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PROCESS_TYPE_LABELS,
  COMPLEXITY_LABELS,
  COMPLEXITY_COLORS,
  MATURITY_LABELS,
  PROBLEM_LABELS,
  formatMinutes,
} from "@/lib/utils";

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

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

  const filtered = processes.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.area.toLowerCase().includes(search.toLowerCase()) ||
      p.client?.name.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || p.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Processos</h2>
        <p className="text-slate-500 text-sm">{processes.length} processo(s) mapeado(s)</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar processo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-40"
        >
          <option value="">Todos os tipos</option>
          {Object.entries(PROCESS_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <GitBranch size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500">Nenhum processo encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((process) => (
            <Link
              key={process.id}
              href={`/processes/${process.id}`}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all group flex items-start gap-4"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                <GitBranch size={16} className="text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{process.name}</h3>
                      <Badge variant="outline" className="text-xs">{PROCESS_TYPE_LABELS[process.type]}</Badge>
                      {process.analysis && (
                        <Badge className={COMPLEXITY_COLORS[process.analysis.complexity] + " text-xs"}>
                          {COMPLEXITY_LABELS[process.analysis.complexity]}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>{process.area}</span>
                      {process.macroprocess && <><span>·</span><span>{process.macroprocess}</span></>}
                      <span>·</span>
                      <span className="text-indigo-600 font-medium">{process.client?.name}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 shrink-0 mt-1" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Padronização</span>
                    <div className="flex items-center gap-1.5">
                      <Progress value={process.standardizationLevel || 0} className="flex-1" />
                      <span className="text-xs text-slate-600 w-8">{process.standardizationLevel || 0}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400">Automação</span>
                    <div className="flex items-center gap-1.5">
                      <Progress value={process.automationLevel || 0} className="flex-1" indicatorClassName="bg-purple-500" />
                      <span className="text-xs text-slate-600 w-8">{process.automationLevel || 0}%</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400">Volume mensal: </span>
                    <span className="text-slate-700 font-medium">{process.monthlyVolume ? process.monthlyVolume.toLocaleString("pt-BR") : "—"}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-400">Tempo médio: </span>
                    <span className="text-slate-700 font-medium">{process.avgExecutionTime ? formatMinutes(process.avgExecutionTime) : "—"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Lightbulb size={11} />
                    {process.opportunities?.length || 0} oportunidade(s)
                  </span>
                  {process.analysis && (
                    <Badge className="bg-slate-100 text-slate-600 text-xs">
                      {MATURITY_LABELS[process.analysis.maturity]}
                    </Badge>
                  )}
                  {process.analysis?.problems?.includes("OPERATIONAL_RISK") && (
                    <Badge className="bg-red-100 text-red-700 text-xs flex items-center gap-1">
                      <AlertCircle size={10} />
                      Risco Operacional
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
