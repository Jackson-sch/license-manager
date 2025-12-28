"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClientsAction(params?: { search?: string }) {
  const search = params?.search;
  try {
    const where = search
    const clientes = await prisma.cliente.findMany({
      where: search
        ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { empresa: { contains: search, mode: "insensitive" } },
          ],
        }
        : {},
      select: {
        id: true,
        nombre: true,
        email: true,
        empresa: true,
        telefono: true,
        creadoEn: true,
        _count: {
          select: { licencias: true },
        },
      },
      orderBy: { creadoEn: "desc" },
    });

    return { success: true, clients: clientes };
  } catch (error: unknown) {
    console.error("[Action getClientsAction] Error:", error);
    return { success: false, error: "Error al obtener clientes", clients: [] };
  }
}

export async function getClientByIdAction(id: string) {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        licencias: {
          orderBy: { creadoEn: "desc" },
        },
      },
    });

    if (!cliente) {
      return { success: false, error: "Cliente no encontrado" };
    }

    // Serialize Decimal and Dates in nested licenses
    const serializedClient = {
      ...cliente,
      creadoEn: cliente.creadoEn.toISOString(),
      actualizadoEn: cliente.actualizadoEn.toISOString(),
      licencias: (cliente as any).licencias.map((lic: any) => ({
        ...lic,
        precio: lic.precio ? Number(lic.precio) : null,
        creadoEn: lic.creadoEn.toISOString(),
        actualizadoEn: lic.actualizadoEn.toISOString(),
        fechaActivacion: lic.fechaActivacion?.toISOString() || null,
        fechaVencimiento: lic.fechaVencimiento?.toISOString() || null,
        ultimaVerificacion: lic.ultimaVerificacion?.toISOString() || null,
      })),
    };

    return { success: true, client: serializedClient };
  } catch (error: unknown) {
    console.error("[Action getClientByIdAction] Error:", error);
    return { success: false, error: "Error al obtener cliente" };
  }
}

export async function createClientAction(data: {
  nombre: string;
  email: string;
  empresa?: string;
  telefono?: string;
  direccion?: string;
  notas?: string;
}) {
  try {
    // Check if email already exists
    const existing = await prisma.cliente.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { success: false, error: "Ya existe un cliente con ese email" };
    }

    const cliente = await prisma.cliente.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        empresa: data.empresa || null,
        telefono: data.telefono || null,
        direccion: data.direccion || null,
        notas: data.notas || null,
      },
    });

    revalidatePath("/clients");
    revalidatePath("/");

    return { success: true, client: cliente };
  } catch (error: unknown) {
    console.error("[Action createClientAction] Error:", error);
    return { success: false, error: "Error al crear cliente" };
  }
}

export async function updateClientAction(
  id: string,
  data: {
    nombre?: string;
    email?: string;
    empresa?: string;
    telefono?: string;
    direccion?: string;
    notas?: string;
  }
) {
  try {
    // Check if email already exists for another client
    if (data.email) {
      const existing = await prisma.cliente.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (existing) {
        return { success: false, error: "Ya existe otro cliente con ese email" };
      }
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nombre: data.nombre,
        email: data.email,
        empresa: data.empresa,
        telefono: data.telefono,
        direccion: data.direccion,
        notas: data.notas,
      },
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);

    return { success: true, client: cliente };
  } catch (error: unknown) {
    console.error("[Action updateClientAction] Error:", error);
    return { success: false, error: "Error al actualizar cliente" };
  }
}

export async function deleteClientAction(id: string) {
  try {
    // Check if client has licenses
    const client = await prisma.cliente.findUnique({
      where: { id },
      include: { _count: { select: { licencias: true } } },
    });

    if (client && client._count.licencias > 0) {
      return {
        success: false,
        error: `No se puede eliminar. El cliente tiene ${client._count.licencias} licencia(s) asociada(s).`,
      };
    }

    await prisma.cliente.delete({
      where: { id },
    });

    revalidatePath("/clients");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    console.error("[Action deleteClientAction] Error:", error);
    return { success: false, error: "Error al eliminar cliente" };
  }
}
