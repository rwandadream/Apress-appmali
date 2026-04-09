import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import UsersPage from "./UsersPage";
import ActivityPage from "./ActivityPage";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { UserCog, Activity, User, Database, Download, Upload, Building2, CreditCard, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { user, isSuperviseur } = useAuth();
  const { settings, updateSettings, exportData, importData } = useData();
  const { toast } = useToast();

  const [formSettings, setFormSettings] = useState(settings);

  const handleSaveSettings = () => {
    updateSettings(formSettings);
    toast({
      title: "Paramètres enregistrés",
      description: "Les informations de l'entreprise ont été mises à jour avec succès.",
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importData(content)) {
          toast({ title: "Import réussi", description: "Les données ont été restaurées." });
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast({ title: "Erreur", description: "Fichier invalide.", variant: "destructive" });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Configuration Système" 
        description="Gérez les paramètres de l'entreprise, les accès et la sécurité des données." 
      />

      <Tabs defaultValue="company" className="w-full">
        <TabsList className={`grid w-full mb-8 bg-muted/50 p-1 rounded-2xl ${isSuperviseur ? "grid-cols-5" : "grid-cols-2 max-w-md"}`}>
          <TabsTrigger value="company" className="rounded-xl flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Entreprise
          </TabsTrigger>
          <TabsTrigger value="profile" className="rounded-xl flex items-center gap-2">
            <User className="h-4 w-4" /> Mon Profil
          </TabsTrigger>
          {isSuperviseur && (
            <>
              <TabsTrigger value="users" className="rounded-xl flex items-center gap-2">
                <UserCog className="h-4 w-4" /> Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-xl flex items-center gap-2">
                <Activity className="h-4 w-4" /> Audit
              </TabsTrigger>
              <TabsTrigger value="data" className="rounded-xl flex items-center gap-2">
                <Database className="h-4 w-4" /> Maintenance
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="company" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card overflow-hidden border-primary/10">
                <CardHeader className="bg-primary/5 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Identité de l'entreprise</CardTitle>
                      <CardDescription>Ces informations apparaîtront sur vos factures et devis.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold">Raison Sociale</Label>
                      <Input 
                        value={formSettings.companyName} 
                        onChange={(e) => setFormSettings({...formSettings, companyName: e.target.value})} 
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">NIF (Numéro d'Identification Fiscale)</Label>
                      <Input 
                        value={formSettings.companyNif} 
                        onChange={(e) => setFormSettings({...formSettings, companyNif: e.target.value})} 
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">RCCM</Label>
                      <Input 
                        value={formSettings.companyRCCM} 
                        onChange={(e) => setFormSettings({...formSettings, companyRCCM: e.target.value})} 
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">NINA</Label>
                      <Input 
                        value={formSettings.companyNina || ""} 
                        onChange={(e) => setFormSettings({...formSettings, companyNina: e.target.value})} 
                        className="h-11"
                        placeholder="Ex: 40609..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Siège Social (Adresse complète)</Label>
                    <Textarea 
                      value={formSettings.companyAddress} 
                      onChange={(e) => setFormSettings({...formSettings, companyAddress: e.target.value})} 
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card overflow-hidden border-primary/10">
                <CardHeader className="bg-success/5 pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg text-success">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Informations Bancaires & Règlement</CardTitle>
                      <CardDescription>Configurez comment vos clients doivent vous payer.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="font-bold">Compte Bancaire (BDM, BMS...)</Label>
                    <Input 
                      value={formSettings.bankDetails} 
                      onChange={(e) => setFormSettings({...formSettings, bankDetails: e.target.value})} 
                      className="h-11 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold">Téléphone / Contact Support</Label>
                      <Input 
                        value={formSettings.mobileMoneyDetails} 
                        onChange={(e) => setFormSettings({...formSettings, mobileMoneyDetails: e.target.value})} 
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Email de l'entreprise</Label>
                      <Input 
                        value={formSettings.legalMentions} 
                        onChange={(e) => setFormSettings({...formSettings, legalMentions: e.target.value})} 
                        className="h-11"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base">Fiscalité & Devise</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">TVA par défaut (%)</Label>
                    <Input 
                      type="number" 
                      value={formSettings.defaultTva} 
                      onChange={(e) => setFormSettings({...formSettings, defaultTva: Number(e.target.value)})} 
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Symbole Monétaire</Label>
                    <Input 
                      value={formSettings.currency} 
                      onChange={(e) => setFormSettings({...formSettings, currency: e.target.value})} 
                      className="h-11"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="sticky top-6">
                <Button 
                  onClick={handleSaveSettings} 
                  className="w-full h-14 text-lg font-black shadow-xl shadow-primary/20 rounded-2xl gap-2"
                >
                  <ShieldCheck className="h-5 w-5" /> Enregistrer les modifications
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-4 font-bold uppercase tracking-widest opacity-50">
                  Dernière mise à jour : {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="animate-fade-in">
          <div className="max-w-2xl">
            <Card className="glass-card overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg">Mon Profil Utilisateur</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b">
                  <div className="h-20 w-20 rounded-3xl bg-primary text-white flex items-center justify-center text-3xl font-black shadow-lg">
                    {user?.prenom?.[0]}{user?.nom?.[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{user?.prenom} {user?.nom}</h3>
                    <Badge className="mt-1 font-bold uppercase tracking-tighter">{user?.role}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold opacity-50 uppercase text-[10px]">Identifiant Personnel</Label>
                    <Input defaultValue={user?.id} disabled className="h-11 bg-muted/20 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold opacity-50 uppercase text-[10px]">Adresse Email</Label>
                    <Input defaultValue={user?.email} disabled className="h-11 bg-muted/20" />
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs text-amber-800 font-medium">
                    Pour modifier vos identifiants ou votre mot de passe, veuillez contacter l'administrateur système.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isSuperviseur && (
          <>
            <TabsContent value="users" className="animate-fade-in">
              <UsersPage hideHeader />
            </TabsContent>
            <TabsContent value="activity" className="animate-fade-in">
              <ActivityPage hideHeader />
            </TabsContent>
            <TabsContent value="data" className="animate-fade-in">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Maintenance de la base de données</CardTitle>
                  <CardDescription>Outils d'administration pour la sauvegarde et la restauration du système.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 border-2 border-dashed rounded-3xl bg-muted/5 space-y-4 transition-all hover:border-primary/30">
                      <div className="flex items-center gap-4 text-primary">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                          <Download className="h-6 w-6" />
                        </div>
                        <h4 className="font-black text-lg">Exporter le système</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Générez un fichier complet contenant tous les clients, factures, paiements et configurations actuelles. 
                        Recommandé avant toute mise à jour majeure.
                      </p>
                      <Button onClick={exportData} variant="outline" className="w-full h-12 rounded-xl font-bold border-primary text-primary hover:bg-primary hover:text-white">
                        Télécharger Backup .JSON
                      </Button>
                    </div>

                    <div className="p-6 border-2 border-dashed rounded-3xl bg-muted/5 space-y-4 transition-all hover:border-warning/30">
                      <div className="flex items-center gap-4 text-warning">
                        <div className="p-3 bg-warning/10 rounded-2xl">
                          <Upload className="h-6 w-6" />
                        </div>
                        <h4 className="font-black text-lg">Restaurer le système</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Écrasez la base de données actuelle par une sauvegarde précédente. 
                        <span className="text-destructive font-black block mt-1 uppercase text-xs">⚠️ Toute donnée non sauvegardée sera perdue.</span>
                      </p>
                      <div className="relative">
                        <Input 
                          type="file" 
                          accept=".json" 
                          onChange={handleImport}
                          className="opacity-0 absolute inset-0 z-10 cursor-pointer h-12"
                        />
                        <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-warning text-warning hover:bg-warning hover:text-white">
                          Importer Backup .JSON
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default SettingsPage;
