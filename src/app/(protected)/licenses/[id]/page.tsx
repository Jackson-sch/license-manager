"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Key, Copy, Check, Ban, RotateCcw, Trash2,
  User, Clock, Shield, Scissors, Utensils, GraduationCap,
  Calendar, Server, Globe, Wifi, Activity, ChevronRight
} from "lucide-react";
import { getLicenseByIdAction, updateLicenseStatusAction, deleteLicenseAction } from "@/app/actions/licenses";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/use-translation";

type License = {
  id: string;
  claveProducto: string;
  tipo: "TRIAL" | "BASICO" | "PROFESIONAL" | "ENTERPRISE";
  producto: "BARBERIA" | "RESTAURANTE" | "ESCOLAR";
  estado: "PENDIENTE" | "ACTIVA" | "EXPIRADA" | "SUSPENDIDA" | "REVOCADA";
  maxUsuarios: number;
  maxClientes: number | null;
  diasValidez: number;
  precio: string | null;
  moneda: string;
  features: string | null;
  fechaActivacion: string | null;
  fechaVencimiento: string | null;
  hardwareId: string | null;
  dominioInstalacion: string | null;
  ipInstalacion: string | null;
  vecesActivada: number;
  ultimaVerificacion: string | null;
  notas: string | null;
  creadoEn: string;
  cliente: {
    id: string;
    nombre: string;
    email: string;
    empresa: string | null;
    telefono: string | null;
  } | null;
};

type HistoryItem = {
  id: string;
  accion: string;
  ip: string | null;
  hardwareId: string | null;
  fecha: string;
};

const estadoConfig: Record<string, { className: string; label: string }> = {
  PENDIENTE: { className: "bg-zinc-800 text-zinc-300 border-zinc-700", label: "Pending" },
  ACTIVA: { className: "bg-zinc-100 text-zinc-900 border-zinc-200 font-bold", label: "Active" },
  EXPIRADA: { className: "bg-red-950/20 text-red-400 border-red-900/30", label: "Expired" },
  SUSPENDIDA: { className: "bg-orange-950/20 text-orange-400 border-orange-900/30", label: "Suspended" },
  REVOCADA: { className: "bg-zinc-900 text-zinc-600 border-zinc-800", label: "Revoked" },
};

