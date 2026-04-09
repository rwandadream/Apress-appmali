import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type UserRole = "superviseur" | "employee";

export interface AppUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isSuperviseur: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  users: AppUser[];
  addUser: (user: Omit<AppUser, "id">) => void;
  deleteUser: (id: string) => void;
  activityLog: ActivityEntry[];
  logActivity: (action: string, details: string) => void;
}

export interface ActivityEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

const defaultUsers: AppUser[] = [
  { id: "1", nom: "Admin", prenom: "APRESS", email: "admin@apress-mali.com", role: "superviseur" },
  { id: "2", nom: "Diarra", prenom: "Moussa", email: "moussa@apress-mali.com", role: "employee" },
  { id: "3", nom: "Sangaré", prenom: "Awa", email: "awa@apress-mali.com", role: "employee" },
];

// Demo passwords: admin@apress-mali.com / admin123, others / employe123
const passwords: Record<string, string> = {
  "admin@apress-mali.com": "admin123",
  "moussa@apress-mali.com": "employe123",
  "awa@apress-mali.com": "employe123",
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    const savedUser = localStorage.getItem("apress_auth_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [users, setUsers] = useState<AppUser[]>(defaultUsers);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);

  const logActivity = useCallback((action: string, details: string) => {
    if (!user) return;
    setActivityLog((prev) => [
      {
        id: crypto.randomUUID(),
        userId: user.id,
        userName: `${user.prenom} ${user.nom}`,
        action,
        details,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, [user]);

  const login = (email: string, password: string): boolean => {
    const found = users.find((u) => u.email === email);
    if (!found) return false;
    if (passwords[email] !== password) return false;
    setUser(found);
    localStorage.setItem("apress_auth_user", JSON.stringify(found));
    setActivityLog((prev) => [
      {
        id: crypto.randomUUID(),
        userId: found.id,
        userName: `${found.prenom} ${found.nom}`,
        action: "Connexion",
        details: "L'utilisateur s'est connecté",
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
    return true;
  };

  const logout = () => {
    if (user) {
      setActivityLog((prev) => [
        {
          id: crypto.randomUUID(),
          userId: user.id,
          userName: `${user.prenom} ${user.nom}`,
          action: "Déconnexion",
          details: "L'utilisateur s'est déconnecté",
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setUser(null);
    localStorage.removeItem("apress_auth_user");
  };

  const addUser = (newUser: Omit<AppUser, "id">) => {
    const created: AppUser = { ...newUser, id: crypto.randomUUID() };
    setUsers((prev) => [...prev, created]);
    passwords[created.email] = "employe123";
    logActivity("Création utilisateur", `Compte créé pour ${newUser.prenom} ${newUser.nom} (${newUser.role})`);
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target || target.id === user?.id) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logActivity("Suppression utilisateur", `Compte supprimé: ${target.prenom} ${target.nom}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isSuperviseur: user?.role === "superviseur",
        login,
        logout,
        users,
        addUser,
        deleteUser,
        activityLog,
        logActivity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
