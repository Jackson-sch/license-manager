"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Key, Loader2, Copy, Check, Scissors, Utensils, GraduationCap, ShieldPlus, ChevronRight } from "lucide-react";
import { createLicenseAction } from "@/app/actions/licenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/use-translation";

type TipoLicencia = "TRIAL" | "BASICO" | "PROFESIONAL" | "ENTERPRISE";
type Producto = "BARBERIA" | "RESTAURANTE" | "ESCOLAR";

export default function NewLicensePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState<TipoLicencia>("PROFESIONAL");
  const [producto, setProducto] = useState<Producto>("BARBERIA");
  const [cliente, setCliente] = useState({ nombre: "", email: "", empresa: "" });
  const [result, setResult] = useState<{ clave: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const TIPOS: { value: TipoLicencia; label: string; precio: string; descripcion: string }[] = [
    { value: "TRIAL", label: t.tiers.trial, precio: t.tiers.free, descripcion: t.tiers.trialDesc },
    { value: "BASICO", label: t.tiers.basico, precio: "S/ 199", descripcion: t.tiers.basicoDesc },
    { value: "PROFESIONAL", label: t.tiers.profesional, precio: "S/ 499", descripcion: t.tiers.profesionalDesc },
    { value: "ENTERPRISE", label: t.tiers.enterprise, precio: "S/ 999", descripcion: t.tiers.enterpriseDesc },
  ];

  const PRODUCTOS: { value: Producto; label: string; icon: typeof Scissors }[] = [
    { value: "BARBERIA", label: t.products.barberia, icon: Scissors },
    { value: "RESTAURANTE", label: t.products.restaurante, icon: Utensils },
    { value: "ESCOLAR", label: t.products.escolar, icon: GraduationCap },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await createLicenseAction({ tipo, producto, cliente });
      if (data.success && data.license) {
        setResult({ clave: data.license.claveProducto });
      } else {
        alert(data.error || t.newLicense.generationFailure);
      }
    } catch {
      alert(t.newLicense.networkError);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.clave);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (result) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-zinc-900 border-white/5 shadow-2xl overflow-hidden p-1">
          <div className="bg-zinc-900 px-6 pt-10 pb-6 text-center">
            <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Check className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white tracking-tight">{t.newLicense.keyIssuedTitle}</CardTitle>
            <CardDescription className="text-zinc-500 mt-2 font-medium">
              {t.newLicense.provisionedFor} {PRODUCTOS.find(p => p.value === producto)?.label}
            </CardDescription>
          </div>

          <CardContent className="space-y-8 p-6">
            <div className="bg-black/40 border border-white/5 rounded-xl p-6 text-center select-all group cursor-copy active:scale-[0.98] transition-all" onClick={handleCopy}>
              <code className="text-xl font-mono font-bold text-zinc-300 tracking-[0.2em]">
                {result.clave}
              </code>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-4 group-hover:text-zinc-400 transition-colors">
                {copied ? t.newLicense.copiedToClipboard : t.newLicense.clickToCopy}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-11 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all font-bold"
                onClick={() => {
                  setResult(null);
                  setCliente({ nombre: "", email: "", empresa: "" });
                }}
              >
                {t.newLicense.provisionAnother}
              </Button>
              <Button variant="ghost" className="w-full text-zinc-600 hover:text-zinc-300 transition-colors font-bold text-xs uppercase tracking-widest" asChild>
                <Link href="/licenses">{t.newLicense.reviewAll}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex items-center gap-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 shadow-2xl transition-transform hover:scale-105">
          <ShieldPlus className="h-7 w-7 text-zinc-100" />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">{t.newLicense.title}</h2>
          <p className="text-zinc-500 font-medium">{t.newLicense.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-8">
          {/* Product Selection */}
          <section className="space-y-4">
            <div className="space-y-1 px-1">
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest">{t.newLicense.selectProductLine}</h3>
              <p className="text-xs text-zinc-600">{t.newLicense.productDescription}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRODUCTOS.map((p) => {
                const Icon = p.icon;
                const isSelected = producto === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => setProducto(p.value)}
                    className={`p-4 rounded-xl border text-left transition-all group flex flex-col gap-3 ${isSelected
                      ? "bg-zinc-100 border-white text-zinc-950 shadow-2xl"
                      : "bg-zinc-900/40 border-white/5 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                      }`}
                  >
                    <Icon className={`w-5 h-5 transition-colors ${isSelected ? "text-zinc-950" : "text-zinc-700 group-hover:text-zinc-400"}`} />
                    <span className="text-xs font-bold uppercase tracking-tight">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* License Type */}
          <section className="space-y-4">
            <div className="space-y-1 px-1">
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest">{t.newLicense.subscriptionTier}</h3>
              <p className="text-xs text-zinc-600">{t.newLicense.tierDescription}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TIPOS.map((t_tier) => (
                <button
                  key={t_tier.value}
                  onClick={() => setTipo(t_tier.value)}
                  className={`p-5 rounded-xl border text-left transition-all group ${tipo === t_tier.value
                    ? "bg-zinc-900 border-white/20 shadow-2xl"
                    : "bg-zinc-900/40 border-white/5 hover:border-zinc-800"
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-bold tracking-tight ${tipo === t_tier.value ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"}`}>{t_tier.label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tipo === t_tier.value ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-500"}`}>{t_tier.precio}</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">{t_tier.descripcion}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Client Data */}
          <Card className="bg-zinc-900/40 border-white/5 shadow-2xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-zinc-100 uppercase tracking-widest">{t.newLicense.clientEntity}</CardTitle>
              <CardDescription className="text-zinc-600 text-[10px] font-bold uppercase">{t.newLicense.optionalMetadata}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{t.newLicense.fullName}</Label>
                <Input
                  id="nombre"
                  placeholder="Legal name"
                  value={cliente.nombre}
                  onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                  className="h-10 bg-zinc-950 border-white/5 text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-zinc-800 focus-visible:border-zinc-800 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{t.newLicense.emailEndpoint}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="entity@business.com"
                  value={cliente.email}
                  onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                  className="h-10 bg-zinc-950 border-white/5 text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-zinc-800 focus-visible:border-zinc-800 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empresa" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{t.newLicense.organization}</Label>
                <Input
                  id="empresa"
                  placeholder="Company name"
                  value={cliente.empresa}
                  onChange={(e) => setCliente({ ...cliente, empresa: e.target.value })}
                  className="h-10 bg-zinc-950 border-white/5 text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-zinc-800 focus-visible:border-zinc-800 transition-all text-sm"
                />
              </div>

              <Separator className="bg-white/5 my-2" />

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full h-12 bg-zinc-100 hover:bg-white text-zinc-950 font-bold transition-all duration-300 shadow-xl shadow-black/20"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    {t.newLicense.provisionKey} <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="p-6 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center text-center gap-3">
            <Key className="h-5 w-5 text-zinc-800" />
            <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em] leading-relaxed">
              {t.newLicense.immutableNotice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
}
