"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStatsAction() {
  try {
    // Get active licenses count
    const licenciasActivas = await prisma.licencia.count({
      where: { estado: "ACTIVA" },
    });

    // Get total clients count
    const totalClientes = await prisma.cliente.count();

    // Get licenses expiring in next 30 days
    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(en30Dias.getDate() + 30);

    const porVencer = await prisma.licencia.count({
      where: {
        estado: "ACTIVA",
        fechaVencimiento: {
          gte: hoy,
          lte: en30Dias,
        },
      },
    });

    // Get this month's revenue (from licenses created this month)
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    const licenciasDelMes = await prisma.licencia.findMany({
      where: {
        creadoEn: {
          gte: inicioMes,
          lte: finMes,
        },
        precio: {
          not: null,
        },
      },
      select: {
        precio: true,
      },
    });

    const ingresosMes = licenciasDelMes.reduce((sum: number, lic: any) => {
      return sum + (lic.precio ? parseFloat(lic.precio.toString()) : 0);
    }, 0);

    // Get product distribution
    const productos = await prisma.licencia.groupBy({
      by: ['producto'],
      _count: {
        producto: true
      }
    });

    const productosStats = {
      BARBERIA: 0,
      RESTAURANTE: 0,
      ESCOLAR: 0
    };

    productos.forEach((p: any) => {
      if (p.producto && p.producto in productosStats) {
        productosStats[p.producto as keyof typeof productosStats] = p._count.producto;
      }
    });

    return {
      success: true,
      stats: {
        licenciasActivas,
        totalClientes,
        porVencer,
        ingresosMes,
        productos: productosStats
      },
    };
  } catch (error: unknown) {
    console.error("[Action getDashboardStatsAction] Error:", error);
    return {
      success: false,
      error: "Error al obtener estadísticas",
      stats: {
        licenciasActivas: 0,
        totalClientes: 0,
        porVencer: 0,
        ingresosMes: 0,
      },
    };
  }
}
