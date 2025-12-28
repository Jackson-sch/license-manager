import { TipoLicencia, Producto } from "@prisma/client";

// Features por producto y tipo de licencia
export const FEATURES_BY_PRODUCT: Record<Producto, Record<TipoLicencia, string[]>> = {
  BARBERIA: {
    TRIAL: ["pos", "citas", "clientes", "servicios"],
    BASICO: ["pos", "citas", "clientes", "servicios", "inventario", "comisiones", "reportes_basicos"],
    PROFESIONAL: [
      "pos",
      "citas",
      "clientes",
      "servicios",
      "inventario",
      "comisiones",
      "reportes_basicos",
      "reportes_avanzados",
      "portal_reservas",
      "crm",
    ],
    ENTERPRISE: ["*"],
  },
  RESTAURANTE: {
    TRIAL: ["pos", "mesas", "menu_digital", "cocina"],
    BASICO: ["pos", "mesas", "menu_digital", "cocina", "inventario", "caja"],
    PROFESIONAL: [
      "pos",
      "mesas",
      "menu_digital",
      "cocina",
      "inventario",
      "caja",
      "reportes",
      "delivery",
      "kds",
    ],
    ENTERPRISE: ["*"],
  },
  ESCOLAR: {
    TRIAL: ["matricula", "estudiantes", "docentes"],
    BASICO: ["matricula", "estudiantes", "docentes", "notas", "asistencia"],
    PROFESIONAL: [
      "matricula",
      "estudiantes",
      "docentes",
      "notas",
      "asistencia",
      "pagos",
      "aula_virtual",
      "reportes_minedu",
    ],
    ENTERPRISE: ["*"],
  },
};

// Límites por tipo de licencia
export const LIMITS_BY_LICENSE: Record<TipoLicencia, { usuarios: number; clientes: number | null; precio: number }> = {
  TRIAL: { usuarios: 2, clientes: 100, precio: 0 },
  BASICO: { usuarios: 3, clientes: 500, precio: 199 },
  PROFESIONAL: { usuarios: 10, clientes: null, precio: 499 },
  ENTERPRISE: { usuarios: 999, clientes: null, precio: 999 },
};

// Días de validez por tipo
export const DIAS_VALIDEZ: Record<TipoLicencia, number> = {
  TRIAL: 30,
  BASICO: 365,
  PROFESIONAL: 365,
  ENTERPRISE: 9999, // Perpetua
};

/**
 * Genera una clave de producto aleatoria
 * Formato: XXXX-XXXX-XXXX-XXXX
 */
export function generateProductKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segments: string[] = [];

  for (let i = 0; i < 4; i++) {
    let segment = "";
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }

  return segments.join("-");
}

/**
 * Valida formato de clave
 */
export function isValidKeyFormat(key: string): boolean {
  const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(key.toUpperCase());
}
