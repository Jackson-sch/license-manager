import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EstadoLicencia } from "@prisma/client";

/**
 * API para validar licencias desde el sistema de barbería
 * 
 * POST /api/verify
 * Body: { productKey: string, hardwareId?: string }
 * 
 * Este endpoint es llamado desde cada instalación para verificar si la licencia es válida
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productKey, hardwareId, domain, ip, producto } = body;

    if (!productKey) {
      return NextResponse.json(
        { valid: false, error: "Clave de producto requerida" },
        { status: 400 }
      );
    }

    // Buscar licencia
    const licencia = await prisma.licencia.findUnique({
      where: { claveProducto: productKey.toUpperCase() },
    });

    if (!licencia) {
      return NextResponse.json({ valid: false, error: "Licencia no encontrada" });
    }

    // Verificar Producto (Si se especifica)
    // Permite "BARBERIA" ser validado solo por sistemas de "BARBERIA"
    if (producto && licencia.producto !== producto) {
      return NextResponse.json({
        valid: false,
        error: `Esta licencia es válida para ${licencia.producto}, no para ${producto}`
      });
    }

    // Verificar estado
    if (licencia.estado === EstadoLicencia.REVOCADA) {
      return NextResponse.json({ valid: false, error: "Licencia revocada" });
    }

    if (licencia.estado === EstadoLicencia.SUSPENDIDA) {
      return NextResponse.json({ valid: false, error: "Licencia suspendida" });
    }

    // Verificar expiración
    if (licencia.fechaVencimiento && new Date() > licencia.fechaVencimiento) {
      // Marcar como expirada si no lo está
      if (licencia.estado !== EstadoLicencia.EXPIRADA) {
        await prisma.licencia.update({
          where: { id: licencia.id },
          data: { estado: EstadoLicencia.EXPIRADA },
        });
      }
      return NextResponse.json({ valid: false, error: "Licencia expirada" });
    }

    // Verificar Hardware Lock (Si la licencia ya fue activada)
    if (licencia.fechaActivacion) {
      // Si la licencia tiene hardwareId registrado y nos envían uno, deben coincidir
      if (licencia.hardwareId && hardwareId && licencia.hardwareId !== hardwareId) {
        // Opción: Permitir cierta flexibilidad o reset manual, 
        // pero por seguridad estricta:
        return NextResponse.json({
          valid: false,
          error: "La licencia está activa en otro dispositivo (Hardware ID mismatch)"
        });
      }

      // Si es un dominio web (SaaS) y coincide
      if (licencia.dominioInstalacion && domain && licencia.dominioInstalacion !== domain) {
        // Permitir subdominios o ser estricto
        return NextResponse.json({
          valid: false,
          error: "La licencia está asignada a otro dominio"
        });
      }
    }


    // Si es primera activación
    if (!licencia.fechaActivacion) {
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + licencia.diasValidez);

      // Si es Enterprise, podría no tener vencimiento (null en schema?), 
      // pero aquí asumimos diasValidez por ahora o un valor alto predeterminado.
      // Ajuste según lógica de license-utils.

      await prisma.licencia.update({
        where: { id: licencia.id },
        data: {
          estado: EstadoLicencia.ACTIVA,
          fechaActivacion: new Date(),
          fechaVencimiento,
          hardwareId: hardwareId || null,
          dominioInstalacion: domain || null,
          ipInstalacion: ip || null,
          vecesActivada: { increment: 1 },
          ultimaVerificacion: new Date(),
        },
      });
    } else {
      // Actualizar última verificación
      await prisma.licencia.update({
        where: { id: licencia.id },
        data: {
          ultimaVerificacion: new Date(),
          ipInstalacion: ip || licencia.ipInstalacion,
        },
      });
    }

    // Registrar en historial
    await prisma.historialActivacion.create({
      data: {
        licenciaId: licencia.id,
        accion: licencia.fechaActivacion ? "VERIFICACION" : "ACTIVACION",
        ip: ip || null,
        hardwareId: hardwareId || null,
        userAgent: request.headers.get("user-agent") || null,
      },
    });

    // Calcular días restantes
    let diasRestantes = null;
    if (licencia.fechaVencimiento) {
      const diff = licencia.fechaVencimiento.getTime() - new Date().getTime();
      diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      valid: true,
      license: {
        producto: licencia.producto,
        tipo: licencia.tipo,
        estado: "ACTIVA",
        maxUsuarios: licencia.maxUsuarios,
        maxClientes: licencia.maxClientes,
        features: licencia.features ? JSON.parse(licencia.features) : [],
        diasRestantes,
        fechaVencimiento: licencia.fechaVencimiento,
      },
    });
  } catch (error) {
    console.error("Error verifying license:", error);
    return NextResponse.json(
      { valid: false, error: "Error de servidor" },
      { status: 500 }
    );
  }
}
