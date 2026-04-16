import { useState, useMemo } from "react";
import { Plus, Search, Mail, Phone, MapPin, Trash2, Building2, ExternalLink, TrendingUp, CreditCard, Pencil, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useData, Client } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const clientSchema = z.object({
  nom: z.string().min(2, "Le nom doit avoir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Numéro de téléphone invalide"),
  adresse: z.string().min(5, "Adresse trop courte"),
  secteur: z.string().min(2, "Secteur requis"),
  type_client: z.enum(["contrat", "sans_contrat"]),
});

type ClientFormValues = z.infer<typeof clientSchema>;

const Clients = () => {
  const { clients, invoices, addClient, updateClient, archiveItem } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "contrat" | "sans_contrat">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { nom: "", email: "", telephone: "", adresse: "", secteur: "", type_client: "sans_contrat" },
  });

  const onSubmit = (data: ClientFormValues) => {
    if (editingClient) {
      updateClient(editingClient.id, data);
      toast({ title: "Client mis à jour", description: `${data.nom} a été modifié avec succès.` });
    } else {
      addClient(data);
      toast({ title: "Client ajouté", description: `${data.nom} a été ajouté avec succès.` });
    }
    form.reset();
    setEditingClient(null);
    setDialogOpen(false);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    form.reset({
      nom: client.nom,
      email: client.email,
      telephone: client.telephone,
      adresse: client.adresse,
      secteur: client.secteur,
      type_client: client.type_client || "sans_contrat",
    });
    setDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingClient(null);
    form.reset({ nom: "", email: "", telephone: "", adresse: "", secteur: "", type_client: "sans_contrat" });
    setDialogOpen(true);
  };

  const clientStats = useMemo(() => {
    return clients.map(client => {
      const clientInvoices = invoices.filter(inv => inv.clientId === client.id && !inv.archived && inv.type === 'facture');
      const totalFacture = clientInvoices.reduce((acc, inv) => acc + inv.montantTTC, 0);
      const totalPaye = clientInvoices.reduce((acc, inv) => acc + inv.paye, 0);
      const resteAPayer = totalFacture - totalPaye;
      return { id: client.id, totalFacture, totalPaye, resteAPayer, invoiceCount: clientInvoices.length };
    });
  }, [clients, invoices]);

  const filteredClients = clients.filter(c => {
    const matchesSearch = !c.archived && (
      c.nom.toLowerCase().includes(search.toLowerCase()) || 
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.secteur.toLowerCase().includes(search.toLowerCase())
    );
    const matchesFilter = filterType === "all" || c.type_client === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Annuaire Clients"
        description={`${clients.filter(c => !c.archived).length} partenaires commerciaux actifs`}
        action={
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingClient(null);
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAdd} className="shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" /> Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">
                  {editingClient ? "Modifier le partenaire" : "Ajouter un partenaire"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Nom de l'entreprise</FormLabel>
                          <FormControl><Input placeholder="Ex: APM Logistique" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type_client"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Type de client</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir le type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="contrat">Sous contrat</SelectItem>
                              <SelectItem value="sans_contrat">Sans contrat</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Email</FormLabel>
                          <FormControl><Input type="email" placeholder="contact@client.ml" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telephone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Téléphone</FormLabel>
                          <FormControl><Input placeholder="70 00 00 00" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="secteur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Secteur d'activité</FormLabel>
                        <FormControl><Input placeholder="Ex: Commerce, Services..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adresse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Adresse</FormLabel>
                        <FormControl><Input placeholder="Ex: Bamako, ACI 2000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20">
                    {editingClient ? "Mettre à jour" : "Enregistrer le client"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un client..." 
            className="pl-10 bg-muted/20 border-none focus-visible:ring-1" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 bg-muted/30 p-1 rounded-lg">
          <Button 
            variant={filterType === "all" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setFilterType("all")}
            className="rounded-md font-bold"
          >
            Tous
          </Button>
          <Button 
            variant={filterType === "contrat" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setFilterType("contrat")}
            className="rounded-md font-bold"
          >
            Contrat
          </Button>
          <Button 
            variant={filterType === "sans_contrat" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setFilterType("sans_contrat")}
            className="rounded-md font-bold"
          >
            Sans contrat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const stats = clientStats.find(s => s.id === client.id);
          return (
            <Card key={client.id} className="glass-card group overflow-hidden border-border/50 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 animate-fade-in relative">
              <div className="absolute top-0 right-0 p-2 flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary/30 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                  onClick={() => handleEdit(client)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive/30 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-bold">Archiver ce client ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Le client {client.nom} sera archivé. Toutes ses factures et données seront conservées mais il n'apparaîtra plus dans vos listes actives.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => archiveItem("clients", client.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">Archiver</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">{client.nom}</h3>
                      <Badge variant={client.type_client === "contrat" ? "default" : "secondary"} className="text-[8px] h-4">
                        {client.type_client === "contrat" ? "CONTRAT" : "HORS CONTRAT"}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-widest">{client.secteur}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg">
                    <Mail className="h-3.5 w-3.5 text-primary/50" />
                    <span className="truncate font-medium">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg">
                    <Phone className="h-3.5 w-3.5 text-primary/50" />
                    <span className="font-medium">{client.telephone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/50">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Total Facturé</p>
                    <p className="font-black text-xs">{formatCurrency(stats?.totalFacture || 0)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Reste à payer</p>
                    <p className={cn("font-black text-xs", (stats?.resteAPayer || 0) > 0 ? "text-warning" : "text-success")}>
                      {formatCurrency(stats?.resteAPayer || 0)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full rounded-xl gap-2 font-bold bg-primary shadow-lg shadow-primary/20 transition-all h-9">
                    <Link to={`/clients/${client.id}/cabinet`}>
                      <FolderOpen className="h-4 w-4" /> Ouvrir Classeur
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full rounded-xl gap-2 font-bold h-9 text-xs">
                    <Link to={`/invoices?search=${client.nom}`}>
                      Historique Factures <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Clients;
