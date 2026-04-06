import { useState } from "react";
import { Plus, Briefcase } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Service {
  id: string;
  nom: string;
  categorie: string;
  prix: number;
  description: string;
}

const mockServices: Service[] = [
  { id: "1", nom: "Gestion de la paie", categorie: "Ressources Humaines", prix: 250000, description: "Traitement complet de la paie mensuelle" },
  { id: "2", nom: "Recrutement", categorie: "Ressources Humaines", prix: 500000, description: "Recherche et sélection de candidats" },
  { id: "3", nom: "Assistance administrative", categorie: "Administration", prix: 150000, description: "Support administratif mensuel" },
  { id: "4", nom: "Déclarations sociales", categorie: "Prestations Sociales", prix: 200000, description: "Gestion des déclarations INPS et AMO" },
  { id: "5", nom: "Gestion des contrats", categorie: "Ressources Humaines", prix: 180000, description: "Rédaction et suivi des contrats de travail" },
  { id: "6", nom: "Formation du personnel", categorie: "Ressources Humaines", prix: 350000, description: "Sessions de formation professionnelle" },
];

const categories = ["Ressources Humaines", "Administration", "Prestations Sociales", "Autres"];

const categoryColors: Record<string, string> = {
  "Ressources Humaines": "bg-primary/10 text-primary",
  Administration: "bg-accent/10 text-accent",
  "Prestations Sociales": "bg-warning/10 text-warning",
  Autres: "bg-muted text-muted-foreground",
};

const Services = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalogue de Services"
        description="Référentiel des prestations APRESS MALI"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nouveau service</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau service</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setDialogOpen(false); }}>
                <div className="space-y-1.5">
                  <Label>Nom du service</Label>
                  <Input placeholder="Ex: Gestion de la paie" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Catégorie</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Prix unitaire (FCFA)</Label>
                  <Input type="number" placeholder="0" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Input placeholder="Description du service" />
                </div>
                <Button type="submit" className="w-full">Enregistrer</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockServices.map((service) => (
          <Card key={service.id} className="glass-card hover:shadow-md transition-shadow animate-fade-in">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{service.nom}</h3>
                    <Badge className={`mt-1 text-xs font-normal ${categoryColors[service.categorie] || ""}`} variant="outline">
                      {service.categorie}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
              <div className="pt-3 border-t border-border">
                <span className="text-lg font-bold text-foreground">{service.prix.toLocaleString()} FCFA</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Services;
