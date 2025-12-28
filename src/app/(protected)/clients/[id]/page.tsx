"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Loader2, Trash2, Key, Save, Mail, Building2, Phone, MapPin, ChevronRight, Activity } from "lucide-react";
import { getClientByIdAction, updateClientAction, deleteClientAction } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/use-translation";
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

type License = {
  id: string;
  claveProducto: string;
  tipo: string;
  estado: string;
  fechaVencimiento: string | null;
};

type Client = {
  id: string;
  nombre: string;
  email: string;
  empresa: string | null;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
  creadoEn: string;
  licencias: License[];
};

const estadoConfig: Record<string, { className: string }> = {
  PENDIENTE: { className: "bg-zinc-800 text-zinc-300 border-zinc-700" },
  ACTIVA: { className: "bg-zinc-100 text-zinc-900 border-zinc-200 font-bold" },
  EXPIRADA: { className: "bg-red-950/20 text-red-400 border-red-900/30" },
  SUSPENDIDA: { className: "bg-orange-950/20 text-orange-400 border-orange-900/30" },
  REVOCADA: { className: "bg-zinc-900 text-zinc-600 border-zinc-800" },
};

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t, language } = useTranslation();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    empresa: "",
    telefono: "",
    direccion: "",
    notas: "",
  });

  const locale = language === "en" ? "en-US" : "es-ES";

  const statusMap: Record<string, { className: string; label: string }> = {
    PENDIENTE: { className: "bg-zinc-800 text-zinc-300 border-zinc-700", label: t.licenseDetails.waiting },
    ACTIVA: { className: "bg-zinc-100 text-zinc-900 border-zinc-200 font-bold", label: t.dashboard.statusHealthy || "Active" },
    EXPIRADA: { className: "bg-red-950/20 text-red-400 border-red-900/30", label: "Expired" },
    SUSPENDIDA: { className: "bg-orange-950/20 text-orange-400 border-orange-900/30", label: t.licenseDetails.suspend },
    REVOCADA: { className: "bg-zinc-900 text-zinc-600 border-zinc-800", label: t.licenseDetails.revoke },
  };

  useEffect(() => {
    async function fetchClient() {
      const result = await getClientByIdAction(id);
      if (result.success && result.client) {
        const c = result.client as unknown as Client;
        setClient(c);
        setForm({
          nombre: c.nombre,
          email: c.email,
          empresa: c.empresa || "",
          telefono: c.telefono || "",
          direccion: c.direccion || "",
          notas: c.notas || "",
        });
      }
      setLoading(false);
    }
    fetchClient();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim()) {
      alert(t.clientDetails.validationFailed);
      return;
    }

    setSaving(true);
    const result = await updateClientAction(id, form);
    if (result.success) {
      alert(t.clientDetails.profileSynchronized);
    } else {
      alert(result.error);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const result = await deleteClientAction(id);
    if (result.success) {
      router.push("/clients");
    } else {
      alert(result.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Activity className="h-6 w-6 text-zinc-800 animate-pulse" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <Card className="max-w-md bg-zinc-900 border-white/5 p-8 text-center">
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-6">{t.clientDetails.entityNotFound}</p>
          <Button variant="outline" className="border-zinc-800" asChild>
            <Link href="/clients">{t.clientDetails.returnToRepository}</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Client Header Card */}
      <Card className="bg-zinc-900/40 border-white/5 shadow-2xl backdrop-blur-md overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-white/5 ring-8 ring-black/20">
                <AvatarFallback className="bg-zinc-800 text-zinc-100 text-2xl font-bold uppercase">
                  {client.nombre.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-white tracking-tight">{client.nombre}</h2>
                <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> {client.email}
                  </span>
                  {client.empresa && (
                    <span className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" /> {client.empresa}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-zinc-700 hover:text-red-400 hover:bg-red-950/10 h-10 px-4">
                  <Trash2 className="mr-2 h-4 w-4" /> {t.clientDetails.purgeEntity}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.clientDetails.purgeCorporateRecord}</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-500">
                    {t.clientDetails.purgeCorporateRecordDesc}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-800 border-none text-zinc-400">{t.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white font-bold hover:bg-red-500">
                    {t.clientDetails.purgeTerminal}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Detail Form */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-zinc-900/60 border-white/5 shadow-2xl backdrop-blur-md">
            <CardHeader className="border-b border-white/5 pb-6">
              <CardTitle className="text-zinc-100 flex items-center gap-3 text-base">
                <Users className="h-4 w-4 text-zinc-600" />
                {t.clientDetails.registryIntelligence}
              </CardTitle>
              <CardDescription className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">{t.clientDetails.synchronizeIdentity}</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest px-1">{t.clientDetails.fullEntityName}</Label>
                    <Input
                      id="nombre"
                      type="text"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="h-11 bg-zinc-950 border-white/5 text-zinc-100 focus-visible:ring-zinc-800 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest px-1">{t.clientDetails.emailEndpoint}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="h-11 bg-zinc-950 border-white/5 text-zinc-100 focus-visible:ring-zinc-800 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="empresa" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest px-1">{t.clientDetails.organization}</Label>
                    <Input
                      id="empresa"
                      type="text"
                      value={form.empresa}
                      onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                      className="h-11 bg-zinc-950 border-white/5 text-zinc-100 placeholder:text-zinc-800 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest px-1">{t.clientDetails.phoneAxis}</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      className="h-11 bg-zinc-950 border-white/5 text-zinc-100 placeholder:text-zinc-800 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest px-1">{t.clientDetails.physicalAddress}</Label>
                  <Input
                    id="direccion"
                    type="text"
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    className="h-11 bg-zinc-950 border-white/5 text-zinc-100 placeholder:text-zinc-800 transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest px-1">{t.clientDetails.supplementalIntelligence}</Label>
                  <Textarea
                    id="notas"
                    value={form.notas}
                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                    rows={4}
                    className="bg-zinc-950 border-white/5 text-zinc-100 placeholder:text-zinc-800 transition-all text-sm resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 bg-zinc-100 hover:bg-white text-zinc-950 font-bold transition-all duration-300 shadow-xl shadow-black/20"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" /> {t.clientDetails.synchronizeProfile}
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Sidebar */}
        <div className="space-y-8">
          <Card className="bg-zinc-900 shadow-2xl border-white/5 overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <CardTitle className="text-zinc-100 flex items-center gap-3 text-base">
                <Key className="h-4 w-4 text-zinc-500" />
                {t.clientDetails.allocatedAssets}
                <span className="ml-auto text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">{client.licencias.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {client.licencias.length === 0 ? (
                <div className="py-10 text-center bg-black/20 border border-dashed border-white/5 rounded-xl">
                  <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-[0.2em]">{t.clientDetails.noAssetsAllocated}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {client.licencias.map((lic) => (
                    <Link
                      key={lic.id}
                      href={`/licenses/${lic.id}`}
                      className="block p-4 bg-zinc-950 border border-white/5 rounded-xl group hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <code className="text-zinc-200 font-mono font-bold text-xs group-hover:text-white">
                          {lic.claveProducto}
                        </code>
                        <ChevronRight className="h-3 w-3 text-zinc-800 group-hover:text-zinc-300 transition-all" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-white/5 bg-zinc-900 text-[9px] font-bold uppercase tracking-tighter text-zinc-500">
                          {lic.tipo}
                        </Badge>
                        <Badge variant="outline" className={`text-[9px] uppercase tracking-widest border-none ${statusMap[lic.estado]?.className}`}>
                          {statusMap[lic.estado]?.label || lic.estado}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <Separator className="my-6 bg-white/5" />

              <Button variant="outline" className="w-full h-11 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white font-bold transition-all" asChild>
                <Link href="/licenses/new" className="flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> {t.clientDetails.provisionNewAsset}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-8 text-center space-y-2">
              <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.3em]">{t.clientDetails.corporateSince}</p>
              <div className="flex h-10 w-full items-center justify-center text-xs font-mono font-bold text-zinc-500 bg-black/40 border border-white/5 rounded-lg">
                {new Date(client.creadoEn).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </CardContent>
          </Card>

          <div className="p-8 border border-zinc-800 rounded-2xl bg-zinc-900/20 text-center">
            <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest mb-4">{t.clientDetails.operationsInterface}</p>
            <Separator className="bg-zinc-800 mb-6" />
            <Button variant="ghost" className="text-zinc-600 hover:text-zinc-300 font-bold text-[10px] uppercase tracking-[0.2em]" asChild>
              <Link href="/clients">{t.clientDetails.returnToRepository}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
}
