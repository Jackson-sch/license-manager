"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Loader2,
  UserPlus,
  ChevronRight,
  ArrowLeft,
  User,
  Mail,
  Building2,
  Phone,
  MapPin,
  ShieldCheck,
  Globe,
  Check,
} from "lucide-react";
import { createClientAction } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { useTranslation } from "@/hooks/use-translation";

export default function NewClientPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    empresa: "",
    telefono: "",
    direccion: "",
    notas: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email) {
      alert(t.newClient.registrationFailed);
      return;
    }

    setLoading(true);
    try {
      const result = await createClientAction(formData);
      if (result.success) {
        router.push("/clients");
      } else {
        alert(result.error || t.newClient.registrationFailed);
      }
    } catch {
      alert(t.newClient.registrationFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 shadow-2xl transition-transform hover:scale-105">
            <UserPlus className="h-7 w-7 text-zinc-100" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100">{t.newClient.title}</h2>
            <p className="text-zinc-500 font-medium">{t.newClient.subtitle}</p>
          </div>
        </div>
        <Button variant="outline" className="h-11 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all font-bold" asChild>
          <Link href="/clients" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t.newClient.returnToRepository}
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          {/* Identity Section */}
          <Card className="bg-zinc-900/40 border-white/5 shadow-2xl backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-zinc-100 uppercase tracking-widest">{t.newClient.identityDetails}</CardTitle>
              <CardDescription className="text-zinc-600 text-[10px] font-bold uppercase">{t.newClient.detailsDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{t.newClient.fullLegalName}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                    <Input
                      id="nombre"
                      placeholder="e.g. Alexander Pierce"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="h-11 pl-10 bg-zinc-950 border-white/5 text-zinc-100 placeholder:text-zinc-800 focus-visible:ring-zinc-800 focus-visible:border-zinc-800 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{t.newClient.officialEmail}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@entity.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-11 pl-10 bg-zinc-950 border-white/5 text-zinc-100 placeholder:text-zinc-800 focus-visible:ring-zinc-800 focus-visible:border-zinc-800 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="empresa" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{t.newClient.organization}</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                    <Input
                      id="empresa"
                      placeholder="Company Name"
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      className="h-11 pl-10 bg-zinc-950 border-white/5 text-zinc-100 placeholder:text-zinc-800 focus-visible:ring-zinc-800 focus-visible:border-zinc-800 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{t.newClient.phoneAxis}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                    <Input
                      id="telefono"
                      placeholder="+1 (555) 000-0000"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="h-11 pl-10 bg-zinc-950 border-white/5 text-zinc-100 placeholder:text-zinc-800 focus-visible:ring-zinc-800 focus-visible:border-zinc-800 transition-all"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Metadata */}
          <Card className="bg-zinc-900/40 border-white/5 shadow-2xl backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-zinc-100 uppercase tracking-widest">{t.newClient.corporateMetadata}</CardTitle>
              <CardDescription className="text-zinc-600 text-[10px] font-bold uppercase">{t.newClient.supplementalNotes}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="direccion" className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{t.newClient.physicalAddress}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-700" />
                  <Textarea
                    id="direccion"
                    placeholder="Physical deployment address"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="min-h-[100px] pl-10 pt-2.5 bg-zinc-950 border-white/5 text-zinc-100 placeholder:text-zinc-800 focus-visible:ring-zinc-800 focus-visible:border-zinc-800 transition-all"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <Card className="bg-zinc-950 border-white/5 shadow-2xl sticky top-8 overflow-hidden">
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-8 bg-zinc-100 rounded-full" />
                  <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-[0.3em]">{t.newClient.identityPrinciples}</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  {t.newClient.principlesDescription}
                </p>
              </div>

              <div className="space-y-4 px-1">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-zinc-500" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-1">{t.newClient.dataImmutability}</h4>
                    <p className="text-[10px] text-zinc-600 font-bold">{t.newClient.legalEntityCompliance}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                    <Globe className="h-4 w-4 text-zinc-500" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-1">{t.newClient.globalReachStandards}</h4>
                    <p className="text-[10px] text-zinc-600 font-bold">{t.newClient.registrationPolicy}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t.newClient.registrationPolicy}</p>
                    <p className="text-[10px] text-zinc-700 font-bold">{t.newClient.policyVersion}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-500 uppercase font-bold tracking-widest">v1.2.0</Badge>
                </div>
                <p className="text-[10px] text-zinc-700 font-bold italic mb-8 leading-relaxed">
                  {t.newClient.policyAcknowledge}
                </p>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm tracking-tight shadow-2xl shadow-black/40 transition-all duration-300 group"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      {t.newClient.commitRegistry}
                      <Check className="h-4 w-4 transition-transform group-hover:scale-125" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
            {/* Visual pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-100/[0.02] -rotate-45 translate-x-16 -translate-y-16 pointer-events-none" />
          </Card>
        </div>
      </form>
    </div>
  );
}
