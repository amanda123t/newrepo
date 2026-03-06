import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const indicator = await prisma.processIndicator.create({
      data: {
        processId: body.processId,
        name: body.name,
        type: body.type,
        unit: body.unit || null,
        target: body.target ? Number(body.target) : null,
        current: body.current ? Number(body.current) : null,
      },
    });

    return NextResponse.json(indicator, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar indicador" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const processId = searchParams.get("processId");

    const indicators = await prisma.processIndicator.findMany({
      where: processId ? { processId } : undefined,
      include: {
        measurements: { orderBy: { measuredAt: "asc" } },
        process: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(indicators);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar indicadores" }, { status: 500 });
  }
}
