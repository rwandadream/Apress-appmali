import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, CreditCard, Settings, LogOut,
  ChevronLeft, ChevronRight, Briefcase, UserCog, Activity, BarChart3, X
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo_apress.jpeg";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  onCollapse?: (collapsed: boolean) => void;
  onMobileClose?: () => void;
  isMobile?: boolean;
}

const AppSidebar = ({ onCollapse, onMobileClose, isMobile }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSuperviseur, logout } = useAuth();

  const toggleCollapse = () => {
    const nextCollapsed = !collapsed;
    setCollapsed(nextCollapsed);
    if (onCollapse) onCollapse(nextCollapsed);
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/reports", icon: BarChart3, label: "Rapports" },
    { to: "/clients", icon: Users, label: "Clients" },
    { to: "/services", icon: Briefcase, label: "Services" },
    { to: "/invoices", icon: FileText, label: "Factures" },
    { to: "/payments", icon: CreditCard, label: "Paiements" },
  ];

  const handleLinkClick = () => {
    if (isMobile && onMobileClose) onMobileClose();
  };

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      {/* Header Sidebar */}
      <div className="flex items-center gap-3 px-6 py-8 border-b border-sidebar-border/50">
        <div className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
          <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="flex flex-col overflow-hidden animate-in fade-in duration-500">
            <span className="font-black text-sm tracking-tighter uppercase leading-none">Apress Mali</span>
            <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest mt-1">Trace Connect</span>
          </div>
        )}
        {isMobile && (
          <button onClick={onMobileClose} className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User Info */}
      {(!collapsed || isMobile) && user && (
        <div className="px-6 py-4 border-b border-sidebar-border/30 bg-sidebar-foreground/5">
          <p className="text-xs font-black uppercase truncate">{user.prenom} {user.nom}</p>
          <p className="text-[9px] opacity-50 font-bold uppercase tracking-wider">{user.role}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-sidebar-foreground/40 group-hover:text-primary")} />
              {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}

        {isSuperviseur && (
          <div className="pt-6">
            {(!collapsed || isMobile) && <p className="px-4 text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mb-2">Administration</p>}
            {[
              { to: "/users", icon: UserCog, label: "Utilisateurs" },
              { to: "/activity", icon: Activity, label: "Journal" }
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group",
                  location.pathname === item.to ? "bg-primary text-white shadow-md" : "text-sidebar-foreground/60 hover:bg-white/5"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-sidebar-border/30 space-y-1">
        <NavLink to="/settings" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors">
          <Settings className="h-5 w-5 shrink-0" />
          {(!collapsed || isMobile) && <span>Paramètres</span>}
        </NavLink>
        <button 
          onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-destructive/70 hover:bg-destructive/10 hover:text-destructive w-full transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {(!collapsed || isMobile) && <span>Quitter</span>}
        </button>

        {!isMobile && (
          <button 
            onClick={toggleCollapse}
            className="w-full flex justify-center mt-4 p-2 opacity-20 hover:opacity-100 transition-opacity"
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        )}
      </div>
    </div>
  );
};

export default AppSidebar;
