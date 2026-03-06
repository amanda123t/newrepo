import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        description: body.description,
        type: body.type,
        expectedImpact: body.expectedImpact,
        implementationComplexity: body.implementationComplexity,
        effortEstimate: body.effortEstimate || null,
        estimatedHoursReduction: body.estimatedHoursReduction ? Number(body.estimatedHoursReduction) : null,
        estimatedCostReduction: body.estimatedCostReduction ? Number(body.estimatedCostReduction) : null,
        operationalRiskReduction: body.operationalRiskReduction || null,
        status: body.status,
        deadline: body.deadline ? new Date(body.deadline) : null,
        progress: body.progress ? Number(body.progress) : 0,
        observations: body.observations || null,
      },
    });

    return NextResponse.json(opportunity);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar oportunidade" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.opportunity.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar oportunidade" }, { status: 500 });
  }
}
