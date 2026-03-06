import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const measurement = await prisma.indicatorMeasurement.create({
      data: {
        indicatorId: id,
        value: Number(body.value),
        measuredAt: body.measuredAt ? new Date(body.measuredAt) : new Date(),
        notes: body.notes || null,
      },
    });

    await prisma.processIndicator.update({
      where: { id },
      data: { current: Number(body.value) },
    });

    return NextResponse.json(measurement, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao registrar medição" }, { status: 500 });
  }
}
