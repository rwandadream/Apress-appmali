import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo_apress.jpeg";
import { Loader2, ShieldCheck, ArrowRight, Lock, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirection si déjà connecté
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        toast({ 
          title: "Accès Autorisé", 
          description: "Bienvenue sur Apress Trace Connect." 
        });
        navigate("/dashboard");
      } else {
        toast({ 
          title: "Erreur d'authentification", 
          description: "Email ou mot de passe invalide.", 
          variant: "destructive" 
        });
        setIsLoading(false);
      }
    }, 1000);
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-slate-900 overflow-hidden">
      {/* Image de fond avec overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')" 
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-900" />

      <div className="w-full max-w-[440px] px-6 relative z-10 animate-fade-in">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-3 shadow-2xl mb-6 flex items-center justify-center border-4 border-white/10 animate-float overflow-hidden">
            <img 
              src={logo} 
              alt="Apress Mali" 
              className="w-full h-full object-contain transform scale-110" 
            />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter text-center">Apress <span className="text-primary">Trace Connect</span></h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 animate-pulse-slow">Portail Professionnel Sécurisé</p>
        </div>

        <Card className="glass-morphism rounded-[32px] overflow-hidden border-white/10">
          <CardContent className="p-8 md:p-10 space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2 ml-1">
                  <Mail className="h-3 w-3" /> Identifiant
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nom@apress-mali.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                    <Lock className="h-3 w-3" /> Mot de passe
                  </Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary/20 transition-all"
                />
              </div>

              <Button 
                type="submit" 
                disabled={!isFormValid || isLoading}
                className="w-full h-12 rounded-xl font-black text-base shadow-xl bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] mt-4"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Se Connecter"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Session Sécurisée SSL</span>
          </div>
          <p className="text-[9px] text-slate-500 font-bold text-center uppercase tracking-wider opacity-60">
            © 2026 APRESS MALI S.A.R.L - TOUS DROITS RÉSERVÉS
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
