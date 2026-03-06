import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const process = await prisma.process.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        consultant: { select: { id: true, name: true } },
        analysis: {
          include: { author: { select: { id: true, name: true } } },
        },
        opportunities: {
          include: { owner: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
        indicators: {
          include: {
            measurements: { orderBy: { measuredAt: "asc" } },
          },
        },
        versions: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!process) {
      return NextResponse.json({ error: "Processo não encontrado" }, { status: 404 });
    }

    return NextResponse.json(process);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar processo" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const process = await prisma.process.update({
      where: { id },
      data: {
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
    });

    return NextResponse.json(process);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar processo" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.process.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar processo" }, { status: 500 });
  }
}
