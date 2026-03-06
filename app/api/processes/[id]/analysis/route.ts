import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const analysis = await prisma.processAnalysis.upsert({
      where: { processId: id },
      create: {
        processId: id,
        authorId: body.authorId || null,
        complexity: body.complexity,
        maturity: body.maturity,
        problems: body.problems || [],
        analyticalNotes: body.analyticalNotes || null,
      },
      update: {
        authorId: body.authorId || null,
        complexity: body.complexity,
        maturity: body.maturity,
        problems: body.problems || [],
        analyticalNotes: body.analyticalNotes || null,
      },
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar análise" }, { status: 500 });
  }
}
