import Link from "next/link";
import {
  Key, Users, Plus, AlertCircle,
  Scissors, Utensils, GraduationCap,
  Activity, Clock, DollarSign, ArrowUpRight
} from "lucide-react";
import { getDashboardStatsAction } from "@/app/actions/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { cookies } from "next/headers";
import { getTranslations } from "@/lib/i18n";

export default async function Home() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value as "en" | "es") || "es";
  const { dashboard: t } = getTranslations(lang);

  const { stats } = await getDashboardStatsAction();

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">{t.overview}</h2>
          <p className="text-zinc-400 font-medium">{t.metrics}</p>
        </div>
        <Button asChild className="bg-zinc-100 hover:bg-white text-zinc-900 font-bold h-11 px-6 shadow-xl shadow-black/20">
          <Link href="/licenses/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Licencia
          </Link>
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t.activeKeys, value: stats?.licenciasActivas, sub: t.running, icon: Activity },
          { label: t.totalClients, value: stats?.totalClientes, sub: t.registered, icon: Users },
          { label: t.expiringSoon, value: stats?.porVencer, sub: t.window, icon: Clock },
          { label: t.monthlyRevenue, value: `S/ ${stats?.ingresosMes?.toFixed(0) || 0}`, sub: t.currentMonth, icon: DollarSign },
        ].map((item, i) => (
          <Card key={i} className="bg-zinc-900/40 border-white/5 shadow-2xl backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                {item.label}
              </CardTitle>
              <item.icon className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-zinc-100">{item.value}</div>
              <p className="text-xs text-zinc-400 font-medium mt-1">{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Product Distribution */}
        <Card className="lg:col-span-2 bg-zinc-900/40 border-white/5 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-zinc-100">{t.distribution}</CardTitle>
                <CardDescription className="text-zinc-400">{t.distributionSubtitle}</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-zinc-500" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {[
                { name: "Barberia System", count: stats?.productos?.BARBERIA, icon: Scissors },
                { name: "Restaurante System", count: stats?.productos?.RESTAURANTE, icon: Utensils },
                { name: "Escolar System", count: stats?.productos?.ESCOLAR, icon: GraduationCap },
              ].map((prod, i) => (
                <div key={i} className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 border border-white/5 transition-transform group-hover:scale-105">
                      <prod.icon className="h-6 w-6 text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-100">{prod.name}</p>
                      <p className="text-xs text-zinc-400 font-medium">Enterprise Suite</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-zinc-100">{prod.count || 0}</p>
                      <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Licenses</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Informational Panel */}
        <div className="space-y-6">
          <Card className="bg-zinc-100 border-none shadow-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-zinc-900 flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                {t.status}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-1">
                <p className="text-3xl font-extrabold text-zinc-950 tracking-tight">{t.statusHealthy}</p>
                <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">{t.statusSubtitle}</p>
              </div>
              <div className="pt-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  <span>Licensing Cloud</span>
                  <span>99.9%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-950 w-[99.9%]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning Banner as refined notification */}
          {(stats?.porVencer ?? 0) > 0 && (
            <Card className="border-zinc-800 bg-zinc-900/60 shadow-2xl">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 border border-white/5">
                      <Clock className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-100 text-sm">{t.notice}</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                        {stats?.porVencer} {t.atRisk}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white mt-2" asChild>
                    <Link href="/licenses?filter=expiring">{t.viewDetails}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-6 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Key className="h-8 w-8 text-zinc-800" />
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em]">{t.operationalConsole}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
