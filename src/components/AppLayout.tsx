import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const AppLayout = () => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sécurité pour éviter le flash blanc : on ne bloque pas le rendu, on laisse le CSS gérer
  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* SIDEBAR : Utilisation de classes CSS fixes pour éviter les sauts de rendu */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out no-print",
          isMobile 
            ? (mobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full w-72") 
            : (collapsed ? "w-20" : "w-72")
        )}
      >
        <AppSidebar 
          onCollapse={setCollapsed} 
          onMobileClose={() => setMobileMenuOpen(false)} 
          isMobile={isMobile} 
        />
      </aside>

      {/* OVERLAY MOBILE : Purement CSS pour la réactivité */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300 no-print"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT : Calcul des marges via CSS variable ou classes dynamiques sécurisées */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          !isMobile && (collapsed ? "pl-20" : "pl-72")
        )}
      >
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-30 no-print">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="lg:hidden hover:bg-primary/10"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <span className="font-black text-lg tracking-tighter text-primary lg:hidden uppercase">APRESS MALI</span>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
