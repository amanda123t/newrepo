# ProcessFlow — Plataforma SaaS de Gestão de Processos

Plataforma web para gestão de processos organizacionais, utilizada por consultorias especializadas em mapeamento BPMN, melhoria operacional e automação.

## Stack

- **Frontend/Backend**: Next.js 15 (App Router) + TypeScript
- **Estilização**: Tailwind CSS v4
- **ORM**: Prisma + PostgreSQL
- **Gráficos**: Recharts
- **Ícones**: Lucide React

## Módulos

1. **Dashboard Executivo** — KPIs, gráficos de oportunidades por tipo/impacto, ranking de automação e processos de risco
2. **Gestão de Clientes** — Cadastro completo de empresas atendidas com status, segmento, porte e equipe
3. **Gestão de Processos** — Mapeamento BPMN, versões, características e documentação
4. **Análise do Processo** — Complexidade, maturidade, problemas identificados e notas analíticas
5. **Oportunidades** — Identificação com tipo, impacto, esforço e estimativas de ROI
6. **Pipeline de Implementação** — Kanban board com 6 estágios de evolução
7. **Indicadores** — Monitoramento de KPIs com gráficos de evolução temporal
8. **Priorização Inteligente** — Ranking automático + Matriz Impacto x Complexidade
9. **Portfólio de Processos** — Visão tabular com filtros e ordenação por múltiplas colunas

## Setup

### 1. Pré-requisitos
- Node.js 18+
- PostgreSQL 14+

### 2. Instalação

```bash
npm install

cp .env.example .env
# Edite o .env com sua string de conexão PostgreSQL

npx prisma migrate dev --name init
npx prisma generate
```

### 3. Executar

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### 4. Dados de demonstração

Na primeira execução, clique em **"Carregar dados de demonstração"** no Dashboard para popular o banco com:
- 3 clientes (Grupo Horizonte, TechRetail, LogiExpress)
- 5 processos mapeados com análises completas
- 7 oportunidades de melhoria com estimativas de ROI
- 4 indicadores com 6 meses de medições históricas

Ou via API: `curl -X POST http://localhost:3000/api/seed`

## Estrutura

```
app/
  (dashboard)/
    page.tsx              # Dashboard Executivo
    clients/              # Gestão de Clientes
    processes/            # Gestão de Processos + Análise + Oportunidades + Indicadores
    pipeline/             # Pipeline Kanban
    portfolio/            # Portfólio Tabular
    prioritization/       # Matriz de Priorização Inteligente
    indicators/           # Indicadores consolidados
  api/
    clients/              # REST: Clientes
    processes/            # REST: Processos + Análise
    opportunities/        # REST: Oportunidades
    indicators/           # REST: Indicadores
    dashboard/            # Agregações do Dashboard
    seed/                 # Dados de Demo

components/
  ui/                     # Componentes base (Button, Card, Modal, Input, etc.)
  layout/                 # Sidebar, Topbar
  dashboard/              # KPI Card

lib/
  db.ts                   # Instância singleton do Prisma
  utils.ts                # Formatação, labels e cores

prisma/
  schema.prisma           # Modelo de dados completo (multi-tenant)
```

## Modelo de Dados

```
Tenant → User[], Client[]
Client → Process[]
Process → ProcessAnalysis (1:1), Opportunity[], ProcessIndicator[], ProcessVersion[]
ProcessIndicator → IndicatorMeasurement[]
Opportunity → (Pipeline com status)
```
