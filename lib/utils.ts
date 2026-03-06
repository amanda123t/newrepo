import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

export const COMPANY_SIZE_LABELS: Record<string, string> = {
  MICRO: "Microempresa",
  SMALL: "Pequena",
  MEDIUM: "Média",
  LARGE: "Grande",
  ENTERPRISE: "Enterprise",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  PROSPECT: "Prospecção",
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  PROSPECT: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PAUSED: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-purple-100 text-purple-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export const PROCESS_TYPE_LABELS: Record<string, string> = {
  OPERATIONAL: "Operacional",
  SUPPORT: "Suporte",
  STRATEGIC: "Estratégico",
};

export const COMPLEXITY_LABELS: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
};

export const COMPLEXITY_COLORS: Record<string, string> = {
  LOW: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-700",
};

export const MATURITY_LABELS: Record<string, string> = {
  INITIAL: "Inicial",
  DEFINED: "Definido",
  STANDARDIZED: "Padronizado",
  OPTIMIZED: "Otimizado",
};

export const OPPORTUNITY_TYPE_LABELS: Record<string, string> = {
  STANDARDIZATION: "Padronização",
  OPTIMIZATION: "Otimização",
  AUTOMATION: "Automação",
  PROCESS_REDESIGN: "Redesenho de Processo",
  DIGITALIZATION: "Digitalização",
  AI_USE: "Uso de IA",
};

export const OPPORTUNITY_TYPE_COLORS: Record<string, string> = {
  STANDARDIZATION: "bg-blue-100 text-blue-700",
  OPTIMIZATION: "bg-amber-100 text-amber-700",
  AUTOMATION: "bg-purple-100 text-purple-700",
  PROCESS_REDESIGN: "bg-orange-100 text-orange-700",
  DIGITALIZATION: "bg-cyan-100 text-cyan-700",
  AI_USE: "bg-pink-100 text-pink-700",
};

export const IMPACT_LABELS: Record<string, string> = {
  LOW: "Baixo",
  MEDIUM: "Médio",
  HIGH: "Alto",
  TRANSFORMATIONAL: "Transformacional",
};

export const IMPACT_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-purple-100 text-purple-700",
  TRANSFORMATIONAL: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
};

export const PIPELINE_STATUS_LABELS: Record<string, string> = {
  IDENTIFIED: "Identificada",
  PRIORITIZED: "Priorizada",
  UNDER_ANALYSIS: "Em Análise",
  IN_DEVELOPMENT: "Em Desenvolvimento",
  IN_DEPLOYMENT: "Em Implantação",
  COMPLETED: "Concluída",
};

export const PIPELINE_STATUS_COLORS: Record<string, string> = {
  IDENTIFIED: "bg-slate-100 text-slate-700",
  PRIORITIZED: "bg-blue-100 text-blue-700",
  UNDER_ANALYSIS: "bg-amber-100 text-amber-700",
  IN_DEVELOPMENT: "bg-orange-100 text-orange-700",
  IN_DEPLOYMENT: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

export const PROBLEM_LABELS: Record<string, string> = {
  REWORK: "Retrabalho",
  MANUAL_ACTIVITIES: "Atividades Manuais",
  LACK_OF_STANDARDIZATION: "Falta de Padronização",
  PEOPLE_DEPENDENCY: "Dependência de Pessoas",
  OPERATIONAL_ERRORS: "Erros Operacionais",
  OPERATIONAL_RISK: "Risco Operacional",
};

export const INDICATOR_TYPE_LABELS: Record<string, string> = {
  EFFICIENCY: "Eficiência",
  QUALITY: "Qualidade",
  TIME: "Tempo",
  COST: "Custo",
  RISK: "Risco",
};
