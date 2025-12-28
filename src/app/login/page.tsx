"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Key, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please check your email and password.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An error occurred during sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-sans antialiased selection:bg-zinc-800 selection:text-zinc-100">
      {/* Muted background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)] pointer-events-none" />

      <div className="relative w-full max-w-[400px] space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-white/5 shadow-2xl">
            <Key className="h-6 w-6 text-zinc-100" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">License Manager</h1>
            <p className="text-sm text-zinc-500 font-medium">Enterprise Management Suite</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-white/5 bg-zinc-900/40 backdrop-blur-md shadow-[0_8px_32px_-16px_rgba(0,0,0,0.5)]">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-lg font-semibold text-zinc-100">Authentication</CardTitle>
            <CardDescription className="text-zinc-500 text-sm">
              Enter your corporate credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="border-red-900/50 bg-red-900/10 py-3">
                  <AlertDescription className="text-red-400 text-xs font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  required
                  className="h-11 bg-zinc-900/50 border-white/10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700/50 focus-visible:border-zinc-700 transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 bg-zinc-900/50 border-white/10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700/50 focus-visible:border-zinc-700 transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-zinc-100 hover:bg-white text-zinc-950 font-bold transition-all duration-300 shadow-lg shadow-black/20"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
            © 2025 License Manager • Operations Console
          </p>
        </footer>
      </div>
    </div>
  );
}
