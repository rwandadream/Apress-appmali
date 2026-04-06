import { useState } from "react";
import { Plus, Search, Mail, Phone, MapPin, Trash2, Building2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

const Clients = () => {
  const { clients, addClient, deleteClient } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form states
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [secteur, setSecteur] = useState("");

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    addClient({ nom, email, telephone, adresse, secteur });
    toast({ title: "Client ajouté", description: `${nom} a été ajouté à votre base.` });
    setNom(""); setEmail(""); setTelephone(""); setAdresse(""); setSecteur("");
    setDialogOpen(false);
  };

  const filteredClients = clients.filter(c => 
    c.nom.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description={`${clients.length} clients enregistrés`}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nouveau client</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouveau client</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleAddClient}>
                <div className="space-y-1.5">
                  <Label>Nom de l'entreprise</Label>
                  <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: APM Logistique" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@client.ml" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Téléphone</Label>
                    <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="70 00 00 00" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Secteur d'activité</Label>
                  <Input value={secteur} onChange={(e) => setSecteur(e.target.value)} placeholder="Ex: Commerce, Services..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Adresse</Label>
                  <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Ex: Bamako, ACI 2000" />
                </div>
                <Button type="submit" className="w-full">Enregistrer le client</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Rechercher un client..." 
          className="pl-10" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="glass-card hover:shadow-md transition-shadow animate-fade-in group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{client.nom}</h3>
                    <p className="text-xs text-muted-foreground">{client.secteur}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    if(confirm(`Supprimer le client ${client.nom} ?`)) {
                      deleteClient(client.id);
                      toast({ title: "Client supprimé" });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{client.telephone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{client.adresse}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <Button variant="outline" size="sm" className="w-full">Détails & Historique</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Clients;
