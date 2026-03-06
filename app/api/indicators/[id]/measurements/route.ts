import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    const measurement = await prisma.indicatorMeasurement.create({
      data: {
        indicatorId: params.id,
        value: Number(body.value),
        measuredAt: body.measuredAt ? new Date(body.measuredAt) : new Date(),
        notes: body.notes || null,
      },
    });

    // Update current value on indicator
    await prisma.processIndicator.update({
      where: { id: params.id },
      data: { current: Number(body.value) },
    });

    return NextResponse.json(measurement, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao registrar medição" }, { status: 500 });
  }
}
