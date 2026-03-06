import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    // Clean up existing data
    await prisma.indicatorMeasurement.deleteMany();
    await prisma.processIndicator.deleteMany();
    await prisma.opportunity.deleteMany();
    await prisma.processAnalysis.deleteMany();
    await prisma.processVersion.deleteMany();
    await prisma.process.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: "ProcessFlow Consultoria",
        slug: "processflow",
      },
    });

    // Create users
    const consultant1 = await prisma.user.create({
      data: {
        name: "Ana Souza",
        email: "ana@processflow.com",
        role: "CONSULTANT",
        tenantId: tenant.id,
      },
    });

    const consultant2 = await prisma.user.create({
      data: {
        name: "Carlos Mendes",
        email: "carlos@processflow.com",
        role: "CONSULTANT",
        tenantId: tenant.id,
      },
    });

    // Create clients
    const client1 = await prisma.client.create({
      data: {
        tenantId: tenant.id,
        name: "Grupo Horizonte S.A.",
        segment: "Indústria Alimentícia",
        size: "LARGE",
        responsibleId: consultant1.id,
        projectStatus: "ACTIVE",
        startDate: new Date("2024-01-15"),
        teamMembers: ["Ana Souza", "Carlos Mendes"],
        description: "Projeto de mapeamento e otimização de processos produtivos e logísticos.",
      },
    });

    const client2 = await prisma.client.create({
      data: {
        tenantId: tenant.id,
        name: "TechRetail Comércio Ltda.",
        segment: "Varejo",
        size: "MEDIUM",
        responsibleId: consultant2.id,
        projectStatus: "ACTIVE",
        startDate: new Date("2024-03-01"),
        teamMembers: ["Carlos Mendes"],
        description: "Digitalização e automação de processos de atendimento e vendas.",
      },
    });

    const client3 = await prisma.client.create({
      data: {
        tenantId: tenant.id,
        name: "LogiExpress Transportes",
        segment: "Logística",
        size: "MEDIUM",
        responsibleId: consultant1.id,
        projectStatus: "COMPLETED",
        startDate: new Date("2023-06-01"),
        endDate: new Date("2023-12-31"),
        teamMembers: ["Ana Souza"],
        description: "Redesenho de processos operacionais de coleta e entrega.",
      },
    });

    // Create processes for client1
    const process1 = await prisma.process.create({
      data: {
        clientId: client1.id,
        consultantId: consultant1.id,
        name: "Planejamento de Produção",
        area: "Operações",
        macroprocess: "Produção",
        type: "OPERATIONAL",
        description: "Processo de planejamento semanal da produção incluindo revisão de demanda, programação de máquinas e alocação de equipes.",
        objective: "Garantir a produção eficiente conforme demanda do mercado minimizando desperdícios.",
        version: "2.1",
        mappingDate: new Date("2024-02-10"),
        monthlyVolume: 4,
        avgExecutionTime: 480,
        peopleInvolved: 8,
        systemsUsed: ["SAP", "Excel"],
        standardizationLevel: 45,
        automationLevel: 20,
      },
    });

    const process2 = await prisma.process.create({
      data: {
        clientId: client1.id,
        consultantId: consultant1.id,
        name: "Controle de Qualidade",
        area: "Qualidade",
        macroprocess: "Produção",
        type: "OPERATIONAL",
        description: "Inspeção e controle de qualidade dos produtos ao longo da linha de produção.",
        objective: "Garantir que os produtos atendam aos padrões de qualidade estabelecidos.",
        version: "1.3",
        mappingDate: new Date("2024-02-15"),
        monthlyVolume: 1200,
        avgExecutionTime: 45,
        peopleInvolved: 12,
        systemsUsed: ["Sistema Interno", "Excel"],
        standardizationLevel: 60,
        automationLevel: 15,
      },
    });

    const process3 = await prisma.process.create({
      data: {
        clientId: client1.id,
        consultantId: consultant2.id,
        name: "Gestão de Compras",
        area: "Suprimentos",
        macroprocess: "Compras",
        type: "SUPPORT",
        description: "Processo de solicitação, cotação, aprovação e compra de materiais e insumos.",
        objective: "Garantir o abastecimento de materiais ao menor custo e maior qualidade.",
        version: "1.0",
        mappingDate: new Date("2024-03-01"),
        monthlyVolume: 85,
        avgExecutionTime: 120,
        peopleInvolved: 5,
        systemsUsed: ["SAP", "Email"],
        standardizationLevel: 30,
        automationLevel: 10,
      },
    });

    const process4 = await prisma.process.create({
      data: {
        clientId: client2.id,
        consultantId: consultant2.id,
        name: "Atendimento ao Cliente",
        area: "Customer Success",
        macroprocess: "Atendimento",
        type: "OPERATIONAL",
        description: "Processo de atendimento de solicitações, reclamações e dúvidas de clientes via múltiplos canais.",
        objective: "Resolver demandas dos clientes com agilidade e qualidade, garantindo satisfação.",
        version: "1.5",
        mappingDate: new Date("2024-03-20"),
        monthlyVolume: 3200,
        avgExecutionTime: 18,
        peopleInvolved: 15,
        systemsUsed: ["Zendesk", "WhatsApp Business", "Email"],
        standardizationLevel: 55,
        automationLevel: 30,
      },
    });

    const process5 = await prisma.process.create({
      data: {
        clientId: client2.id,
        consultantId: consultant2.id,
        name: "Processamento de Pedidos",
        area: "Vendas",
        macroprocess: "Vendas",
        type: "OPERATIONAL",
        description: "Registro, validação, separação e faturamento de pedidos de clientes.",
        objective: "Processar pedidos com precisão e rapidez garantindo entrega no prazo.",
        version: "2.0",
        mappingDate: new Date("2024-04-01"),
        monthlyVolume: 1850,
        avgExecutionTime: 35,
        peopleInvolved: 8,
        systemsUsed: ["ERP Próprio", "Correios API"],
        standardizationLevel: 70,
        automationLevel: 45,
      },
    });

    // Create analyses
    await prisma.processAnalysis.create({
      data: {
        processId: process1.id,
        authorId: consultant1.id,
        complexity: "HIGH",
        maturity: "DEFINED",
        problems: ["REWORK", "PEOPLE_DEPENDENCY", "LACK_OF_STANDARDIZATION"],
        analyticalNotes: "O processo de planejamento de produção ainda é fortemente dependente de planilhas Excel e do conhecimento tácito de poucos colaboradores chave. Há retrabalho significativo na fase de revisão de demanda. A ausência de um sistema integrado causa múltiplas versões do planejamento circulando simultaneamente.",
      },
    });

    await prisma.processAnalysis.create({
      data: {
        processId: process2.id,
        authorId: consultant1.id,
        complexity: "MEDIUM",
        maturity: "STANDARDIZED",
        problems: ["MANUAL_ACTIVITIES", "OPERATIONAL_ERRORS"],
        analyticalNotes: "O processo de controle de qualidade possui procedimentos documentados, porém a coleta de dados ainda é majoritariamente manual. Identificamos taxa de erro de preenchimento de 12% nos registros, impactando a rastreabilidade dos produtos.",
      },
    });

    await prisma.processAnalysis.create({
      data: {
        processId: process3.id,
        authorId: consultant2.id,
        complexity: "MEDIUM",
        maturity: "INITIAL",
        problems: ["LACK_OF_STANDARDIZATION", "PEOPLE_DEPENDENCY", "MANUAL_ACTIVITIES", "OPERATIONAL_RISK"],
        analyticalNotes: "Processo de compras sem procedimento formal estabelecido. Cada comprador opera de forma autônoma sem critérios padronizados para cotação e seleção de fornecedores. Alto risco operacional dado que não há auditoria dos processos de aprovação.",
      },
    });

    await prisma.processAnalysis.create({
      data: {
        processId: process4.id,
        authorId: consultant2.id,
        complexity: "MEDIUM",
        maturity: "DEFINED",
        problems: ["REWORK", "MANUAL_ACTIVITIES", "OPERATIONAL_ERRORS"],
        analyticalNotes: "Atendimento fragmentado entre múltiplos canais sem visão unificada do cliente. Frequente retrabalho por falta de historico acessível. Oportunidade significativa de automação via chatbot para demandas de primeiro nível que representam ~60% do volume.",
      },
    });

    await prisma.processAnalysis.create({
      data: {
        processId: process5.id,
        authorId: consultant2.id,
        complexity: "LOW",
        maturity: "STANDARDIZED",
        problems: ["MANUAL_ACTIVITIES"],
        analyticalNotes: "Processo bem estruturado e com boa aderência ao procedimento. Principal gargalo é a validação manual de endereços e cálculo de frete que poderia ser automatizado via integração com API dos Correios já disponível.",
      },
    });

    // Create opportunities
    const opp1 = await prisma.opportunity.create({
      data: {
        processId: process1.id,
        ownerId: consultant1.id,
        description: "Implementar módulo de S&OP integrado ao SAP para automatizar o planejamento de produção com base em previsão de demanda.",
        type: "AUTOMATION",
        expectedImpact: "HIGH",
        implementationComplexity: "HIGH",
        effortEstimate: "6 meses",
        estimatedHoursReduction: 160,
        estimatedCostReduction: 48000,
        operationalRiskReduction: "Alto",
        status: "PRIORITIZED",
        progress: 15,
        observations: "Aprovado em reunião de steering. Aguardando aprovação do orçamento de TI.",
      },
    });

    await prisma.opportunity.create({
      data: {
        processId: process1.id,
        ownerId: consultant1.id,
        description: "Criar procedimento padronizado de planejamento de produção com templates e critérios de decisão documentados.",
        type: "STANDARDIZATION",
        expectedImpact: "MEDIUM",
        implementationComplexity: "LOW",
        effortEstimate: "3 semanas",
        estimatedHoursReduction: 40,
        estimatedCostReduction: 12000,
        operationalRiskReduction: "Médio",
        status: "IN_DEVELOPMENT",
        progress: 65,
        observations: "Documentação em elaboração. Previsão de validação: próxima semana.",
      },
    });

    await prisma.opportunity.create({
      data: {
        processId: process2.id,
        ownerId: consultant1.id,
        description: "Implementar coleta de dados de qualidade via tablets na linha de produção integrada ao sistema de gestão.",
        type: "DIGITALIZATION",
        expectedImpact: "HIGH",
        implementationComplexity: "MEDIUM",
        effortEstimate: "2 meses",
        estimatedHoursReduction: 80,
        estimatedCostReduction: 24000,
        operationalRiskReduction: "Alto",
        status: "UNDER_ANALYSIS",
        progress: 30,
        observations: "Em avaliação de fornecedores de solução.",
      },
    });

    await prisma.opportunity.create({
      data: {
        processId: process3.id,
        ownerId: consultant2.id,
        description: "Redesenhar processo de compras com fluxo de aprovação claro, critérios de cotação padronizados e trilha de auditoria.",
        type: "PROCESS_REDESIGN",
        expectedImpact: "HIGH",
        implementationComplexity: "MEDIUM",
        effortEstimate: "6 semanas",
        estimatedHoursReduction: 60,
        estimatedCostReduction: 36000,
        operationalRiskReduction: "Muito Alto",
        status: "IDENTIFIED",
        progress: 0,
      },
    });

    const opp5 = await prisma.opportunity.create({
      data: {
        processId: process4.id,
        ownerId: consultant2.id,
        description: "Implementar chatbot com IA para atendimento de demandas de primeiro nível: consulta de status, trocas e dúvidas frequentes.",
        type: "AI_USE",
        expectedImpact: "TRANSFORMATIONAL",
        implementationComplexity: "MEDIUM",
        effortEstimate: "3 meses",
        estimatedHoursReduction: 480,
        estimatedCostReduction: 144000,
        operationalRiskReduction: "Médio",
        status: "PRIORITIZED",
        progress: 10,
        observations: "POC aprovado. Iniciando especificação técnica.",
      },
    });

    await prisma.opportunity.create({
      data: {
        processId: process4.id,
        ownerId: consultant2.id,
        description: "Unificar atendimento em plataforma omnichannel com visão 360° do cliente e histórico de interações.",
        type: "DIGITALIZATION",
        expectedImpact: "HIGH",
        implementationComplexity: "HIGH",
        effortEstimate: "4 meses",
        estimatedHoursReduction: 200,
        estimatedCostReduction: 60000,
        operationalRiskReduction: "Médio",
        status: "IDENTIFIED",
        progress: 0,
      },
    });

    await prisma.opportunity.create({
      data: {
        processId: process5.id,
        ownerId: consultant2.id,
        description: "Automatizar validação de endereços e cálculo de frete via integração com API dos Correios e transportadoras.",
        type: "AUTOMATION",
        expectedImpact: "MEDIUM",
        implementationComplexity: "LOW",
        effortEstimate: "3 semanas",
        estimatedHoursReduction: 120,
        estimatedCostReduction: 18000,
        operationalRiskReduction: "Baixo",
        status: "IN_DEPLOYMENT",
        progress: 85,
        observations: "Em homologação no ambiente de staging.",
      },
    });

    // Create indicators
    const ind1 = await prisma.processIndicator.create({
      data: {
        processId: process1.id,
        name: "Tempo médio de planejamento",
        type: "TIME",
        unit: "horas",
        target: 6,
        current: 8,
      },
    });

    const ind2 = await prisma.processIndicator.create({
      data: {
        processId: process2.id,
        name: "Taxa de erro no registro",
        type: "QUALITY",
        unit: "%",
        target: 2,
        current: 12,
      },
    });

    const ind3 = await prisma.processIndicator.create({
      data: {
        processId: process4.id,
        name: "Tempo médio de resolução",
        type: "TIME",
        unit: "minutos",
        target: 10,
        current: 18,
      },
    });

    const ind4 = await prisma.processIndicator.create({
      data: {
        processId: process5.id,
        name: "Taxa de pedidos processados no prazo",
        type: "EFFICIENCY",
        unit: "%",
        target: 98,
        current: 94,
      },
    });

    // Create measurements
    const now = new Date();
    const months = [-5, -4, -3, -2, -1, 0];

    for (const m of months) {
      const date = new Date(now.getFullYear(), now.getMonth() + m, 15);
      await prisma.indicatorMeasurement.create({
        data: {
          indicatorId: ind1.id,
          value: 9 + Math.random() * 2 - 1,
          measuredAt: date,
        },
      });
      await prisma.indicatorMeasurement.create({
        data: {
          indicatorId: ind2.id,
          value: 14 + Math.random() * 4 - 2,
          measuredAt: date,
        },
      });
      await prisma.indicatorMeasurement.create({
        data: {
          indicatorId: ind3.id,
          value: 20 + Math.random() * 6 - 3,
          measuredAt: date,
        },
      });
      await prisma.indicatorMeasurement.create({
        data: {
          indicatorId: ind4.id,
          value: 92 + Math.random() * 4 - 1,
          measuredAt: date,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Dados de demonstração criados com sucesso",
      counts: {
        tenants: 1,
        users: 2,
        clients: 3,
        processes: 5,
        opportunities: 7,
        indicators: 4,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Erro ao criar dados de demonstração", details: String(error) },
      { status: 500 }
    );
  }
}
