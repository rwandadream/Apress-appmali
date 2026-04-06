import { useState } from "react";
import { Plus, Search, Phone, Mail, Building2, MoreHorizontal, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  nom: string;
  prenom: string;
  entreprise: string;
  telephone: string;
  email: string;
  adresse: string;
  facturesCount: number;
  status: "actif" | "inactif";
}

const mockClients: Client[] = [
  { id: "1", nom: "Diallo", prenom: "Amadou", entreprise: "Société Alpha", telephone: "+223 76 12 34 56", email: "amadou@alpha.ml", adresse: "Bamako, ACI 2000", facturesCount: 5, status: "actif" },
  { id: "2", nom: "Traoré", prenom: "Fatoumata", entreprise: "Enterprise Beta", telephone: "+223 66 98 76 54", email: "fatoumata@beta.ml", adresse: "Bamako, Hamdallaye", facturesCount: 3, status: "actif" },
  { id: "3", nom: "Coulibaly", prenom: "Ibrahim", entreprise: "Groupe Gamma", telephone: "+223 70 55 44 33", email: "ibrahim@gamma.ml", adresse: "Bamako, Badalabougou", facturesCount: 8, status: "actif" },
  { id: "4", nom: "Keita", prenom: "Mariam", entreprise: "Delta Services", telephone: "+223 63 22 11 00", email: "mariam@delta.ml", adresse: "Bamako, Kalaban", facturesCount: 1, status: "inactif" },
];

const Clients = () => {
  const { isSuperviseur, logActivity } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");

  const filtered = clients.filter(
    (c) => c.nom.toLowerCase().includes(search.toLowerCase()) || c.prenom.toLowerCase().includes(search.toLowerCase()) || c.entreprise.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = { id: crypto.randomUUID(), nom, prenom, entreprise, telephone, email, adresse, facturesCount: 0, status: "actif" };
    setClients((prev) => [...prev, newClient]);
    logActivity("Client ajouté", `${prenom} ${nom} – ${entreprise}`);
    toast({ title: "Client ajouté", description: `${prenom} ${nom}` });
    setNom(""); setPrenom(""); setEntreprise(""); setTelephone(""); setEmail(""); setAdresse("");
    setDialogOpen(false);
  };

  const handleDelete = (client: Client) => {
    setClients((prev) => prev.filter((c) => c.id !== client.id));
    logActivity("Client supprimé", `${client.prenom} ${client.nom} – ${client.entreprise}`);
    toast({ title: "Client supprimé" });
  };

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
              <DialogHeader><DialogTitle>Nouveau client</DialogTitle></DialogHeader>
              <form className="space-y-4" onSubmit={handleAdd}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Nom</Label><Input value={nom} onChange={(e) => setNom(e.target.value)} required /></div>
                  <div className="space-y-1.5"><Label>Prénom</Label><Input value={prenom} onChange={(e) => setPrenom(e.target.value)} required /></div>
                </div>
                <div className="space-y-1.5"><Label>Entreprise</Label><Input value={entreprise} onChange={(e) => setEntreprise(e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Téléphone</Label><Input value={telephone} onChange={(e) => setTelephone(e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                </div>
                <div className="space-y-1.5"><Label>Adresse</Label><Input value={adresse} onChange={(e) => setAdresse(e.target.value)} /></div>
                <Button type="submit" className="w-full">Enregistrer</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un client..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((client) => (
          <Card key={client.id} className="glass-card hover:shadow-md transition-shadow animate-fade-in">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{client.prenom} {client.nom}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                    <Building2 className="h-3.5 w-3.5" />{client.entreprise}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={client.status === "actif" ? "default" : "secondary"} className="text-xs">{client.status}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Modifier</DropdownMenuItem>
                      <DropdownMenuItem>Voir les factures</DropdownMenuItem>
                      {isSuperviseur && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />Supprimer
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
                              <AlertDialogDescription>{client.prenom} {client.nom} sera définitivement supprimé.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(client)}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{client.telephone}</div>
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{client.email}</div>
              </div>
              <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                {client.facturesCount} facture{client.facturesCount > 1 ? "s" : ""}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Clients;
