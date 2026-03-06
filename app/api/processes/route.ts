import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    const processes = await prisma.process.findMany({
      where: clientId ? { clientId } : undefined,
      include: {
        client: { select: { id: true, name: true } },
        consultant: { select: { id: true, name: true } },
        analysis: true,
        opportunities: true,
        indicators: {
          include: { measurements: { orderBy: { measuredAt: "desc" }, take: 1 } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(processes);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar processos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const process = await prisma.process.create({
      data: {
        clientId: body.clientId,
        consultantId: body.consultantId || null,
        name: body.name,
        area: body.area,
        macroprocess: body.macroprocess || null,
        type: body.type,
        description: body.description || null,
        objective: body.objective || null,
        version: body.version || "1.0",
        mappingDate: body.mappingDate ? new Date(body.mappingDate) : null,
        monthlyVolume: body.monthlyVolume ? Number(body.monthlyVolume) : null,
        avgExecutionTime: body.avgExecutionTime ? Number(body.avgExecutionTime) : null,
        peopleInvolved: body.peopleInvolved ? Number(body.peopleInvolved) : null,
        systemsUsed: body.systemsUsed || [],
        standardizationLevel: body.standardizationLevel ? Number(body.standardizationLevel) : 0,
        automationLevel: body.automationLevel ? Number(body.automationLevel) : 0,
      },
      include: {
        client: { select: { id: true, name: true } },
        consultant: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(process, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar processo" }, { status: 500 });
  }
}
