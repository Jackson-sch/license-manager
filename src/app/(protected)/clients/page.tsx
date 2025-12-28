"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Mail, Building2, Key, Users, ChevronRight, Activity } from "lucide-react";
import { getClientsAction } from "@/app/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Client = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  empresa: string | null;
  _count: { licencias: number };
  creadoEn: string;
};

import { useTranslation } from "@/hooks/use-translation";

export default function ClientsPage() {
  const { t, language } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadClients = useCallback(async () => {
    setLoading(true);
    const result = await getClientsAction({ search: search || undefined });
    if (result.success && result.clients) {
      setClients(result.clients as Client[]);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">{t.clients.title}</h2>
          <p className="text-zinc-400 font-medium">{t.clients.subtitle}</p>
        </div>
        <Button asChild className="bg-zinc-100 hover:bg-white text-zinc-900 font-bold h-11 px-6 shadow-xl shadow-black/20">
          <Link href="/clients/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t.clients.addClient}
          </Link>
        </Button>
      </div>

      {/* Search & Filter Section */}
      <Card className="bg-zinc-900/40 border-white/5 shadow-2xl backdrop-blur-md">
        <CardContent className="p-4 md:p-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder={t.clients.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10 bg-zinc-950 border-white/5 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-800 focus-visible:border-zinc-800 transition-all"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="bg-zinc-900/40 border-white/5 shadow-2xl backdrop-blur-md overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest h-12">{t.clients.name}</TableHead>
                <TableHead className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest h-12">{t.clients.email}</TableHead>
                <TableHead className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest h-12">{t.clients.company}</TableHead>
                <TableHead className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest h-12">{t.clients.licenses}</TableHead>
                <TableHead className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest h-12">{t.clients.joined}</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-6 text-right">{t.clients.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center py-20 text-zinc-600">
                    <div className="flex flex-col items-center gap-2">
                      <Activity className="h-6 w-6 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-widest">{t.common.loading}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center py-20 text-zinc-600">
                    <p className="text-xs font-bold uppercase tracking-widest">{t.common.noData}</p>
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} className="border-white/5 group hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-white/5 ring-4 ring-black/20">
                          <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs font-bold uppercase">
                            {client.nombre.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-zinc-100">{client.nombre}</p>
                          {client.telefono && (
                            <p className="text-[10px] text-zinc-600 font-bold tracking-tight">{client.telefono}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-bold text-zinc-400 tracking-tight">{client.email}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-zinc-500 opacity-50" />
                        <span className="text-sm font-bold text-zinc-400">{client.empresa || t.clients.individualEntity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-zinc-300 text-[10px] font-bold px-2 py-0.5">
                        <Key className="mr-1.5 h-3 w-3 text-zinc-600" />
                        {client._count.licencias}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-500 text-[10px] font-bold uppercase">
                      {new Date(client.creadoEn).toLocaleDateString(language === "en" ? "en-US" : "es-ES", { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-700 hover:text-white hover:bg-zinc-800 transition-colors" asChild>
                        <Link href={`/clients/${client.id}`}>
                          <ChevronRight className="h-4 w-4" />
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

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-950 border-white/5 border-dashed">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{t.dashboard.totalClients}</p>
              <p className="text-2xl font-bold text-zinc-400">{clients.length}</p>
            </div>
            <Users className="h-8 w-8 text-zinc-900" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
