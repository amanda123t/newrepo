"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  ArrowLeft,
  GitBranch,
  Lightbulb,
  Plus,
  Calendar,
  Users,
  TrendingUp,
  ChevronRight,
  BarChart3,
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
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  COMPANY_SIZE_LABELS,
  PROCESS_TYPE_LABELS,
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_TYPE_COLORS,
  IMPACT_LABELS,
  IMPACT_COLORS,
  COMPLEXITY_LABELS,
  COMPLEXITY_COLORS,
  MATURITY_LABELS,
  PIPELINE_STATUS_LABELS,
  PIPELINE_STATUS_COLORS,
  formatDate,
  formatCurrency,
  formatMinutes,
} from "@/lib/utils";

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("processes");
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processForm, setProcessForm] = useState({
    name: "",
    area: "",
    macroprocess: "",
    type: "OPERATIONAL",
    description: "",
    objective: "",
    version: "1.0",
    mappingDate: "",
    monthlyVolume: "",
    avgExecutionTime: "",
    peopleInvolved: "",
    systemsUsed: "",
    standardizationLevel: "0",
    automationLevel: "0",
  });

  const fetchClient = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (res.ok) setClient(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  const handleCreateProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/processes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...processForm,
          clientId: id,
          systemsUsed: processForm.systemsUsed.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setShowProcessModal(false);
        setProcessForm({ name: "", area: "", macroprocess: "", type: "OPERATIONAL", description: "", objective: "", version: "1.0", mappingDate: "", monthlyVolume: "", avgExecutionTime: "", peopleInvolved: "", systemsUsed: "", standardizationLevel: "0", automationLevel: "0" });
        fetchClient();
      }
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

  if (!client) return <div>Cliente não encontrado</div>;

  const allOpportunities = client.processes?.flatMap((p: any) => p.opportunities || []) || [];
  const totalSavings = allOpportunities.reduce((sum: number, o: any) => sum + (o.estimatedCostReduction || 0), 0);

  const tabs = [
    { id: "processes", label: "Processos", count: client.processes?.length },
    { id: "opportunities", label: "Oportunidades", count: allOpportunities.length },
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
            <h2 className="text-2xl font-bold text-slate-900">{client.name}</h2>
            <Badge className={PROJECT_STATUS_COLORS[client.projectStatus]}>
              {PROJECT_STATUS_LABELS[client.projectStatus]}
            </Badge>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            {client.segment} · {COMPANY_SIZE_LABELS[client.size]}
          </p>
        </div>
        <Button onClick={() => setShowProcessModal(true)}>
          <Plus size={16} />
          Novo Processo
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">Processos</div>
          <div className="text-2xl font-bold text-slate-900">{client.processes?.length || 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">Oportunidades</div>
          <div className="text-2xl font-bold text-slate-900">{allOpportunities.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">Economia Potencial</div>
          <div className="text-xl font-bold text-emerald-600">{formatCurrency(totalSavings)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">Início do Projeto</div>
          <div className="text-sm font-semibold text-slate-900">
            {client.startDate ? formatDate(client.startDate) : "—"}
          </div>
        </div>
      </div>

      {/* Description */}
      {client.description && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-slate-600">{client.description}</p>
            {client.teamMembers?.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <Users size={14} className="text-slate-400" />
                <div className="flex items-center gap-1 flex-wrap">
                  {client.teamMembers.map((member: string) => (
                    <Badge key={member} variant="outline">{member}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
              {tab.count !== undefined && (
                <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "processes" && (
        <div className="space-y-3">
          {client.processes?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <GitBranch size={36} className="text-slate-300 mb-3" />
              <p className="text-slate-500">Nenhum processo cadastrado</p>
              <Button size="sm" className="mt-3" onClick={() => setShowProcessModal(true)}>
                <Plus size={14} /> Cadastrar Processo
              </Button>
            </div>
          ) : (
            client.processes.map((process: any) => (
              <Link
                key={process.id}
                href={`/processes/${process.id}`}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all group flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <GitBranch size={16} className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900">{process.name}</h3>
                      <Badge variant="outline">{PROCESS_TYPE_LABELS[process.type]}</Badge>
                      {process.analysis && (
                        <Badge className={COMPLEXITY_COLORS[process.analysis.complexity]}>
                          {COMPLEXITY_LABELS[process.analysis.complexity]}
                        </Badge>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{process.area}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Padronização</div>
                        <Progress value={process.standardizationLevel || 0} className="w-20" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Automação</div>
                        <Progress
                          value={process.automationLevel || 0}
                          className="w-20"
                          indicatorClassName="bg-purple-500"
                        />
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Lightbulb size={11} />
                        {process.opportunities?.length || 0} oport.
                      </span>
                      {process.analysis && (
                        <Badge className="bg-slate-100 text-slate-600 text-xs">
                          {MATURITY_LABELS[process.analysis.maturity]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === "opportunities" && (
        <div className="space-y-3">
          {allOpportunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Lightbulb size={36} className="text-slate-300 mb-3" />
              <p className="text-slate-500">Nenhuma oportunidade identificada</p>
            </div>
          ) : (
            allOpportunities.map((opp: any) => (
              <div
                key={opp.id}
                className="bg-white rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge className={OPPORTUNITY_TYPE_COLORS[opp.type]}>
                        {OPPORTUNITY_TYPE_LABELS[opp.type]}
                      </Badge>
                      <Badge className={IMPACT_COLORS[opp.expectedImpact]}>
                        {IMPACT_LABELS[opp.expectedImpact]}
                      </Badge>
                      <Badge className={PIPELINE_STATUS_COLORS[opp.status]}>
                        {PIPELINE_STATUS_LABELS[opp.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-900 font-medium">{opp.description}</p>
                  </div>
                  {opp.estimatedCostReduction && (
                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-400">Economia est.</div>
                      <div className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(opp.estimatedCostReduction)}
                      </div>
                    </div>
                  )}
                </div>
                {opp.progress > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progresso</span>
                      <span>{opp.progress}%</span>
                    </div>
                    <Progress value={opp.progress} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* New Process Modal */}
      <Modal
        open={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        title="Novo Processo"
        className="max-w-2xl"
      >
        <form onSubmit={handleCreateProcess} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Nome do Processo *</Label>
              <Input
                required
                value={processForm.name}
                onChange={(e) => setProcessForm({ ...processForm, name: e.target.value })}
                placeholder="Ex: Planejamento de Produção"
              />
            </div>
            <div>
              <Label>Área Responsável *</Label>
              <Input
                required
                value={processForm.area}
                onChange={(e) => setProcessForm({ ...processForm, area: e.target.value })}
                placeholder="Ex: Operações"
              />
            </div>
            <div>
              <Label>Macroprocesso</Label>
              <Input
                value={processForm.macroprocess}
                onChange={(e) => setProcessForm({ ...processForm, macroprocess: e.target.value })}
                placeholder="Ex: Produção"
              />
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select value={processForm.type} onChange={(e) => setProcessForm({ ...processForm, type: e.target.value })}>
                {Object.entries(PROCESS_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Versão</Label>
              <Input
                value={processForm.version}
                onChange={(e) => setProcessForm({ ...processForm, version: e.target.value })}
                placeholder="1.0"
              />
            </div>
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea
              value={processForm.description}
              onChange={(e) => setProcessForm({ ...processForm, description: e.target.value })}
              placeholder="Descreva o processo..."
              rows={2}
            />
          </div>
          <div>
            <Label>Objetivo</Label>
            <Textarea
              value={processForm.objective}
              onChange={(e) => setProcessForm({ ...processForm, objective: e.target.value })}
              placeholder="Objetivo do processo..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Volume Mensal</Label>
              <Input
                type="number"
                value={processForm.monthlyVolume}
                onChange={(e) => setProcessForm({ ...processForm, monthlyVolume: e.target.value })}
                placeholder="Ex: 500"
              />
            </div>
            <div>
              <Label>Tempo Médio (min)</Label>
              <Input
                type="number"
                value={processForm.avgExecutionTime}
                onChange={(e) => setProcessForm({ ...processForm, avgExecutionTime: e.target.value })}
                placeholder="Ex: 30"
              />
            </div>
            <div>
              <Label>Pessoas Envolvidas</Label>
              <Input
                type="number"
                value={processForm.peopleInvolved}
                onChange={(e) => setProcessForm({ ...processForm, peopleInvolved: e.target.value })}
                placeholder="Ex: 5"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Padronização (0-100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={processForm.standardizationLevel}
                onChange={(e) => setProcessForm({ ...processForm, standardizationLevel: e.target.value })}
              />
            </div>
            <div>
              <Label>Automação (0-100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={processForm.automationLevel}
                onChange={(e) => setProcessForm({ ...processForm, automationLevel: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Sistemas Utilizados</Label>
            <Input
              value={processForm.systemsUsed}
              onChange={(e) => setProcessForm({ ...processForm, systemsUsed: e.target.value })}
              placeholder="Separados por vírgula: SAP, Excel..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowProcessModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Criar Processo"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
