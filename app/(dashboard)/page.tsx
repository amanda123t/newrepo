"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Building2,
  GitBranch,
  Lightbulb,
  DollarSign,
  Clock,
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  RefreshCcw,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber, OPPORTUNITY_TYPE_LABELS, IMPACT_LABELS, IMPACT_COLORS, COMPLEXITY_LABELS, COMPLEXITY_COLORS } from "@/lib/utils";

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#e0e7ff"];
const TYPE_COLORS: Record<string, string> = {
  STANDARDIZATION: "#3b82f6",
  OPTIMIZATION: "#f59e0b",
  AUTOMATION: "#8b5cf6",
  PROCESS_REDESIGN: "#f97316",
  DIGITALIZATION: "#06b6d4",
  AI_USE: "#ec4899",
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      await fetchData();
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data || data.kpis?.totalClients === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
          <Zap size={32} className="text-indigo-600" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">Bem-vindo ao ProcessFlow</h2>
          <p className="text-slate-500 text-sm mt-1 max-w-sm">
            Nenhum dado encontrado. Carregue os dados de demonstração para explorar a plataforma.
          </p>
        </div>
        <Button onClick={handleSeed} disabled={seeding}>
          {seeding ? "Carregando..." : "Carregar dados de demonstração"}
        </Button>
      </div>
    );
  }

  const { kpis, charts, rankings } = data;

  // Transform for charts
  const typeData = Object.entries(charts.byType).map(([key, val]) => ({
    name: OPPORTUNITY_TYPE_LABELS[key] || key,
    value: val as number,
    key,
  }));

  const impactData = Object.entries(charts.byImpact).map(([key, val]) => ({
    name: IMPACT_LABELS[key] || key,
    value: val as number,
  }));

  const pipelineOrder = ["IDENTIFIED", "PRIORITIZED", "UNDER_ANALYSIS", "IN_DEVELOPMENT", "IN_DEPLOYMENT", "COMPLETED"];
  const pipelineLabels: Record<string, string> = {
    IDENTIFIED: "Identificada",
    PRIORITIZED: "Priorizada",
    UNDER_ANALYSIS: "Em Análise",
    IN_DEVELOPMENT: "Em Desenvolvimento",
    IN_DEPLOYMENT: "Em Implantação",
    COMPLETED: "Concluída",
  };
  const pipelineData = pipelineOrder.map((key) => ({
    name: pipelineLabels[key],
    value: (charts.byStatus[key] || 0) as number,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Executivo</h2>
          <p className="text-slate-500 text-sm mt-0.5">Visão consolidada do portfólio de processos</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCcw size={14} />
          Atualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Clientes Ativos"
          value={kpis.activeClients}
          subtitle={`${kpis.totalClients} no total`}
          icon={Building2}
          iconColor="text-blue-600"
        />
        <KpiCard
          title="Processos Mapeados"
          value={kpis.totalProcesses}
          icon={GitBranch}
          iconColor="text-indigo-600"
        />
        <KpiCard
          title="Oportunidades"
          value={kpis.totalOpportunities}
          subtitle={`${kpis.completedOpportunities} concluídas`}
          icon={Lightbulb}
          iconColor="text-amber-600"
        />
        <KpiCard
          title="Economia Potencial"
          value={formatCurrency(kpis.totalSavings)}
          subtitle={`${formatNumber(kpis.totalHoursSaved)}h economizadas`}
          icon={DollarSign}
          iconColor="text-emerald-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Oportunidades por Tipo */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Oportunidades por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="value"
                  name="Oportunidades"
                  radius={[4, 4, 0, 0]}
                >
                  {typeData.map((entry, index) => (
                    <Cell
                      key={entry.key}
                      fill={TYPE_COLORS[entry.key] || PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Por Impacto */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Impacto</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={impactData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {impactData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline + Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline Status */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline de Implementação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pipelineData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-32 shrink-0">{item.name}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${kpis.totalOpportunities > 0 ? (item.value / kpis.totalOpportunities) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-6 text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ranking Automação */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Automação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankings.automationRanking.map((item: any, index: number) => (
                <div key={item.id} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                      <Badge className="ml-2 shrink-0">{item.opportunities} oport.</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.client}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-purple-500 h-1.5 rounded-full"
                          style={{ width: `${item.automationLevel}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{item.automationLevel}% auto.</span>
                    </div>
                  </div>
                </div>
              ))}
              {rankings.automationRanking.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">Nenhum dado disponível</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Processes */}
      {rankings.highRiskProcesses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <CardTitle>Processos com Maior Risco Operacional</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rankings.highRiskProcesses.map((p: any) => (
                <div
                  key={p.id}
                  className="border border-red-100 bg-red-50 rounded-lg p-3 space-y-2"
                >
                  <p className="text-sm font-medium text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.client}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.complexity && (
                      <Badge className={COMPLEXITY_COLORS[p.complexity]}>
                        {COMPLEXITY_LABELS[p.complexity]}
                      </Badge>
                    )}
                    <Badge className="bg-red-100 text-red-700">Risco Operacional</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{p.opportunitiesCount} oportunidade(s)</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
