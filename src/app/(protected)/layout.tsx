import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <SidebarProvider className="bg-zinc-950">
      <AppSidebar user={session.user} />
      <SidebarInset className="bg-zinc-900/50 border border-white/5 overflow-hidden">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 bg-transparent backdrop-blur-xl px-6">
          <SidebarTrigger className="text-zinc-400 hover:text-white transition-colors" />
          <Separator orientation="vertical" className="h-6 bg-white/10" />
          <div className="flex-1" />
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
