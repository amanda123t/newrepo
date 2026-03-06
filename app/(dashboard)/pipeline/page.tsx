"use client";

import { useEffect, useState } from "react";
import { Kanban, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_TYPE_COLORS,
  IMPACT_LABELS,
  IMPACT_COLORS,
  COMPLEXITY_LABELS,
  COMPLEXITY_COLORS,
  PIPELINE_STATUS_LABELS,
  PIPELINE_STATUS_COLORS,
  formatCurrency,
} from "@/lib/utils";

const PIPELINE_COLUMNS = [
  { id: "IDENTIFIED", label: "Identificada", color: "border-t-slate-400" },
  { id: "PRIORITIZED", label: "Priorizada", color: "border-t-blue-500" },
  { id: "UNDER_ANALYSIS", label: "Em Análise", color: "border-t-amber-500" },
  { id: "IN_DEVELOPMENT", label: "Em Desenvolvimento", color: "border-t-orange-500" },
  { id: "IN_DEPLOYMENT", label: "Em Implantação", color: "border-t-purple-500" },
  { id: "COMPLETED", label: "Concluída", color: "border-t-emerald-500" },
];

export default function PipelinePage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/opportunities");
      if (res.ok) setOpportunities(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleStatusChange = async (oppId: string, newStatus: string, opp: any) => {
    await fetch(`/api/opportunities/${oppId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...opp, status: newStatus }),
    });
    fetchOpportunities();
  };

  const filtered = opportunities.filter((o) => {
    const matchSearch =
      o.description.toLowerCase().includes(search.toLowerCase()) ||
      o.process?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.process?.client?.name?.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || o.type === typeFilter;
    return matchSearch && matchType;
  });

  const byColumn = PIPELINE_COLUMNS.reduce((acc, col) => {
    acc[col.id] = filtered.filter((o) => o.status === col.id);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pipeline de Implementação</h2>
          <p className="text-slate-500 text-sm">{opportunities.length} oportunidade(s) no pipeline</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar oportunidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-44">
          <option value="">Todos os tipos</option>
          {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {PIPELINE_COLUMNS.map((col) => {
              const items = byColumn[col.id] || [];
              const totalSavings = items.reduce((sum, o) => sum + (o.estimatedCostReduction || 0), 0);

              return (
                <div key={col.id} className="w-72 flex-shrink-0">
                  <div className={`bg-white rounded-xl border-2 border-slate-100 border-t-4 ${col.color} overflow-hidden`}>
                    <div className="px-3 py-3 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">{col.label}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">
                          {items.length}
                        </span>
                      </div>
                      {totalSavings > 0 && (
                        <div className="text-xs text-emerald-600 font-medium mt-0.5">
                          {formatCurrency(totalSavings)} potencial
                        </div>
                      )}
                    </div>
                    <div className="p-2 space-y-2 min-h-48">
                      {items.length === 0 && (
                        <div className="flex items-center justify-center h-20 text-xs text-slate-400">
                          Nenhuma oportunidade
                        </div>
                      )}
                      {items.map((opp) => (
                        <div
                          key={opp.id}
                          className="bg-slate-50 rounded-lg p-3 border border-slate-200 hover:border-indigo-200 transition-colors"
                        >
                          <div className="flex items-start gap-1.5 flex-wrap mb-2">
                            <Badge className={OPPORTUNITY_TYPE_COLORS[opp.type] + " text-xs"}>
                              {OPPORTUNITY_TYPE_LABELS[opp.type]}
                            </Badge>
                            <Badge className={IMPACT_COLORS[opp.expectedImpact] + " text-xs"}>
                              {IMPACT_LABELS[opp.expectedImpact]}
                            </Badge>
                          </div>
                          <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-2">
                            {opp.description}
                          </p>
                          <div className="mt-2 text-xs text-slate-500">
                            {opp.process?.name} · {opp.process?.client?.name}
                          </div>
                          {opp.progress > 0 && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Progresso</span>
                                <span>{opp.progress}%</span>
                              </div>
                              <Progress value={opp.progress} className="h-1" />
                            </div>
                          )}
                          {opp.estimatedCostReduction && (
                            <div className="mt-2 text-xs font-semibold text-emerald-600">
                              {formatCurrency(opp.estimatedCostReduction)}
                            </div>
                          )}
                          <div className="mt-2">
                            <Select
                              value={opp.status}
                              onChange={(e) => handleStatusChange(opp.id, e.target.value, opp)}
                              className="w-full h-7 text-xs"
                            >
                              {PIPELINE_COLUMNS.map((c) => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                              ))}
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
