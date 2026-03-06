import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [
      totalClients,
      activeClients,
      totalProcesses,
      totalOpportunities,
      opportunities,
      processes,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { projectStatus: "ACTIVE" } }),
      prisma.process.count(),
      prisma.opportunity.count(),
      prisma.opportunity.findMany({
        include: {
          process: {
            select: {
              name: true,
              area: true,
              automationLevel: true,
              monthlyVolume: true,
              client: { select: { name: true } },
            },
          },
        },
      }),
      prisma.process.findMany({
        include: {
          analysis: true,
          opportunities: true,
          client: { select: { name: true } },
        },
      }),
    ]);

    // Oportunidades por tipo
    const byType = opportunities.reduce((acc: Record<string, number>, opp: any) => {
      acc[opp.type] = (acc[opp.type] || 0) + 1;
      return acc;
    }, {});

    // Oportunidades por impacto
    const byImpact = opportunities.reduce((acc: Record<string, number>, opp: any) => {
      acc[opp.expectedImpact] = (acc[opp.expectedImpact] || 0) + 1;
      return acc;
    }, {});

    // Oportunidades por status (pipeline)
    const byStatus = opportunities.reduce((acc: Record<string, number>, opp: any) => {
      acc[opp.status] = (acc[opp.status] || 0) + 1;
      return acc;
    }, {});

    // Economia potencial total
    const totalSavings = opportunities.reduce((sum: number, opp: any) => {
      return sum + (opp.estimatedCostReduction || 0);
    }, 0);

    const totalHoursSaved = opportunities.reduce((sum: number, opp: any) => {
      return sum + (opp.estimatedHoursReduction || 0);
    }, 0);

    // Ranking de automação - processos com maior potencial
    const automationRanking = (processes as any[])
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        client: p.client.name,
        automationLevel: p.automationLevel || 0,
        opportunities: p.opportunities.filter((o: any) => o.type === "AUTOMATION" || o.type === "AI_USE").length,
        potentialSaving: p.opportunities.reduce((sum: number, o: any) => sum + (o.estimatedCostReduction || 0), 0),
      }))
      .sort((a: any, b: any) => b.opportunities - a.opportunities || a.automationLevel - b.automationLevel)
      .slice(0, 5);

    // Processos com maior risco
    const highRiskProcesses = (processes as any[])
      .filter((p: any) => p.analysis?.problems.includes("OPERATIONAL_RISK"))
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        client: p.client.name,
        complexity: p.analysis?.complexity,
        maturity: p.analysis?.maturity,
        opportunitiesCount: p.opportunities.length,
      }))
      .slice(0, 5);

    // Oportunidades completadas
    const completed = (opportunities as any[]).filter((o: any) => o.status === "COMPLETED").length;

    return NextResponse.json({
      kpis: {
        totalClients,
        activeClients,
        totalProcesses,
        totalOpportunities,
        totalSavings,
        totalHoursSaved,
        completedOpportunities: completed,
        completionRate: totalOpportunities > 0
          ? Math.round((completed / totalOpportunities) * 100)
          : 0,
      },
      charts: {
        byType,
        byImpact,
        byStatus,
      },
      rankings: {
        automationRanking,
        highRiskProcesses,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar dados do dashboard" }, { status: 500 });
  }
}
