import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" description="Configuration de votre compte et de l'application" />

      <div className="grid gap-6 max-w-2xl">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Profil utilisateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input defaultValue="Admin" />
              </div>
              <div className="space-y-1.5">
                <Label>Prénom</Label>
                <Input defaultValue="APRESS" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input defaultValue="admin@apress-mali.com" type="email" />
            </div>
            <div className="flex items-center gap-2">
              <Label>Rôle</Label>
              <Badge>Superviseur</Badge>
            </div>
            <Button>Mettre à jour</Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Sécurité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Mot de passe actuel</Label>
              <Input type="password" />
            </div>
            <div className="space-y-1.5">
              <Label>Nouveau mot de passe</Label>
              <Input type="password" />
            </div>
            <Button variant="outline">Changer le mot de passe</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
