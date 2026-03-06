"use client";

import { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Target, TrendingUp, Zap, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_TYPE_COLORS,
  IMPACT_LABELS,
  IMPACT_COLORS,
  COMPLEXITY_LABELS,
  formatCurrency,
} from "@/lib/utils";

const IMPACT_SCORE: Record<string, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  TRANSFORMATIONAL: 4,
};

const COMPLEXITY_SCORE: Record<string, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

const QUADRANT_COLORS: Record<string, string> = {
  "Quick Win": "#10b981",
  "Alto Impacto": "#6366f1",
  "Baixa Prioridade": "#94a3b8",
  "Projeto Estratégico": "#f59e0b",
};

function getQuadrant(impact: number, complexity: number): string {
  if (impact >= 3 && complexity <= 2) return "Quick Win";
  if (impact >= 3 && complexity > 2) return "Alto Impacto";
  if (impact < 3 && complexity <= 2) return "Baixa Prioridade";
  return "Projeto Estratégico";
}

function getPriorityScore(opp: any): number {
  const impactScore = IMPACT_SCORE[opp.expectedImpact] || 1;
  const complexityScore = COMPLEXITY_SCORE[opp.implementationComplexity] || 1;
  const costScore = opp.estimatedCostReduction ? Math.log(opp.estimatedCostReduction + 1) / 5 : 0;
  const volumeScore = opp.process?.monthlyVolume ? Math.log(opp.process.monthlyVolume + 1) / 5 : 0;
  return (impactScore * 3 + (4 - complexityScore) * 2 + costScore + volumeScore).toFixed(2) as unknown as number;
}

export default function PrioritizationPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/opportunities");
        if (res.ok) setOpportunities(await res.json());
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  const enriched = opportunities
    .filter((o) => o.status !== "COMPLETED")
    .map((opp) => ({
      ...opp,
      impactScore: IMPACT_SCORE[opp.expectedImpact] || 1,
      complexityScore: COMPLEXITY_SCORE[opp.implementationComplexity] || 1,
      priorityScore: getPriorityScore(opp),
      quadrant: getQuadrant(
        IMPACT_SCORE[opp.expectedImpact] || 1,
        COMPLEXITY_SCORE[opp.implementationComplexity] || 1
      ),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const quadrantCounts = enriched.reduce((acc: Record<string, number>, o) => {
    acc[o.quadrant] = (acc[o.quadrant] || 0) + 1;
    return acc;
  }, {});

  const scatterData = enriched.map((o) => ({
    x: o.complexityScore,
    y: o.impactScore,
    name: o.description.slice(0, 50),
    type: o.type,
    quadrant: o.quadrant,
    savings: o.estimatedCostReduction,
    id: o.id,
  }));

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Priorização Inteligente</h2>
        <p className="text-slate-500 text-sm">
          Ranking automático baseado em impacto, esforço e potencial de redução de custos
        </p>
      </div>

      {/* Quadrant Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(QUADRANT_COLORS).map(([quadrant, color]) => (
          <div
            key={quadrant}
            className="bg-white rounded-xl border border-slate-200 p-4"
            style={{ borderLeftColor: color, borderLeftWidth: 3 }}
          >
            <div className="text-sm font-semibold text-slate-900">{quadrant}</div>
            <div className="text-2xl font-bold mt-1" style={{ color }}>
              {quadrantCounts[quadrant] || 0}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">oportunidades</div>
          </div>
        ))}
      </div>

      {/* Matrix + Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scatter Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Matriz Impacto × Complexidade</CardTitle>
            <CardDescription>Posicionamento das oportunidades ativas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Quadrant Labels */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="grid grid-cols-2 h-full" style={{ paddingLeft: 40, paddingBottom: 30, paddingRight: 16 }}>
                  <div className="flex items-start justify-start pt-2 pl-2">
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Quick Win ✓
                    </span>
                  </div>
                  <div className="flex items-start justify-end pt-2 pr-2">
                    <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                      Alto Impacto ★
                    </span>
                  </div>
                  <div className="flex items-end justify-start pb-2 pl-2">
                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                      Baixa Prioridade
                    </span>
                  </div>
                  <div className="flex items-end justify-end pb-2 pr-2">
                    <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                      Estratégico ◆
                    </span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[0.5, 3.5]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(v) => ["", "Baixa", "Média", "Alta"][v] || ""}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: "Complexidade →", position: "insideBottom", offset: -10, style: { fontSize: 10, fill: "#94a3b8" } }}
                  />
                  <YAxis
                    dataKey="y"
                    type="number"
                    domain={[0.5, 4.5]}
                    ticks={[1, 2, 3, 4]}
                    tickFormatter={(v) => ["", "Baixo", "Médio", "Alto", "Trans."][v] || ""}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: "↑ Impacto", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "#94a3b8" } }}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-lg text-xs max-w-48">
                          <p className="font-medium text-slate-900 line-clamp-2">{d.name}</p>
                          <p className="text-slate-500 mt-0.5">Quadrante: {d.quadrant}</p>
                          {d.savings && <p className="text-emerald-600 font-medium">{formatCurrency(d.savings)}</p>}
                        </div>
                      );
                    }}
                  />
                  <Scatter data={scatterData} fill="#6366f1">
                    {scatterData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={QUADRANT_COLORS[entry.quadrant] || "#6366f1"}
                        opacity={0.85}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ranking */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Prioridade</CardTitle>
            <CardDescription>Score = Impacto × 3 + (4 - Complexidade) × 2 + Savings + Volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {enriched.map((opp, index) => (
                <div
                  key={opp.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? "bg-yellow-500" : index === 1 ? "bg-slate-400" : index === 2 ? "bg-amber-700" : "bg-slate-200"
                      }`}
                    >
                      {index < 3 ? <Star size={10} /> : <span className="text-slate-600">{index + 1}</span>}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{Number(opp.priorityScore).toFixed(1)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap mb-1">
                      <Badge className={OPPORTUNITY_TYPE_COLORS[opp.type] + " text-xs"}>
                        {OPPORTUNITY_TYPE_LABELS[opp.type]}
                      </Badge>
                      <span
                        className="text-xs font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          background: QUADRANT_COLORS[opp.quadrant] + "20",
                          color: QUADRANT_COLORS[opp.quadrant],
                        }}
                      >
                        {opp.quadrant}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 line-clamp-1">{opp.description}</p>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {opp.process?.name} · {opp.process?.client?.name}
                    </div>
                  </div>
                  {opp.estimatedCostReduction && (
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-emerald-600">
                        {formatCurrency(opp.estimatedCostReduction)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {enriched.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Target size={32} className="mx-auto mb-2 text-slate-300" />
                  Nenhuma oportunidade ativa
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By Type Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Tipo de Oportunidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([type, label]) => {
              const items = enriched.filter((o) => o.type === type);
              const totalSavings = items.reduce((sum, o) => sum + (o.estimatedCostReduction || 0), 0);
              return (
                <div key={type} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                  <div className="text-xs font-medium text-slate-600 mb-2">{label}</div>
                  <div className="text-2xl font-bold text-slate-900">{items.length}</div>
                  {totalSavings > 0 && (
                    <div className="text-xs text-emerald-600 font-medium mt-1">
                      {formatCurrency(totalSavings)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
