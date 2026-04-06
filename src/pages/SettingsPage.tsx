import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersPage from "./UsersPage";
import ActivityPage from "./ActivityPage";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { UserCog, Activity, User, Database, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { user, isSuperviseur } = useAuth();
  const { settings, updateSettings, exportData, importData } = useData();
  const { toast } = useToast();

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importData(content)) {
          toast({ title: "Import réussi", description: "Les données ont été restaurées." });
          window.location.reload();
        } else {
          toast({ title: "Erreur", description: "Fichier invalide.", variant: "destructive" });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" description="Configuration de votre compte et de l'application" />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className={`grid w-full mb-8 ${isSuperviseur ? "grid-cols-4" : "grid-cols-2 max-w-md"}`}>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profil
          </TabsTrigger>
          {isSuperviseur && (
            <>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" /> Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" /> Activités
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Database className="h-4 w-4" /> Données
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6 animate-fade-in">
          <div className="grid gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">Profil utilisateur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nom</Label>
                    <Input defaultValue={user?.nom || "Admin"} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Prénom</Label>
                    <Input defaultValue={user?.prenom || "APRESS"} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input defaultValue={user?.email || "admin@apress-mali.com"} type="email" />
                </div>
                <div className="flex items-center gap-2">
                  <Label>Rôle</Label>
                  <Badge className="capitalize">{user?.role || "Superviseur"}</Badge>
                </div>
                <Button>Mettre à jour</Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">Paramètres de l'application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>TVA par défaut (%)</Label>
                    <Input 
                      type="number" 
                      value={settings.defaultTva} 
                      onChange={(e) => updateSettings({...settings, defaultTva: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Devise</Label>
                    <Input 
                      value={settings.currency} 
                      onChange={(e) => updateSettings({...settings, currency: e.target.value})} 
                    />
                  </div>
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
              <div className="grid gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base">Sauvegarde et Restauration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 p-4 border rounded-xl bg-muted/5 space-y-3">
                        <div className="flex items-center gap-3 text-primary">
                          <Download className="h-5 w-5" />
                          <h4 className="font-bold">Exporter les données</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">Téléchargez une copie de sauvegarde de toutes vos données (Clients, Factures, Services) au format JSON.</p>
                        <Button onClick={exportData} variant="outline" className="w-full">Télécharger la sauvegarde</Button>
                      </div>

                      <div className="flex-1 p-4 border rounded-xl bg-muted/5 space-y-3">
                        <div className="flex items-center gap-3 text-warning">
                          <Upload className="h-5 w-5" />
                          <h4 className="font-bold">Importer des données</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">Restaurez vos données à partir d'un fichier de sauvegarde. <span className="text-destructive font-bold text-xs">Attention : cela écrasera les données actuelles.</span></p>
                        <div className="relative">
                          <Input 
                            type="file" 
                            accept=".json" 
                            onChange={handleImport}
                            className="opacity-0 absolute inset-0 z-10 cursor-pointer"
                          />
                          <Button variant="outline" className="w-full">Choisir un fichier JSON</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default SettingsPage;
