import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo_apress.jpeg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      navigate("/dashboard");
    } else {
      toast({ title: "Erreur de connexion", description: "Email ou mot de passe incorrect", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(220_72%_40%),hsl(220_72%_20%))]" />
        <div className="relative z-10 text-center px-12">
          <img src={logo} alt="Apress Mali" className="h-24 w-24 mx-auto rounded-2xl mb-8 shadow-2xl" />
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Apress Trace Connect</h2>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            Plateforme ERP/CRM intégrée de gestion des clients, facturation et suivi des paiements.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center">
            <img src={logo} alt="Apress Mali" className="h-16 w-16 mx-auto rounded-xl mb-4" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Connexion</h1>
            <p className="text-muted-foreground mt-2">Accédez à votre espace de travail</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input id="email" type="email" placeholder="nom@apress-mali.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Se connecter</Button>
          </form>

          <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Comptes de démonstration :</p>
            <p>Superviseur : admin@apress-mali.com / admin123</p>
            <p>Employé : moussa@apress-mali.com / employe123</p>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            APRESS MALI SARL © 2026 – Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
