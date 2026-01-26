/**
 * Main Layout component with navigation sidebar.
 * Pixel Pastel Theme - 8-bit retro style
 */
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Settings,
  LogOut,
  Gamepad2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./ThemeToggle";
import { PixelMascot } from "./PixelMascot";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { path: "/reports", label: "Reports", icon: PieChart },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar-background border-r-[3px] border-sidebar-border flex flex-col">
        {/* Logo */}
        <div className="p-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary border-[3px] border-border shadow-[3px_3px_0_0_hsl(var(--border))] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-['Press_Start_2P'] text-xs">FINANCE</span>
          </Link>
        </div>
        <Separator className="bg-sidebar-border h-[3px]" />

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground"
                    }`}
                    asChild
                  >
                    <Link to={item.path}>
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mascot */}
        <div className="px-4 py-2">
          <PixelMascot mood="idle" size="sm" />
        </div>

        <Separator className="bg-sidebar-border h-[3px]" />

        {/* User section */}
        <div className="p-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border-2 border-border">
              <AvatarFallback className="bg-secondary text-secondary-foreground font-['VT323'] text-lg">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{user?.email}</p>
            </div>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={logout}
              className="hover:text-destructive"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
