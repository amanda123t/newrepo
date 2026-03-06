import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const clients = await prisma.client.findMany({
      where: status ? { projectStatus: status as any } : undefined,
      include: {
        responsible: { select: { id: true, name: true, email: true } },
        processes: {
          include: {
            opportunities: true,
            analysis: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = await prisma.client.create({
      data: {
        tenantId: body.tenantId || "default-tenant",
        name: body.name,
        segment: body.segment,
        size: body.size,
        responsibleId: body.responsibleId || null,
        projectStatus: body.projectStatus || "ACTIVE",
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        teamMembers: body.teamMembers || [],
        description: body.description || null,
      },
      include: {
        responsible: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 });
  }
}
