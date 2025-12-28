"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Copy, Check, Scissors, Utensils, GraduationCap, Filter, Activity } from "lucide-react";
import { getLicensesAction } from "@/app/actions/licenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type License = {
  id: string;
  claveProducto: string;
  producto: string;
  tipo: string;
  estado: "ACTIVA" | "SUSPENDIDA" | "REVOCADA";
  creadoEn: Date;
  cliente: {
    nombre: string;
    email: string;
    empresa?: string | null;
  } | null;
};

const ESTADOS = [
  { value: "all", label: "All Statuses" },
  { value: "ACTIVA", label: "Active" },
  { value: "PENDIENTE", label: "Pending" },
  { value: "EXPIRADA", label: "Expired" },
  { value: "SUSPENDIDA", label: "Suspended" },
  { value: "REVOCADA", label: "Revoked" },
];

const PRODUCTOS = [
  { value: "all", label: "All Products" },
  { value: "BARBERIA", label: "Barberia", icon: Scissors },
  { value: "RESTAURANTE", label: "Restaurante", icon: Utensils },
  { value: "ESCOLAR", label: "Escolar", icon: GraduationCap },
];

const estadoConfig = {
  ACTIVA: { label: "Active", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  SUSPENDIDA: { label: "Suspended", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  REVOCADA: { label: "Revoked", className: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  PENDIENTE: { label: "Pending", className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  EXPIRADA: { label: "Expired", className: "bg-zinc-800 text-zinc-500 border-zinc-700" },
};

function getStatusBadge(estado: string) {
  const variants: Record<string, { className: string }> = {
    ACTIVA: { className: "bg-zinc-100 text-zinc-900 border-zinc-200 font-bold" },
    PENDIENTE: { className: "bg-zinc-800 text-zinc-300 border-zinc-700" },
    EXPIRADA: { className: "bg-red-950/20 text-red-400 border-red-900/30" },
    SUSPENDIDA: { className: "bg-orange-950/20 text-orange-400 border-orange-900/30" },
    REVOCADA: { className: "bg-zinc-900 text-zinc-600 border-zinc-800" },
  };
  const config = variants[estado] || variants.PENDIENTE;
  return <Badge variant="outline" className={`px-2 py-0.5 text-[10px] uppercase tracking-wider ${config.className}`}>{estado}</Badge>;
}

function ProductIcon({ producto }: { producto: string }) {
  const config = PRODUCTOS.find(p => p.value === producto);
  if (!config || !config.icon) return null;
  const Icon = config.icon;
  return <Icon className="h-4 w-4 text-zinc-500" />;
}

import { useTranslation } from "@/hooks/use-translation";

export default function LicensesPage() {
  const { t, language } = useTranslation();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("all");
  const [producto, setProducto] = useState("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const ESTADOS = [
    { value: "all", label: t.licenses.allStatuses },
    { value: "ACTIVA", label: t.licenses.statusLabels.active },
    { value: "PENDIENTE", label: t.licenses.statusLabels.pending },
    { value: "EXPIRADA", label: t.licenses.statusLabels.expired },
    { value: "SUSPENDIDA", label: t.licenses.statusLabels.suspended },
    { value: "REVOCADA", label: t.licenses.statusLabels.revoked },
  ];

  const PRODUCTOS_CONFIG = [
    { value: "all", label: t.licenses.allProducts },
    { value: "BARBERIA", label: t.products.barberia, icon: Scissors },
    { value: "RESTAURANTE", label: t.products.restaurante, icon: Utensils },
    { value: "ESCOLAR", label: t.products.escolar, icon: GraduationCap },
  ];

  const estadoConfig: Record<string, { label: string, className: string }> = {
    ACTIVA: { label: t.licenses.statusLabels.active, className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    SUSPENDIDA: { label: t.licenses.statusLabels.suspended, className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    REVOCADA: { label: t.licenses.statusLabels.revoked, className: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
    PENDIENTE: { label: t.licenses.statusLabels.pending, className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
    EXPIRADA: { label: t.licenses.statusLabels.expired, className: "bg-zinc-800 text-zinc-500 border-zinc-700" },
  };

  function getStatusBadge(estado: string) {
    const variants: Record<string, { className: string }> = {
      ACTIVA: { className: "bg-zinc-100 text-zinc-900 border-zinc-200 font-bold" },
      PENDIENTE: { className: "bg-zinc-800 text-zinc-300 border-zinc-700" },
      EXPIRADA: { className: "bg-red-950/20 text-red-400 border-red-900/30" },
      SUSPENDIDA: { className: "bg-orange-950/20 text-orange-400 border-orange-900/30" },
      REVOCADA: { className: "bg-zinc-900 text-zinc-600 border-zinc-800" },
    };
    const config = variants[estado] || variants.PENDIENTE;
    const label = estadoConfig[estado]?.label || estado;
    return <Badge variant="outline" className={`px-2 py-0.5 text-[10px] uppercase tracking-wider ${config.className}`}>{label}</Badge>;
  }

  const loadLicenses = useCallback(async () => {
    setLoading(true);
    const result = await getLicensesAction({
      estado: estado !== "all" ? estado : undefined,
      producto: producto !== "all" ? producto : undefined,
      search: search || undefined,
    });
    if (result.success && result.licenses) {
      setLicenses(result.licenses as License[]);
    }
    setLoading(false);
  }, [estado, producto, search]);

  useEffect(() => {
    loadLicenses();
  }, [loadLicenses]);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">{t.licenses.title}</h2>
          <p className="text-zinc-400 font-medium">{t.licenses.subtitle}</p>
        </div>
        <Button asChild className="bg-zinc-100 hover:bg-white text-zinc-900 font-bold h-11 px-6 shadow-xl shadow-black/20">
          <Link href="/licenses/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t.licenses.addLicense}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900/40 border-white/5 shadow-2xl backdrop-blur-md">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
              <Input
                placeholder={t.licenses.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-10 bg-zinc-950 border-white/5 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-800 focus-visible:border-zinc-800 transition-all"
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger className="h-11 w-full md:w-44 bg-zinc-950 border-white/5 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 opacity-50" />
                    <SelectValue placeholder={t.licenses.status} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  {ESTADOS.map((e) => (
                    <SelectItem key={e.value} value={e.value} className="focus:bg-zinc-800 focus:text-white">
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={producto} onValueChange={setProducto}>
                <SelectTrigger className="h-11 w-full md:w-44 bg-zinc-950 border-white/5 text-zinc-400">
                  <SelectValue placeholder={t.licenses.product} />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  {PRODUCTOS_CONFIG.map((p) => (
                    <SelectItem key={p.value} value={p.value} className="focus:bg-zinc-800 focus:text-white">
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="bg-zinc-900/40 border-white/5 shadow-2xl backdrop-blur-md overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 h-12 px-6">{t.licenses.key}</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 h-12">{t.licenses.product}</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t.licenses.type}</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center">{t.licenses.status}</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t.licenses.client}</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t.licenses.issuedOn}</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right px-6">{t.licenses.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="text-center py-20 text-zinc-600">
                    <div className="flex flex-col items-center gap-2">
                      <Activity className="h-6 w-6 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{t.common.loading}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : licenses.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="text-center py-20 text-zinc-600">
                    <p className="text-[10px] font-bold uppercase tracking-widest italic">{t.common.noData}</p>
                  </TableCell>
                </TableRow>
              ) : (
                licenses.map((license) => (
                  <TableRow key={license.id} className="border-white/5 group hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <code className="text-sm font-mono font-bold text-zinc-100 tracking-tight">
                          {license.claveProducto}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100"
                          onClick={() => copyKey(license.claveProducto)}
                        >
                          {copiedKey === license.claveProducto ? (
                            <Check className="h-3.5 w-3.5 text-zinc-100" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {(() => {
                          const config = PRODUCTOS_CONFIG.find(p => p.value === license.producto);
                          if (!config || !config.icon) return null;
                          const Icon = config.icon;
                          return <Icon className="h-4 w-4 text-zinc-500" />;
                        })()}
                        <span className="text-zinc-100 text-xs font-bold">{t.products[license.producto.toLowerCase() as keyof typeof t.products] || license.producto}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-zinc-800 border-white/10 text-zinc-300 text-[9px] font-black uppercase tracking-tighter shadow-sm">
                        {t.tiers[license.tipo.toLowerCase() as keyof typeof t.tiers] || license.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(license.estado)}
                    </TableCell>
                    <TableCell>
                      {license.cliente ? (
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-zinc-100">{license.cliente.nombre}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">{license.cliente.empresa || t.licenses.privateIndividual}</p>
                        </div>
                      ) : (
                        <span className="text-zinc-700 text-[10px] font-black uppercase italic tracking-widest">{t.licenses.unassignedAxis}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-[10px] font-bold uppercase">
                      {new Date(license.creadoEn).toLocaleDateString(language === "en" ? "en-US" : "es-ES", { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-700 hover:text-white hover:bg-zinc-800 transition-colors" asChild>
                        <Link href={`/licenses/${license.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
