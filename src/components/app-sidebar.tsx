"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Key,
  Users,
  LayoutDashboard,
  FileKey,
  ShieldCheck,
  UserPlus,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Mail,
  Database,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { signOut } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useTranslation } from "@/hooks/use-translation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Globe } from "lucide-react";

interface AppSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const { t, language, setLanguage } = useTranslation();

  const navigation = [
    {
      title: t.sidebar.dashboard,
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: t.sidebar.licenses,
      icon: Key,
      items: [
        { title: t.sidebar.allLicenses, url: "/licenses" },
        { title: t.sidebar.newLicense, url: "/licenses/new" },
      ],
    },
    {
      title: t.sidebar.clients,
      icon: Users,
      items: [
        { title: t.sidebar.allClients, url: "/clients" },
        { title: t.sidebar.newClient, url: "/clients/new" },
      ],
    },
  ];

  const userInitials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "AD";

  return (
    <Sidebar variant="inset" className="border-transparent bg-zinc-950">
      <SidebarHeader className="h-16 border-none px-6 flex justify-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white group-hover:scale-105 transition-transform">
            <Key className="h-4.5 w-4.5 text-zinc-950" />
          </div>
          <h1 className="text-base font-bold text-white tracking-tight">License Manager</h1>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 gap-4">

        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible
                      asChild
                      defaultOpen={item.items.some((sub) => pathname === sub.url)}
                      className="group/collapsible"
                    >
                      <div>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="w-full justify-between h-9 px-3 hover:bg-white/5 hover:text-white transition-colors data-[active=true]:text-white font-medium"
                            isActive={item.items.some((sub) => pathname === sub.url)}
                          >
                            <span className="flex items-center gap-3 text-sm">
                              <item.icon className={`h-4.5 w-4.5 transition-colors ${item.items.some((sub) => pathname === sub.url) ? "text-white" : "text-zinc-400 group-hover/menu-item:text-white"}`} />
                              {item.title}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 text-zinc-600 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="border-none ml-4 mt-0.5 gap-0.5">
                            {item.items.map((sub) => (
                              <SidebarMenuSubItem key={sub.url}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === sub.url}
                                  className="h-8 px-3 text-zinc-500 hover:text-white hover:bg-white/5 data-[active=true]:text-white data-[active=true]:bg-white/5 transition-all rounded-md"
                                >
                                  <Link href={sub.url}>{sub.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className="h-9 px-3 hover:bg-white/5 hover:text-white data-[active=true]:bg-white/5 data-[active=true]:text-white transition-colors font-medium"
                    >
                      <Link href={item.url} className="flex items-center gap-3 text-sm">
                        <item.icon className={`h-4.5 w-4.5 transition-colors ${pathname === item.url ? "text-white" : "text-zinc-400 group-hover/menu-item:text-white"}`} />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="text-zinc-500 text-xs font-medium px-3 mb-2">
            {t.sidebar.documents}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem className="group/action">
                <SidebarMenuButton asChild className="h-9 px-3 hover:bg-white/5 hover:text-white transition-colors">
                  <Link href="/licenses" className="flex items-center gap-3 text-sm font-medium">
                    <Database className="h-4.5 w-4.5 text-zinc-400 transition-colors group-hover/action:text-white" />
                    {t.sidebar.dataLibrary}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="group/action">
                <SidebarMenuButton asChild className="h-9 px-3 hover:bg-white/5 hover:text-white transition-colors">
                  <Link href="/licenses/verify" className="flex items-center gap-3 text-sm font-medium">
                    <ShieldCheck className="h-4.5 w-4.5 text-zinc-400 transition-colors group-hover/action:text-white" />
                    {t.sidebar.verification}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-none p-4 px-6 gap-4">
        <div className="px-1">
          <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
            <SelectTrigger className="h-10 bg-white/5 border-white/10 text-zinc-400 focus:ring-0 focus:ring-offset-0 gap-2 px-3 rounded-xl hover:bg-white/10 hover:text-white transition-all">
              <Globe className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
              <SelectItem value="en">English (US)</SelectItem>
              <SelectItem value="es">Español (ES)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl hover:bg-white/5 transition-colors group p-1">
              <Avatar className="h-8 w-8 border border-white/10 ring-0 group-hover:border-white/20 transition-colors">
                <AvatarFallback className="bg-zinc-800 text-zinc-300 text-[10px] font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-xs font-bold text-white tracking-tight">{user?.name || "Admin"}</p>
                <p className="text-[10px] text-zinc-500 font-medium truncate">{user?.email}</p>
              </div>
              <ChevronDown className="h-3 w-3 text-zinc-600 transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56 bg-zinc-900 border-zinc-800 p-1">
            <DropdownMenuItem disabled className="text-zinc-500 gap-2">
              <Settings className="h-4 w-4" />
              {t.sidebar.settings}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer gap-2"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              {t.sidebar.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
