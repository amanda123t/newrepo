"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  GitBranch,
  Plus,
  Save,
  FileText,
  Lightbulb,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  PROCESS_TYPE_LABELS,
  COMPLEXITY_LABELS,
  COMPLEXITY_COLORS,
  MATURITY_LABELS,
  PROBLEM_LABELS,
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_TYPE_COLORS,
  IMPACT_LABELS,
  IMPACT_COLORS,
  PIPELINE_STATUS_LABELS,
  PIPELINE_STATUS_COLORS,
  INDICATOR_TYPE_LABELS,
  formatDate,
  formatCurrency,
  formatMinutes,
} from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PROBLEMS = [
  { value: "REWORK", label: "Retrabalho" },
  { value: "MANUAL_ACTIVITIES", label: "Atividades Manuais" },
  { value: "LACK_OF_STANDARDIZATION", label: "Falta de Padronização" },
  { value: "PEOPLE_DEPENDENCY", label: "Dependência de Pessoas" },
  { value: "OPERATIONAL_ERRORS", label: "Erros Operacionais" },
  { value: "OPERATIONAL_RISK", label: "Risco Operacional" },
];

export default function ProcessDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [process, setProcess] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);

  // Analysis form
  const [analysisForm, setAnalysisForm] = useState({
    complexity: "MEDIUM",
    maturity: "INITIAL",
    problems: [] as string[],
    analyticalNotes: "",
  });

  // Opportunity modal
  const [showOppModal, setShowOppModal] = useState(false);
  const [oppForm, setOppForm] = useState({
    description: "",
    type: "OPTIMIZATION",
    expectedImpact: "MEDIUM",
    implementationComplexity: "MEDIUM",
    effortEstimate: "",
    estimatedHoursReduction: "",
    estimatedCostReduction: "",
    operationalRiskReduction: "",
  });

  // Indicator modal
  const [showIndModal, setShowIndModal] = useState(false);
  const [indForm, setIndForm] = useState({
    name: "",
    type: "EFFICIENCY",
    unit: "",
    target: "",
    current: "",
  });

  const fetchProcess = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/processes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProcess(data);
        if (data.analysis) {
          setAnalysisForm({
            complexity: data.analysis.complexity,
            maturity: data.analysis.maturity,
            problems: data.analysis.problems,
            analyticalNotes: data.analysis.analyticalNotes || "",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcess();
  }, [id]);

  const handleSaveAnalysis = async () => {
    setSaving(true);
    try {
      await fetch(`/api/processes/${id}/analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisForm),
      });
      fetchProcess();
    } finally {
      setSaving(false);
    }
  };

  const toggleProblem = (val: string) => {
    setAnalysisForm((prev) => ({
      ...prev,
      problems: prev.problems.includes(val)
        ? prev.problems.filter((p) => p !== val)
        : [...prev.problems, val],
    }));
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...oppForm, processId: id }),
      });
      setShowOppModal(false);
      setOppForm({ description: "", type: "OPTIMIZATION", expectedImpact: "MEDIUM", implementationComplexity: "MEDIUM", effortEstimate: "", estimatedHoursReduction: "", estimatedCostReduction: "", operationalRiskReduction: "" });
      fetchProcess();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOppStatus = async (oppId: string, status: string) => {
    await fetch(`/api/opportunities/${oppId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...process.opportunities.find((o: any) => o.id === oppId) }),
    });
    fetchProcess();
  };

  const handleCreateIndicator = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/indicators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...indForm, processId: id }),
      });
      setShowIndModal(false);
      setIndForm({ name: "", type: "EFFICIENCY", unit: "", target: "", current: "" });
      fetchProcess();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!process) return <div>Processo não encontrado</div>;

  const totalEstimatedSavings = process.opportunities?.reduce(
    (sum: number, o: any) => sum + (o.estimatedCostReduction || 0),
    0
  );

  const tabs = [
    { id: "overview", label: "Visão Geral" },
    { id: "analysis", label: "Análise" },
    { id: "opportunities", label: "Oportunidades", count: process.opportunities?.length },
    { id: "indicators", label: "Indicadores", count: process.indicators?.length },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900">{process.name}</h2>
            <Badge variant="outline">{PROCESS_TYPE_LABELS[process.type]}</Badge>
            {process.analysis && (
              <Badge className={COMPLEXITY_COLORS[process.analysis.complexity]}>
                {COMPLEXITY_LABELS[process.analysis.complexity]}
              </Badge>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            {process.area}
            {process.macroprocess ? ` · ${process.macroprocess}` : ""}
            {" · "}
            <span className="text-indigo-600">{process.client?.name}</span>
          </p>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <TrendingUp size={14} className="text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Volume Mensal</div>
            <div className="text-sm font-bold text-slate-900">
              {process.monthlyVolume?.toLocaleString("pt-BR") || "—"}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
            <Clock size={14} className="text-amber-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Tempo Médio</div>
            <div className="text-sm font-bold text-slate-900">
              {process.avgExecutionTime ? formatMinutes(process.avgExecutionTime) : "—"}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
            <Users size={14} className="text-purple-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Pessoas</div>
            <div className="text-sm font-bold text-slate-900">{process.peopleInvolved || "—"}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
            <Lightbulb size={14} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Economia Estimada</div>
            <div className="text-sm font-bold text-emerald-600">
              {totalEstimatedSavings > 0 ? formatCurrency(totalEstimatedSavings) : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Processo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {process.description && (
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1">Descrição</div>
                  <p className="text-sm text-slate-700">{process.description}</p>
                </div>
              )}
              {process.objective && (
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1">Objetivo</div>
                  <p className="text-sm text-slate-700">{process.objective}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="text-xs text-slate-500">Versão</div>
                  <div className="text-sm font-medium">{process.version}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Mapeado em</div>
                  <div className="text-sm font-medium">
                    {process.mappingDate ? formatDate(process.mappingDate) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Consultor</div>
                  <div className="text-sm font-medium">{process.consultant?.name || "—"}</div>
                </div>
              </div>
              {process.systemsUsed?.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-2">Sistemas Utilizados</div>
                  <div className="flex flex-wrap gap-1">
                    {process.systemsUsed.map((s: string) => (
                      <Badge key={s} variant="outline" className="flex items-center gap-1">
                        <Cpu size={10} />
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Níveis de Maturidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600">Padronização</span>
                  <span className="font-semibold text-slate-900">{process.standardizationLevel || 0}%</span>
                </div>
                <Progress value={process.standardizationLevel || 0} className="h-2.5" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600">Automação</span>
                  <span className="font-semibold text-slate-900">{process.automationLevel || 0}%</span>
                </div>
                <Progress value={process.automationLevel || 0} className="h-2.5" indicatorClassName="bg-purple-500" />
              </div>
              {process.analysis && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Complexidade</span>
                    <Badge className={COMPLEXITY_COLORS[process.analysis.complexity]}>
                      {COMPLEXITY_LABELS[process.analysis.complexity]}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Maturidade</span>
                    <Badge className="bg-indigo-100 text-indigo-700">
                      {MATURITY_LABELS[process.analysis.maturity]}
                    </Badge>
                  </div>
                  {process.analysis.problems?.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1.5">Problemas Identificados</div>
                      <div className="flex flex-wrap gap-1">
                        {process.analysis.problems.map((p: string) => (
                          <Badge key={p} className="bg-red-50 text-red-700 text-xs">
                            {PROBLEM_LABELS[p]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === "analysis" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Classificação do Processo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Complexidade</Label>
                  <Select
                    value={analysisForm.complexity}
                    onChange={(e) => setAnalysisForm({ ...analysisForm, complexity: e.target.value })}
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                  </Select>
                </div>
                <div>
                  <Label>Maturidade do Processo</Label>
                  <Select
                    value={analysisForm.maturity}
                    onChange={(e) => setAnalysisForm({ ...analysisForm, maturity: e.target.value })}
                  >
                    <option value="INITIAL">Inicial</option>
                    <option value="DEFINED">Definido</option>
                    <option value="STANDARDIZED">Padronizado</option>
                    <option value="OPTIMIZED">Otimizado</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Problemas Identificados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {PROBLEMS.map((p) => (
                    <label
                      key={p.value}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        analysisForm.problems.includes(p.value)
                          ? "border-red-200 bg-red-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={analysisForm.problems.includes(p.value)}
                        onChange={() => toggleProblem(p.value)}
                        className="rounded text-red-500"
                      />
                      <span className="text-sm text-slate-700">{p.label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notas Analíticas</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={analysisForm.analyticalNotes}
                  onChange={(e) => setAnalysisForm({ ...analysisForm, analyticalNotes: e.target.value })}
                  placeholder="Registre a análise consultiva detalhada do processo, principais achados, pontos de atenção e recomendações..."
                  rows={12}
                />
              </CardContent>
            </Card>

            <Button onClick={handleSaveAnalysis} disabled={saving} className="w-full">
              <Save size={15} />
              {saving ? "Salvando..." : "Salvar Análise"}
            </Button>
          </div>
        </div>
      )}

      {/* Opportunities Tab */}
      {activeTab === "opportunities" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowOppModal(true)}>
              <Plus size={15} />
              Nova Oportunidade
            </Button>
          </div>

          {process.opportunities?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Lightbulb size={36} className="text-slate-300 mb-3" />
              <p className="text-slate-500">Nenhuma oportunidade identificada</p>
              <Button size="sm" className="mt-3" onClick={() => setShowOppModal(true)}>
                <Plus size={14} /> Identificar Oportunidade
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {process.opportunities.map((opp: any) => (
                <div key={opp.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge className={OPPORTUNITY_TYPE_COLORS[opp.type]}>
                          {OPPORTUNITY_TYPE_LABELS[opp.type]}
                        </Badge>
                        <Badge className={IMPACT_COLORS[opp.expectedImpact]}>
                          Impacto: {IMPACT_LABELS[opp.expectedImpact]}
                        </Badge>
                        <Badge className={COMPLEXITY_COLORS[opp.implementationComplexity]}>
                          Complexidade: {COMPLEXITY_LABELS[opp.implementationComplexity]}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{opp.description}</p>
                      {opp.observations && (
                        <p className="text-xs text-slate-500 mt-1">{opp.observations}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {opp.estimatedCostReduction && (
                        <div className="text-xs text-slate-400 mb-1">Economia est.</div>
                      )}
                      {opp.estimatedCostReduction && (
                        <div className="text-sm font-bold text-emerald-600">
                          {formatCurrency(opp.estimatedCostReduction)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <Badge className={PIPELINE_STATUS_COLORS[opp.status]}>
                        {PIPELINE_STATUS_LABELS[opp.status]}
                      </Badge>
                      {opp.effortEstimate && (
                        <span className="text-xs text-slate-500">Esforço: {opp.effortEstimate}</span>
                      )}
                      {opp.estimatedHoursReduction && (
                        <span className="text-xs text-slate-500">{opp.estimatedHoursReduction}h redução</span>
                      )}
                    </div>
                    <Select
                      value={opp.status}
                      onChange={(e) => handleUpdateOppStatus(opp.id, e.target.value)}
                      className="w-44 h-7 text-xs"
                    >
                      <option value="IDENTIFIED">Identificada</option>
                      <option value="PRIORITIZED">Priorizada</option>
                      <option value="UNDER_ANALYSIS">Em Análise</option>
                      <option value="IN_DEVELOPMENT">Em Desenvolvimento</option>
                      <option value="IN_DEPLOYMENT">Em Implantação</option>
                      <option value="COMPLETED">Concluída</option>
                    </Select>
                  </div>

                  {opp.progress > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progresso</span>
                        <span>{opp.progress}%</span>
                      </div>
                      <Progress value={opp.progress} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Indicators Tab */}
      {activeTab === "indicators" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowIndModal(true)}>
              <Plus size={15} />
              Novo Indicador
            </Button>
          </div>

          {process.indicators?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 size={36} className="text-slate-300 mb-3" />
              <p className="text-slate-500">Nenhum indicador cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {process.indicators.map((ind: any) => {
                const measurements = ind.measurements || [];
                const chartData = measurements.map((m: any) => ({
                  date: format(new Date(m.measuredAt), "MMM/yy", { locale: ptBR }),
                  value: parseFloat(m.value.toFixed(2)),
                }));
                const progress = ind.target && ind.current
                  ? Math.min(100, (ind.current / ind.target) * 100)
                  : 0;

                return (
                  <Card key={ind.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{ind.name}</CardTitle>
                        <Badge className="bg-slate-100 text-slate-700 text-xs">
                          {INDICATOR_TYPE_LABELS[ind.type]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-end gap-4">
                        <div>
                          <div className="text-3xl font-bold text-slate-900">
                            {ind.current !== null ? ind.current.toFixed(1) : "—"}
                          </div>
                          <div className="text-xs text-slate-500">{ind.unit}</div>
                        </div>
                        {ind.target && (
                          <div className="text-right ml-auto">
                            <div className="text-sm font-medium text-slate-500">Meta: {ind.target} {ind.unit}</div>
                          </div>
                        )}
                      </div>

                      {ind.target && (
                        <div>
                          <Progress
                            value={progress}
                            indicatorClassName={progress >= 100 ? "bg-emerald-500" : progress >= 70 ? "bg-amber-500" : "bg-red-500"}
                          />
                        </div>
                      )}

                      {chartData.length > 1 && (
                        <ResponsiveContainer width="100%" height={100}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "6px" }} />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#6366f1"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Opportunity Modal */}
      <Modal open={showOppModal} onClose={() => setShowOppModal(false)} title="Nova Oportunidade" className="max-w-2xl">
        <form onSubmit={handleCreateOpportunity} className="space-y-4">
          <div>
            <Label>Descrição da Oportunidade *</Label>
            <Textarea
              required
              value={oppForm.description}
              onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
              placeholder="Descreva a oportunidade identificada..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Tipo *</Label>
              <Select value={oppForm.type} onChange={(e) => setOppForm({ ...oppForm, type: e.target.value })}>
                {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Impacto Esperado *</Label>
              <Select value={oppForm.expectedImpact} onChange={(e) => setOppForm({ ...oppForm, expectedImpact: e.target.value })}>
                <option value="LOW">Baixo</option>
                <option value="MEDIUM">Médio</option>
                <option value="HIGH">Alto</option>
                <option value="TRANSFORMATIONAL">Transformacional</option>
              </Select>
            </div>
            <div>
              <Label>Complexidade *</Label>
              <Select value={oppForm.implementationComplexity} onChange={(e) => setOppForm({ ...oppForm, implementationComplexity: e.target.value })}>
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Esforço Estimado</Label>
              <Input value={oppForm.effortEstimate} onChange={(e) => setOppForm({ ...oppForm, effortEstimate: e.target.value })} placeholder="Ex: 3 semanas" />
            </div>
            <div>
              <Label>Redução de Horas</Label>
              <Input type="number" value={oppForm.estimatedHoursReduction} onChange={(e) => setOppForm({ ...oppForm, estimatedHoursReduction: e.target.value })} placeholder="Ex: 100" />
            </div>
            <div>
              <Label>Redução de Custo (R$)</Label>
              <Input type="number" value={oppForm.estimatedCostReduction} onChange={(e) => setOppForm({ ...oppForm, estimatedCostReduction: e.target.value })} placeholder="Ex: 50000" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowOppModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Criar Oportunidade"}</Button>
          </div>
        </form>
      </Modal>

      {/* Indicator Modal */}
      <Modal open={showIndModal} onClose={() => setShowIndModal(false)} title="Novo Indicador">
        <form onSubmit={handleCreateIndicator} className="space-y-4">
          <div>
            <Label>Nome do Indicador *</Label>
            <Input required value={indForm.name} onChange={(e) => setIndForm({ ...indForm, name: e.target.value })} placeholder="Ex: Tempo médio de execução" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo *</Label>
              <Select value={indForm.type} onChange={(e) => setIndForm({ ...indForm, type: e.target.value })}>
                {Object.entries(INDICATOR_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Unidade</Label>
              <Input value={indForm.unit} onChange={(e) => setIndForm({ ...indForm, unit: e.target.value })} placeholder="Ex: horas, %, R$" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Meta</Label>
              <Input type="number" value={indForm.target} onChange={(e) => setIndForm({ ...indForm, target: e.target.value })} placeholder="Valor alvo" />
            </div>
            <div>
              <Label>Valor Atual</Label>
              <Input type="number" value={indForm.current} onChange={(e) => setIndForm({ ...indForm, current: e.target.value })} placeholder="Valor atual" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowIndModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Criar Indicador"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
