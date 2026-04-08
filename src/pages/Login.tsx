import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo_apress.jpeg";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Auto-focus sur l'email au chargement
  useEffect(() => {
    const emailInput = document.getElementById("email");
    if (emailInput) emailInput.focus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulation d'un léger délai pour le côté "SaaS" (UX)
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        toast({ 
          title: "Connexion réussie", 
          description: "Bienvenue sur votre espace de gestion." 
        });
        navigate("/dashboard");
      } else {
        toast({ 
          title: "Échec de connexion", 
          description: "Vos identifiants sont incorrects.", 
          variant: "destructive" 
        });
        setIsLoading(false);
      }
    }, 800);
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfd] p-6">
      {/* Background subtil */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-[400px] z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
        {/* Header - Logo & Titre */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 overflow-hidden">
            <img src={logo} alt="Apress Mali" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-[28px] font-black tracking-tight text-slate-900 mb-2">Connexion</h1>
          <p className="text-slate-500 font-medium text-center">
            Accédez à votre espace de travail Apress
          </p>
        </div>

        {/* Carte de Connexion */}
        <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                Adresse Email
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nom@apress-mali.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/10 transition-all bg-slate-50/30"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Mot de passe
                </Label>
                <button type="button" className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors">
                  Oublié ?
                </button>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/10 transition-all bg-slate-50/30"
              />
            </div>

            <Button 
              type="submit" 
              disabled={!isFormValid || isLoading}
              className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/10 transition-all active:scale-[0.98] gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Se connecter <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer discret */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5" />
            Connexion sécurisée SSL
          </div>
          <p className="text-[11px] text-slate-400 font-medium italic">
            APRESS MALI SARL © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
