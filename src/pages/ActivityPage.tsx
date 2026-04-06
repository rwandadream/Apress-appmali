import { Clock, Activity } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const actionColors: Record<string, string> = {
  Connexion: "bg-success/10 text-success",
  Déconnexion: "bg-muted text-muted-foreground",
  "Création utilisateur": "bg-primary/10 text-primary",
  "Suppression utilisateur": "bg-destructive/10 text-destructive",
  "Facture créée": "bg-info/10 text-info",
  "Paiement enregistré": "bg-success/10 text-success",
  "Client ajouté": "bg-primary/10 text-primary",
  "Client supprimé": "bg-destructive/10 text-destructive",
};

const ActivityPage = () => {
  const { activityLog } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal d'activité"
        description="Historique de toutes les actions effectuées"
      />

      {activityLog.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Aucune activité enregistrée pour le moment.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Les actions des utilisateurs apparaîtront ici.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activityLog.map((entry) => (
            <Card key={entry.id} className="glass-card animate-fade-in">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{entry.userName}</span>
                      <Badge variant="outline" className={`text-xs ${actionColors[entry.action] || ""}`}>
                        {entry.action}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{entry.details}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(entry.timestamp).toLocaleString("fr-FR", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
