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

  // Auto-focus sur l'email au chargement
  useEffect(() => {
    const emailInput = document.getElementById("email");
    if (emailInput) emailInput.focus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulation d'un léger délai pour le côté "Expert" (UX)
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
    <div className="min-h-screen flex items-stretch bg-white overflow-hidden">
      {/* Côté Gauche - Branding & Identité */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative flex-col justify-between p-12 overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary blur-[120px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white p-1.5 shadow-2xl flex items-center justify-center">
              <img src={logo} alt="Apress Mali" className="h-10 w-10 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter text-white uppercase leading-none">Apress Mali</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Trace Connect</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-5xl font-black text-white tracking-tighter leading-[1.1]">
            Expertise & <br />
            <span className="text-primary-foreground opacity-50 text-4xl">Suivi Commercial.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
            La solution intégrée pour la gestion des services, factures et encaissements d'Apress Mali S.A.R.L.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-white/30 font-bold uppercase text-[10px] tracking-[0.2em]">
          <span>© 2026 APRESS MALI</span>
          <div className="h-px w-12 bg-white/10" />
          <span>SÉCURITÉ OHADA</span>
        </div>
      </div>

      {/* Côté Droite - Formulaire */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 lg:p-24 relative bg-slate-50">
        <div className="w-full max-w-[420px] space-y-10 animate-fade-in">
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex justify-center mb-8">
             <div className="h-16 w-16 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 flex items-center justify-center">
              <img src={logo} alt="Apress Mali" className="h-12 w-12 object-contain" />
            </div>
          </div>

          <div className="space-y-3 text-center lg:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Portail Sécurisé</h1>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Identifiez-vous pour continuer</p>
          </div>

          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden">
            <CardContent className="p-8 md:p-10 space-y-8 bg-white">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                    <Mail className="h-3 w-3" /> Identifiant Professionnel
                  </Label>
                  <div className="relative">
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="nom@apress-mali.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="h-14 rounded-2xl border-slate-100 focus:border-primary focus:ring-primary/5 transition-all bg-slate-50/50 px-5 text-base font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Lock className="h-3 w-3" /> Mot de passe
                    </Label>
                    <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity">
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
                    className="h-14 rounded-2xl border-slate-100 focus:border-primary focus:ring-primary/5 transition-all bg-slate-50/50 px-5 text-base font-medium"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={!isFormValid || isLoading}
                  className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98] gap-3"
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      Accéder au Dashboard <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-100">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protection des données SSL 256-bit</span>
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold text-center leading-relaxed">
              En vous connectant, vous acceptez les conditions d'utilisation <br className="hidden md:block" />
              propres au système Trace Connect d'Apress Mali.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
