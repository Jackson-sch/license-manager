"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, Scissors, Utensils, GraduationCap, ChevronRight, Activity, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type VerifyResult = {
  valid: boolean;
  error?: string;
  tipo?: string;
  producto?: string;
  features?: string[];
  maxUsuarios?: number;
  diasRestantes?: number;
};

export default function VerifyLicensePage() {
  const [key, setKey] = useState("");
  const [hardwareId, setHardwareId] = useState("");
  const [producto, setProducto] = useState("BARBERIA");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleVerify = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productKey: key,
          hardwareId: hardwareId || undefined,
          producto,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ valid: false, error: "Network communication failure" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="flex items-center gap-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 shadow-2xl transition-transform hover:scale-105">
          <ShieldCheck className="h-7 w-7 text-zinc-100" />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Verification Diagnostic</h2>
          <p className="text-zinc-500 font-medium">Debug and validate license verification handshakes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Form */}
          <Card className="bg-zinc-900/40 border-white/10 shadow-2xl backdrop-blur-md">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl mb-6">
                <ShieldCheck className="h-8 w-8 text-zinc-100" />
              </div>
              <CardTitle className="text-3xl font-black text-white tracking-tighter uppercase">Validation Axis</CardTitle>
              <CardDescription className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Professional Diagnostic Terminal</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">KEY IDENTITY</label>
                <Input
                  placeholder="ENTER LICENSE KEY..."
                  className="h-14 bg-zinc-950 border-white/10 text-xl font-mono text-white tracking-widest placeholder:text-zinc-800 focus-visible:ring-zinc-700 transition-all font-bold"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest px-1">Application Hub</Label>
                <Select value={producto} onValueChange={setProducto}>
                  <SelectTrigger className="h-11 bg-zinc-950 border-white/10 text-zinc-300">
                    <SelectValue placeholder="Target product" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectItem value="BARBERIA" className="focus:bg-zinc-800">
                      <span className="flex items-center gap-2">
                        <Scissors className="h-3.5 w-3.5 opacity-50" /> Barberia
                      </span>
                    </SelectItem>
                    <SelectItem value="RESTAURANTE" className="focus:bg-zinc-800">
                      <span className="flex items-center gap-2">
                        <Utensils className="h-3.5 w-3.5 opacity-50" /> Restaurante
                      </span>
                    </SelectItem>
                    <SelectItem value="ESCOLAR" className="focus:bg-zinc-800">
                      <span className="flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5 opacity-50" /> Escolar
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hwid" className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest px-1">Hardware ID Signature</Label>
                <Input
                  id="hwid"
                  value={hardwareId}
                  onChange={(e) => setHardwareId(e.target.value)}
                  placeholder="Device simulation ID"
                  className="h-11 bg-zinc-950 border-white/10 text-zinc-100 placeholder:text-zinc-700 focus-visible:ring-zinc-800 transition-all text-sm"
                />
              </div>

              <Button
                onClick={handleVerify}
                disabled={loading || !key}
                className="w-full h-12 bg-zinc-100 hover:bg-white text-zinc-950 font-bold transition-all duration-300 shadow-xl shadow-black/20"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]">
                    Init Verification <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/10 space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-zinc-700" />
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Diagnostic Protocol</p>
            </div>
            <p className="text-[10px] text-zinc-600 leading-relaxed font-medium italic">
              This tool performs a live POST request to /api/verify using the provided metadata. It bypasses frontend caches to provide real-time backend state.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {/* Result Section */}
          {!result ? (
            <div className="h-full min-h-[400px] border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-12 text-center gap-4 bg-zinc-900/20">
              <Terminal className="h-12 w-12 text-zinc-900" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-700 uppercase tracking-widest">Awaiting Handshake</p>
                <p className="text-xs text-zinc-800 font-medium">Results will be rendered after verification execution</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className={`border-none shadow-2xl overflow-hidden ${result.valid ? 'bg-zinc-100 text-zinc-950' : 'bg-red-600 text-white'}`}>
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {result.valid ? <CheckCircle2 className="h-8 w-8 text-zinc-950" /> : <AlertCircle className="h-8 w-8 text-white" />}
                        <h3 className="text-4xl font-extrabold tracking-tighter uppercase transition-all">
                          {result.valid ? "Verified" : "Rejected"}
                        </h3>
                      </div>
                      <p className={`text-xs font-bold uppercase tracking-widest opacity-60`}>
                        {result.valid ? "Handshake Successful" : "Validation Protocol Failed"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Result ID</p>
                      <p className="text-sm font-mono font-bold">#SIM-{Math.floor(Math.random() * 90000 + 10000)}</p>
                    </div>
                  </div>

                  {!result.valid && result.error && (
                    <div className="mt-8 p-4 bg-black/20 rounded-xl border border-white/5">
                      <p className="text-sm font-bold tracking-tight">{result.error}</p>
                    </div>
                  )}

                  {result.valid && (
                    <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">PRODUCT IDENTITY</p>
                        <p className="text-lg font-black text-white mt-1 uppercase tracking-tight">{result.producto}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">LICENSE CLASS</p>
                        <p className="text-lg font-black text-white mt-1 uppercase tracking-tight">{result.tipo}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Capacity</p>
                        <p className="text-lg font-bold tracking-tight">{result.maxUsuarios} Usr</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Remains</p>
                        <p className="text-lg font-bold tracking-tight">{result.diasRestantes} Days</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-white/5 shadow-2xl">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-[10px] font-bold uppercase text-zinc-500 tracking-[0.3em]">Raw API Response</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="bg-black/60 rounded-xl p-6 font-mono text-[11px] leading-relaxed text-zinc-400 overflow-x-auto border border-white/5">
                    <pre className="w-full">{JSON.stringify(result, null, 4)}</pre>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button variant="ghost" className="text-zinc-600 hover:text-zinc-300 font-bold text-[10px] uppercase tracking-widest" onClick={() => setResult(null)}>
                  Clear Results
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
