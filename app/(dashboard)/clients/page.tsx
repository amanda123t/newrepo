"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  ChevronRight,
  Users,
  GitBranch,
  Lightbulb,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  COMPANY_SIZE_LABELS,
  formatDate,
} from "@/lib/utils";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    segment: "",
    size: "MEDIUM",
    projectStatus: "ACTIVE",
    startDate: "",
    endDate: "",
    description: "",
    teamMembers: "",
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/clients${params}`);
      if (res.ok) setClients(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [statusFilter]);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.segment.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          teamMembers: form.teamMembers.split(",").map((t) => t.trim()).filter(Boolean),
          tenantId: "default-tenant",
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ name: "", segment: "", size: "MEDIUM", projectStatus: "ACTIVE", startDate: "", endDate: "", description: "", teamMembers: "" });
        fetchClients();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clientes</h2>
          <p className="text-slate-500 text-sm">{clients.length} empresa(s) cadastrada(s)</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="">Todos os status</option>
          {Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Nenhum cliente encontrado</p>
          <p className="text-slate-400 text-sm mt-1">Cadastre um novo cliente para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => {
            const totalOps = client.processes?.reduce(
              (sum: number, p: any) => sum + (p.opportunities?.length || 0),
              0
            );
            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all group block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Building2 size={18} className="text-indigo-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={PROJECT_STATUS_COLORS[client.projectStatus]}>
                      {PROJECT_STATUS_LABELS[client.projectStatus]}
                    </Badge>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>

                <div className="mb-3">
                  <h3 className="font-semibold text-slate-900 leading-tight">{client.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{client.segment}</p>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <Badge variant="outline">{COMPANY_SIZE_LABELS[client.size]}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <GitBranch size={12} />
                    <span>{client.processes?.length || 0} processos</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Lightbulb size={12} />
                    <span>{totalOps || 0} oportunidades</span>
                  </div>
                  {client.startDate && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 col-span-2">
                      <Calendar size={12} />
                      <span>Desde {formatDate(client.startDate)}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Novo Cliente">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome da Empresa *</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Grupo Horizonte S.A."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Segmento *</Label>
              <Input
                required
                value={form.segment}
                onChange={(e) => setForm({ ...form, segment: e.target.value })}
                placeholder="Ex: Varejo, Indústria..."
              />
            </div>
            <div>
              <Label>Porte</Label>
              <Select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
                {Object.entries(COMPANY_SIZE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>Status do Projeto</Label>
            <Select value={form.projectStatus} onChange={(e) => setForm({ ...form, projectStatus: e.target.value })}>
              {Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data de Início</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <Label>Data de Término</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Equipe Responsável</Label>
            <Input
              value={form.teamMembers}
              onChange={(e) => setForm({ ...form, teamMembers: e.target.value })}
              placeholder="Nomes separados por vírgula"
            />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Contexto do projeto e objetivos..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Criar Cliente"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
