import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const processId = searchParams.get("processId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const opportunities = await prisma.opportunity.findMany({
      where: {
        ...(processId ? { processId } : {}),
        ...(status ? { status: status as any } : {}),
        ...(type ? { type: type as any } : {}),
      },
      include: {
        process: {
          select: {
            id: true,
            name: true,
            area: true,
            client: { select: { id: true, name: true } },
          },
        },
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar oportunidades" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const opportunity = await prisma.opportunity.create({
      data: {
        processId: body.processId,
        ownerId: body.ownerId || null,
        description: body.description,
        type: body.type,
        expectedImpact: body.expectedImpact,
        implementationComplexity: body.implementationComplexity,
        effortEstimate: body.effortEstimate || null,
        estimatedHoursReduction: body.estimatedHoursReduction ? Number(body.estimatedHoursReduction) : null,
        estimatedCostReduction: body.estimatedCostReduction ? Number(body.estimatedCostReduction) : null,
        operationalRiskReduction: body.operationalRiskReduction || null,
        status: body.status || "IDENTIFIED",
        deadline: body.deadline ? new Date(body.deadline) : null,
        progress: body.progress ? Number(body.progress) : 0,
        observations: body.observations || null,
      },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar oportunidade" }, { status: 500 });
  }
}
