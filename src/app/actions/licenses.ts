"use server";

import { prisma } from "@/lib/prisma";
import { generateProductKey, LIMITS_BY_LICENSE, FEATURES_BY_PRODUCT, DIAS_VALIDEZ } from "@/lib/license-utils";
import { TipoLicencia, Producto } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createLicenseAction(data: {
  tipo: TipoLicencia;
  producto: Producto;
  cliente: {
    nombre: string;
    email: string;
    empresa: string;
  };
}) {
  try {
    const { tipo, producto, cliente } = data;

    // Validar tipo
    if (!["TRIAL", "BASICO", "PROFESIONAL", "ENTERPRISE"].includes(tipo)) {
      throw new Error("Tipo de licencia inválido");
    }

    // Validar producto
    if (!["BARBERIA", "RESTAURANTE", "ESCOLAR"].includes(producto)) {
      throw new Error("Producto inválido");
    }

    const limits = LIMITS_BY_LICENSE[tipo];
    const features = FEATURES_BY_PRODUCT[producto][tipo];
    const diasValidez = DIAS_VALIDEZ[tipo];

    // Generar clave única
    let claveProducto = generateProductKey();
    let exists = await prisma.licencia.findUnique({ where: { claveProducto } });
    while (exists) {
      claveProducto = generateProductKey();
      exists = await prisma.licencia.findUnique({ where: { claveProducto } });
    }

    // Crear cliente si se proporcionó info
    let clienteId: string | null = null;
    if (cliente?.email) {
      const existingClient = await prisma.cliente.findUnique({ where: { email: cliente.email } });

      if (existingClient) {
        clienteId = existingClient.id;
      } else {
        const newClient = await prisma.cliente.create({
          data: {
            nombre: cliente.nombre || "Cliente",
            email: cliente.email,
            empresa: cliente.empresa || null,
          },
        });
        clienteId = newClient.id;
      }
    }

    // Crear licencia
    const licencia = await prisma.licencia.create({
      data: {
        claveProducto,
        tipo,
        producto,
        maxUsuarios: limits.usuarios,
        maxClientes: limits.clientes,
        diasValidez,
        precio: limits.precio,
        features: JSON.stringify(features),
        clienteId,
      },
    });

    revalidatePath("/");
    revalidatePath("/licenses");

    return {
      success: true,
      license: {
        id: licencia.id,
        claveProducto: licencia.claveProducto,
        tipo: licencia.tipo,
        producto: licencia.producto,
      },
    };
  } catch (error: any) {
    console.error("[Action createLicenseAction] Error:", error);
    return {
      success: false,
      error: error.message || "Error al crear licencia",
    };
  }
}

export async function getLicensesAction(filters?: {
  estado?: string;
  tipo?: string;
  producto?: string;
  search?: string;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (filters?.estado && filters.estado !== "TODOS") {
      where.estado = filters.estado;
    }
    if (filters?.tipo && filters.tipo !== "TODOS") {
      where.tipo = filters.tipo;
    }
    if (filters?.producto && filters.producto !== "TODOS") {
      where.producto = filters.producto;
    }
    if (filters?.search) {
      where.OR = [
        { claveProducto: { contains: filters.search, mode: "insensitive" } },
        { cliente: { nombre: { contains: filters.search, mode: "insensitive" } } },
        { cliente: { email: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const licencias = await prisma.licencia.findMany({
      where,
      include: {
        cliente: {
          select: { id: true, nombre: true, email: true, empresa: true },
        },
      },
      orderBy: { creadoEn: "desc" },
    });

    // Serialize Decimal and Dates for Client Components
    const serializedLicenses = licencias.map((lic: any) => ({
      ...lic,
      precio: lic.precio ? Number(lic.precio) : null,
      creadoEn: lic.creadoEn.toISOString(),
      actualizadoEn: lic.actualizadoEn.toISOString(),
      fechaActivacion: lic.fechaActivacion?.toISOString() || null,
      fechaVencimiento: lic.fechaVencimiento?.toISOString() || null,
      ultimaVerificacion: lic.ultimaVerificacion?.toISOString() || null,
      cliente: lic.cliente ? {
        ...lic.cliente
      } : null
    }));

    return { success: true, licenses: serializedLicenses };
  } catch (error: unknown) {
    console.error("[Action getLicensesAction] Error:", error);
    return { success: false, error: "Error al obtener licencias", licenses: [] };
  }
}

export async function getLicenseByIdAction(id: string) {
  try {
    const licencia = await prisma.licencia.findUnique({
      where: { id },
      include: {
        cliente: true,
      },
    });

    if (!licencia) {
      return { success: false, error: "Licencia no encontrada" };
    }

    // Get activation history
    const historial = await prisma.historialActivacion.findMany({
      where: { licenciaId: id },
      orderBy: { fecha: "desc" },
      take: 20,
    });

    // Serialize Decimal and Dates
    const serializedLicense = {
      ...licencia,
      precio: licencia.precio ? Number(licencia.precio) : null,
      creadoEn: licencia.creadoEn.toISOString(),
      actualizadoEn: licencia.actualizadoEn.toISOString(),
      fechaActivacion: licencia.fechaActivacion?.toISOString() || null,
      fechaVencimiento: licencia.fechaVencimiento?.toISOString() || null,
      ultimaVerificacion: licencia.ultimaVerificacion?.toISOString() || null,
    };

    return { success: true, license: serializedLicense, history: historial };
  } catch (error: unknown) {
    console.error("[Action getLicenseByIdAction] Error:", error);
    return { success: false, error: "Error al obtener licencia" };
  }
}

export async function updateLicenseStatusAction(
  id: string,
  estado: "ACTIVA" | "SUSPENDIDA" | "REVOCADA"
) {
  try {
    const licencia = await prisma.licencia.update({
      where: { id },
      data: { estado },
    });

    // Register in history
    await prisma.historialActivacion.create({
      data: {
        licenciaId: id,
        accion: `CAMBIO_ESTADO_${estado}`,
        detalles: `Estado cambiado a ${estado}`,
      },
    });

    revalidatePath("/licenses");
    revalidatePath(`/licenses/${id}`);

    return {
      success: true,
      license: {
        ...licencia,
        precio: licencia.precio ? Number(licencia.precio) : null,
        creadoEn: licencia.creadoEn.toISOString(),
        actualizadoEn: licencia.actualizadoEn.toISOString(),
        fechaActivacion: licencia.fechaActivacion?.toISOString() || null,
        fechaVencimiento: licencia.fechaVencimiento?.toISOString() || null,
        ultimaVerificacion: licencia.ultimaVerificacion?.toISOString() || null,
      }
    };
  } catch (error: unknown) {
    console.error("[Action updateLicenseStatusAction] Error:", error);
    return { success: false, error: "Error al actualizar estado" };
  }
}

export async function deleteLicenseAction(id: string) {
  try {
    // Delete activation history first
    await prisma.historialActivacion.deleteMany({
      where: { licenciaId: id },
    });

    // Delete license
    await prisma.licencia.delete({
      where: { id },
    });

    revalidatePath("/licenses");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    console.error("[Action deleteLicenseAction] Error:", error);
    return { success: false, error: "Error al eliminar licencia" };
  }
}