export default function LicenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t, language } = useTranslation();
  const [license, setLicense] = useState<License | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const statusMap: Record<string, { className: string; label: string }> = {
    PENDIENTE: { className: "bg-zinc-800 text-zinc-300 border-zinc-700", label: t.licenseDetails.waiting },
    ACTIVA: { className: "bg-zinc-100 text-zinc-900 border-zinc-200 font-bold", label: t.dashboard.statusHealthy || "Active" },
    EXPIRADA: { className: "bg-red-950/20 text-red-400 border-red-900/30", label: "Expired" }, // Simple enough, or add to i18n
    SUSPENDIDA: { className: "bg-orange-950/20 text-orange-400 border-orange-900/30", label: t.licenseDetails.suspend },
    REVOCADA: { className: "bg-zinc-900 text-zinc-600 border-zinc-800", label: t.licenseDetails.revoke },
  };

  useEffect(() => {
    async function fetchLicense() {
      const result = await getLicenseByIdAction(id);
      if (result.success && result.license) {
        setLicense(result.license as unknown as License);
        setHistory((result.history || []) as unknown as HistoryItem[]);
      }
      setLoading(false);
    }
    fetchLicense();
  }, [id]);

  const handleCopy = () => {
    if (license) {
      navigator.clipboard.writeText(license.claveProducto);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStatusChange = async (newStatus: "ACTIVA" | "SUSPENDIDA" | "REVOCADA") => {
    const result = await updateLicenseStatusAction(id, newStatus);
    if (result.success) {
      setLicense((prev) => (prev ? { ...prev, estado: newStatus } : null));
    } else {
      alert(result.error);
    }
  };

  const handleDelete = async () => {
    const result = await deleteLicenseAction(id);
    if (result.success) {
      router.push("/licenses");
    } else {
      alert(result.error);
    }
  };

  const locale = language === "en" ? "en-US" : "es-ES";

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Activity className="h-6 w-6 text-zinc-800 animate-pulse" />
      </div>
    );
  }

  if (!license) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <Card className="max-w-md bg-zinc-900 border-white/5 p-8 text-center">
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-6">{t.licenseDetails.objectNotFound}</p>
          <Button variant="outline" className="border-zinc-800" asChild>
            <Link href="/licenses">{t.licenseDetails.returnToIndex}</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const features = license.features ? JSON.parse(license.features) : [];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 shadow-2xl">
            <Key className="h-8 w-8 text-zinc-100" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <code className="text-2xl font-mono font-bold text-zinc-100 tracking-wider">
                {license.claveProducto}
              </code>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-white" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/10 bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-tighter">
                {license.producto}
              </Badge>
              <Badge variant="outline" className="border-white/10 bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-tighter">
                {license.tipo}
              </Badge>
              <Badge variant="outline" className={`text-[10px] uppercase tracking-widest font-bold border-none shadow-sm ${statusMap[license.estado]?.className}`}>
                {statusMap[license.estado]?.label || license.estado}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {license.estado === "SUSPENDIDA" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 font-bold h-10 px-6">
                  <RotateCcw className="mr-2 h-4 w-4" /> {t.licenseDetails.reactivate}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-zinc-100">{t.licenseDetails.restoreAccessTitle}</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-500">
                    {t.licenseDetails.restoreAccessDesc}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-800 border-none text-zinc-400">{t.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleStatusChange("ACTIVA")} className="bg-zinc-100 text-zinc-950 font-bold hover:bg-white">
                    {t.licenseDetails.confirmAction}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {license.estado === "ACTIVA" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 font-bold h-10 px-6">
                  <Ban className="mr-2 h-4 w-4" /> {t.licenseDetails.suspend}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.licenseDetails.suspendOperationsTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.licenseDetails.suspendOperationsDesc}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-800 border-none text-zinc-400">{t.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleStatusChange("SUSPENDIDA")} className="bg-zinc-100 text-zinc-950 font-bold hover:bg-white">
                    {t.licenseDetails.suspend}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {license.estado !== "REVOCADA" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-zinc-800 text-red-400/80 hover:bg-red-950/20 hover:text-red-400 font-bold h-10 px-6">
                  <Shield className="mr-2 h-4 w-4" /> {t.licenseDetails.revoke}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.licenseDetails.revokePermanentlyTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.licenseDetails.revokePermanentlyDesc}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-800 border-none text-zinc-400">{t.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleStatusChange("REVOCADA")} className="bg-red-600 text-white font-bold hover:bg-red-500">
                    {t.licenseDetails.revokeTerminal}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-700 hover:text-red-400 hover:bg-red-950/10">
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <AlertDialogHeader>
                <AlertDialogTitle>{t.licenseDetails.purgeRecord}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.licenseDetails.purgeRecordDesc}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-zinc-800 border-none text-zinc-400">{t.common.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white font-bold hover:bg-red-500">
                  {t.licenseDetails.purgeData}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-zinc-900/40 border-white/5 shadow-2xl backdrop-blur-sm">
            <CardHeader className="border-b border-white/5 pb-6">
              <CardTitle className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                {t.licenseDetails.provisioningStandards}
              </CardTitle>
              <CardDescription className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                {t.licenseDetails.functionalLimits}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider mb-2">{t.licenseDetails.concurrentUsers}</p>
                  <p className="text-2xl font-black text-zinc-100 tracking-tight">{license.maxUsuarios}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider mb-2">{t.licenseDetails.entityObjects}</p>
                  <p className="text-2xl font-black text-zinc-100 tracking-tight">{license.maxClientes ?? "∞"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider mb-2">{t.licenseDetails.totalValidity}</p>
                  <p className="text-2xl font-black text-zinc-100 tracking-tight">{license.diasValidez}d</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider mb-2">{t.licenseDetails.tierPrice}</p>
                  <p className="text-2xl font-black text-zinc-100 tracking-tight">
                    {license.precio ? `${license.moneda || 'S/'} ${license.precio}` : "N/A"}
                  </p>
                </div>
              </div>

              <Separator className="my-8 bg-white/5" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 rounded-lg bg-zinc-800/50 border border-white/5">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">{t.licenseDetails.activation}</p>
                    <p className="text-sm font-semibold text-zinc-100 mt-0.5">
                      {license.fechaActivacion
                        ? new Date(license.fechaActivacion).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
                        : t.licenseDetails.waiting}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 rounded-lg bg-zinc-800/50 border border-white/5">
                    <Clock className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">{t.licenseDetails.maturityDate}</p>
                    <p className="text-sm font-semibold text-zinc-100 mt-0.5">
                      {license.fechaVencimiento
                        ? new Date(license.fechaVencimiento).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
                        : t.licenseDetails.perpetual}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 rounded-lg bg-zinc-800/50 border border-white/5">
                    <Shield className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[10px] leading-tight font-bold uppercase tracking-wider text-zinc-400">{t.licenseDetails.totalCounts}</p>
                    <p className="text-sm font-black text-zinc-100">{license.vecesActivada} {t.licenseDetails.cycles}</p>
                  </div>
                </div>
              </div>

              {/* Sub-Features */}
              {features.length > 0 && (
                <>
                  <Separator className="my-8 bg-white/5" />
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase text-zinc-600 tracking-widest px-1">{t.licenseDetails.provisionedFeatures}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-white/20">
                        {license.tipo}
                      </Badge>
                      <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-white/20 uppercase">
                        {license.producto}
                      </Badge>
                      {features.map((f: string) => (
                        <Badge key={f} variant="outline" className="bg-zinc-800 border-white/5 text-zinc-400 text-[10px] font-bold px-3 py-1">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Installation Matrix */}
              {(license.hardwareId || license.dominioInstalacion || license.ipInstalacion) && (
                <>
                  <Separator className="my-8 bg-white/5" />
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase text-zinc-600 tracking-widest px-1">{t.licenseDetails.deploymentMatrix}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {license.hardwareId && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                          <Server className="h-4 w-4 text-zinc-700" />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[8px] font-bold uppercase text-zinc-600">{t.licenseDetails.hwidSignature}</p>
                            <code className="text-[10px] text-zinc-400 truncate block font-mono">{license.hardwareId}</code>
                          </div>
                        </div>
                      )}
                      {license.dominioInstalacion && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                          <Globe className="h-4 w-4 text-zinc-700" />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[8px] font-bold uppercase text-zinc-600">{t.licenseDetails.coreDomain}</p>
                            <p className="text-[10px] text-zinc-400 font-bold truncate">{license.dominioInstalacion}</p>
                          </div>
                        </div>
                      )}
                      {license.ipInstalacion && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                          <Wifi className="h-4 w-4 text-zinc-700" />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-[8px] font-bold uppercase text-zinc-600">{t.licenseDetails.endpointIp}</p>
                            <p className="text-[10px] text-zinc-400 font-bold truncate">{license.ipInstalacion}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card className="bg-zinc-900/40 border-white/5 shadow-2xl backdrop-blur-sm">
            <CardHeader className="border-b border-white/5 pb-6">
              <CardTitle className="text-zinc-100 flex items-center gap-3">
                <Clock className="h-5 w-5 text-zinc-700" />
                {t.licenseDetails.operationalHistory}
              </CardTitle>
              <CardDescription className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{t.licenseDetails.detailedTimeline}</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              {history.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
                  <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">{t.licenseDetails.noActivity}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {history.map((item, idx) => (
                    <div key={item.id} className="flex items-start gap-6 group">
                      <div className="relative flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 group-hover:bg-zinc-300 transition-colors mt-1.5" />
                        {idx < history.length - 1 && (
                          <div className="w-px h-16 bg-zinc-800 my-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6 border-b border-white/5 group-last:border-none">
                        <p className="text-zinc-200 text-sm font-bold tracking-tight">{item.accion}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                            {new Date(item.fecha).toLocaleString(locale, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {item.ip && (
                            <span className="text-zinc-700 text-[10px] font-bold tracking-widest">• IP: {item.ip}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Client Sidebar */}
        <div className="space-y-8">
          <Card className="bg-zinc-900 shadow-2xl border-white/5 overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <CardTitle className="text-zinc-100 flex items-center gap-3 text-base">
                <User className="h-4 w-4 text-zinc-500" />
                {t.licenseDetails.profileMapping}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              {license.cliente ? (
                <>
                  <div className="space-y-1 px-1">
                    <p className="text-xl font-bold text-white tracking-tight leading-none">{license.cliente.nombre}</p>
                    {license.cliente.empresa && (
                      <p className="text-zinc-500 text-xs font-medium">{license.cliente.empresa}</p>
                    )}
                  </div>

                  <Separator className="bg-white/5" />

                  <div className="space-y-5 px-1">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">{t.licenseDetails.communication}</p>
                      <p className="text-sm font-bold text-zinc-100 truncate">{license.cliente.email}</p>
                    </div>
                    {license.cliente.telefono && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">{t.licenseDetails.phoneAxis}</p>
                        <p className="text-sm font-bold text-zinc-100">{license.cliente.telefono}</p>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" className="w-full h-11 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all font-bold group" asChild>
                    <Link href={`/clients/${license.cliente.id}`} className="flex items-center justify-center gap-2">
                      {t.licenseDetails.viewFullProfile} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="py-8 text-center bg-black/20 border border-dashed border-white/5 rounded-xl">
                  <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-[0.2em]">{t.licenseDetails.keyIsStandalone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-8 text-center space-y-2">
              <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.3em]">{t.licenseDetails.operationalSince}</p>
              <div className="flex h-10 w-full items-center justify-center text-xs font-mono font-bold text-zinc-500 bg-black/40 border border-white/5 rounded-lg select-all">
                {new Date(license.creadoEn).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-zinc-100 rounded-2xl shadow-2xl flex flex-col gap-4 text-zinc-950">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5" />
              <p className="text-sm font-bold uppercase tracking-tight">{t.licenseDetails.technicalData}</p>
            </div>
            <Separator className="bg-zinc-950/10" />
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{t.licenseDetails.verificationEndpoint}</p>
              <p className="text-xs font-mono font-bold truncate">/api/verify</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{t.licenseDetails.currencyAxis}</p>
              <p className="text-xs font-bold">{license.moneda || 'PEN (S/)'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
