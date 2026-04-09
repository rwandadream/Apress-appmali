import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";

const AppLayout = () => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when switching to desktop or when navigation occurs
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-x-hidden">
      {/* Sidebar for Desktop & Mobile Overlay */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform ${
          isMobile 
            ? (mobileMenuOpen ? "translate-x-0 w-[280px]" : "-translate-x-full w-[280px]") 
            : (collapsed ? "translate-x-0 w-20" : "translate-x-0 w-72")
        }`}
      >
        <AppSidebar 
          onCollapse={setCollapsed} 
          onMobileClose={() => setMobileMenuOpen(false)} 
          isMobile={isMobile} 
        />
      </div>

      {/* Mobile Overlay Background */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 w-full min-w-0 ${
          isMobile ? "pl-0" : (collapsed ? "pl-20" : "pl-72")
        }`}
      >
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="lg:hidden">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
            <span className="font-black text-lg tracking-tighter text-primary lg:hidden uppercase">APRESS MALI</span>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 lg:p-8 w-full max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
