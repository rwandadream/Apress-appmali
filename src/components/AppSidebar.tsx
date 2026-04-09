import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, FileText, CreditCard, Settings, LogOut,
  ChevronLeft, ChevronRight, Briefcase, UserCog, Activity, BarChart3
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo_apress.jpeg";

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

  const handleLinkClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/reports", icon: BarChart3, label: "Rapports" },
    { to: "/clients", icon: Users, label: "Clients" },
    { to: "/services", icon: Briefcase, label: "Services" },
    { to: "/invoices", icon: FileText, label: "Factures" },
    { to: "/payments", icon: CreditCard, label: "Paiements" },
  ];

  const adminItems = [
    { to: "/users", icon: UserCog, label: "Utilisateurs" },
    { to: "/activity", icon: Activity, label: "Journal d'activité" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={`h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 relative ${collapsed && !isMobile ? "w-20" : "w-72"}`}>
      <div className="flex items-center gap-3 px-6 py-8 border-b border-sidebar-border/50">
        <div className="h-12 w-12 rounded-xl bg-white p-1 shadow-inner flex items-center justify-center shrink-0">
          <img src={logo} alt="Apress Mali" className="h-10 w-10 object-contain" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-black text-base tracking-tighter text-sidebar-foreground uppercase leading-none">Apress Mali</span>
            <span className="text-[10px] text-sidebar-foreground/40 font-bold uppercase tracking-widest mt-1">Trace Connect</span>
          </div>
        )}
        {isMobile && (
          <button onClick={onMobileClose} className="ml-auto p-2 hover:bg-white/10 rounded-lg lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {(!collapsed || isMobile) && user && (
        <div className="px-6 py-4 border-b border-sidebar-border/30 bg-sidebar-foreground/5">
          <p className="text-xs font-black text-sidebar-foreground uppercase tracking-tight">{user.prenom} {user.nom}</p>
          <p className="text-[10px] text-sidebar-foreground/50 font-bold uppercase tracking-widest mt-0.5">{user.role}</p>
        </div>
      )}

      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group hover:translate-x-1 ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                    : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${isActive ? "text-white" : "text-sidebar-foreground/40 group-hover:text-primary"}`} />
                {(!collapsed || isMobile) && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {isSuperviseur && (
          <div className="pt-6 space-y-1">
            {(!collapsed || isMobile) && <p className="px-4 text-[10px] font-black text-sidebar-foreground/30 uppercase tracking-[0.2em] mb-2">Administration</p>}
            {adminItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                      : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : "text-sidebar-foreground/40 group-hover:text-primary"}`} />
                  {(!collapsed || isMobile) && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      <div className="px-3 pb-6 space-y-1 border-t border-sidebar-border/30 pt-6">
        <NavLink
          to="/settings"
          onClick={handleLinkClick}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            location.pathname === "/settings"
              ? "bg-primary text-white shadow-lg"
              : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Paramètres</span>}
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-destructive/60 hover:bg-destructive/10 hover:text-destructive w-full transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          {(!collapsed || isMobile) && <span>Déconnexion</span>}
        </button>

        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className="flex items-center justify-center p-2 rounded-full bg-white/5 text-sidebar-foreground/40 hover:bg-white/10 hover:text-white transition-all mt-4 w-10 mx-auto"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
