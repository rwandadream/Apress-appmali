import { useState, useMemo } from "react";
import { Plus, Search, Download, Eye, Trash2, Clock, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useData, type Invoice, type InvoiceItem } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  payée: { label: "Payée", variant: "default" as const, className: "bg-success text-success-foreground" },
  partielle: { label: "Partielle", variant: "outline" as const, className: "border-warning text-warning" },
  non_payée: { label: "Non payée", variant: "destructive" as const, className: "" },
};

const Invoices = () => {
  const { isSuperviseur, logActivity } = useAuth();
  const { categories, services, clients, invoices, addInvoice, archiveItem } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  
  // Form state
  const [selectedClientId, setSelectedClientId] = useState("");
  const [dateFacture, setDateFacture] = useState(new Date().toISOString().split('T')[0]);
  const [dateEcheance, setDateEcheance] = useState("");
  const [tvaRate, setTvaRate] = useState(18);
  const [lineItems, setLineItems] = useState<{ categoryId: string; serviceId: string; quantite: number; prixSaisi?: number }[]>([
    { categoryId: "", serviceId: "", quantite: 1 }
  ]);

  const addLineItem = () => setLineItems((prev) => [...prev, { categoryId: "", serviceId: "", quantite: 1 }]);
  const removeLineItem = (idx: number) => setLineItems((prev) => prev.filter((_, i) => i !== idx));
  
  const updateLineItem = (idx: number, field: string, value: string | number) => {
    setLineItems((prev) => prev.map((item, i) => {
      if (i === idx) {
        const newItem = { ...item, [field]: value };
        if (field === "categoryId") {
          newItem.serviceId = ""; // Reset service if category changes
          newItem.prixSaisi = undefined;
        }
        if (field === "serviceId") {
          const svc = services.find(s => s.id === value);
          newItem.prixSaisi = svc ? svc.prix : 0;
        }
        return newItem;
      }
      return item;
    }));
  };

  const computedTotals = useMemo(() => {
    const items = lineItems
      .filter((li) => li.serviceId)
      .map((li) => {
        const svc = services.find((s) => s.id === li.serviceId)!;
        const pu = li.prixSaisi !== undefined ? li.prixSaisi : svc.prix;
        return {
          serviceId: li.serviceId,
          serviceName: svc.nom,
          quantite: li.quantite,
          prixUnitaire: pu,
          montant: pu * li.quantite,
        };
      });
    const sousTotal = items.reduce((s, i) => s + i.montant, 0);
    const tvaMontant = Math.round(sousTotal * tvaRate / 100);
    return { items, sousTotal, tvaMontant, montantTTC: sousTotal + tvaMontant };
  }, [lineItems, tvaRate, services]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClientId);
    if (!client || computedTotals.items.length === 0) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }

    addInvoice({
      clientId: client.id,
      clientName: client.nom,
      date: dateFacture,
      echeance: dateEcheance,
      items: computedTotals.items,
      sousTotal: computedTotals.sousTotal,
      tva: tvaRate,
      tvaMontant: computedTotals.tvaMontant,
      montantTTC: computedTotals.montantTTC,
      paye: 0,
      status: "non_payée",
      type: "facture"
    });

    logActivity("Facture créée", `Facture pour ${client.nom} – ${computedTotals.montantTTC.toLocaleString()} FCFA`);
    toast({ title: "Facture créée", description: "La facture a été générée avec succès" });
    setDialogOpen(false);
    setSelectedClientId(""); setLineItems([{ categoryId: "", serviceId: "", quantite: 1 }]);
  };

  const filtered = invoices.filter(
    (i) => !i.archived && (i.numero.toLowerCase().includes(search.toLowerCase()) || i.clientName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factures"
        description="Gestion et suivi des factures"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nouvelle facture</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouvelle facture</DialogTitle>
              </DialogHeader>
              <form className="space-y-6" onSubmit={handleCreate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label>Client</Label>
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                      <SelectContent>
                        {clients.filter(c => !c.archived).map((c) => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Date de facturation</Label>
                      <Input type="date" value={dateFacture} onChange={(e) => setDateFacture(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Date d'échéance</Label>
                      <Input type="date" value={dateEcheance} onChange={(e) => setDateEcheance(e.target.value)} required />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <Label className="text-sm font-semibold">Prestations</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                      <Plus className="h-3 w-3 mr-1" />Ajouter une ligne
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {lineItems.map((li, idx) => {
                      const availableServices = services.filter(s => s.categorieId === li.categoryId && !s.archived);
                      
                      return (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-muted/20 p-3 rounded-lg border border-border/50 animate-fade-in">
                          <div className="col-span-4 space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Catégorie</Label>
                            <Select value={li.categoryId} onValueChange={(v) => updateLineItem(idx, "categoryId", v)}>
                              <SelectTrigger className="h-9 truncate"><SelectValue placeholder="Catégorie..." /></SelectTrigger>
                              <SelectContent>
                                {categories.filter(c => !c.archived).map((c) => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="col-span-4 space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Service</Label>
                            <Select 
                              value={li.serviceId} 
                              onValueChange={(v) => updateLineItem(idx, "serviceId", v)}
                              disabled={!li.categoryId}
                            >
                              <SelectTrigger className="h-9 truncate"><SelectValue placeholder="Service..." /></SelectTrigger>
                              <SelectContent>
                                {availableServices.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>{s.nom}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-1 space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Qté</Label>
                            <Input 
                              type="number" 
                              min={1} 
                              className="h-9"
                              value={li.quantite} 
                              onChange={(e) => updateLineItem(idx, "quantite", parseInt(e.target.value) || 1)} 
                            />
                          </div>

                          <div className="col-span-2 space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">P.U. (FCFA)</Label>
                            <Input 
                              type="number" 
                              className="h-9"
                              value={li.prixSaisi !== undefined ? li.prixSaisi : ""} 
                              onChange={(e) => updateLineItem(idx, "prixSaisi", parseInt(e.target.value) || 0)} 
                              placeholder="0"
                            />
                          </div>

                          <div className="col-span-1 flex justify-end">
                            {lineItems.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => removeLineItem(idx)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start border-t border-border pt-6">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm font-medium">TVA (%)</Label>
                    <Input type="number" className="w-24" value={tvaRate} onChange={(e) => setTvaRate(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="bg-muted/50 rounded-xl p-5 space-y-2 text-sm border border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total HT</span>
                      <span className="font-medium">{computedTotals.sousTotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TVA ({tvaRate}%)</span>
                      <span className="font-medium">{computedTotals.tvaMontant.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3 mt-1 text-lg">
                      <span className="font-bold">Total TTC</span>
                      <span className="font-black text-primary">{computedTotals.montantTTC.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20">
                  Générer la facture
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher par numéro ou client..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-bold">N° Facture</TableHead>
              <TableHead className="font-bold">Client</TableHead>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="text-right font-bold">Total TTC</TableHead>
              <TableHead className="font-bold">Statut</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Aucune facture trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inv) => {
                const cfg = statusConfig[inv.status as keyof typeof statusConfig];
                return (
                  <TableRow key={inv.id} className="animate-fade-in hover:bg-muted/10 transition-colors">
                    <TableCell className="font-mono font-medium text-sm text-primary">{inv.numero}</TableCell>
                    <TableCell className="font-medium">{inv.clientName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{inv.date}</TableCell>
                    <TableCell className="text-right font-bold">{inv.montantTTC.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <Badge variant={cfg?.variant} className={cfg?.className}>{cfg?.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => setPreviewInvoice(inv)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary"><Download className="h-4 w-4" /></Button>
                        {isSuperviseur && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer cette facture ?</AlertDialogTitle>
                                <AlertDialogDescription>La facture {inv.numero} sera archivée.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => archiveItem("invoices", inv.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <span className="text-muted-foreground font-normal">Facture</span> 
              <span className="text-primary">{previewInvoice?.numero}</span>
            </DialogTitle>
          </DialogHeader>
          {previewInvoice && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm bg-muted/30 p-4 rounded-xl border">
                <div className="col-span-2">
                  <span className="text-muted-foreground block mb-1">Client</span>
                  <p className="font-bold text-base">{previewInvoice.clientName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Date</span>
                  <p className="font-medium">{previewInvoice.date}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Statut</span>
                  <Badge variant={statusConfig[previewInvoice.status as keyof typeof statusConfig]?.variant} className={statusConfig[previewInvoice.status as keyof typeof statusConfig]?.className}>
                    {statusConfig[previewInvoice.status as keyof typeof statusConfig]?.label}
                  </Badge>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-bold">Service</TableHead>
                      <TableHead className="text-center font-bold">Qté</TableHead>
                      <TableHead className="text-right font-bold">P.U.</TableHead>
                      <TableHead className="text-right font-bold">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewInvoice.items.map((item: InvoiceItem, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.serviceName}</TableCell>
                        <TableCell className="text-center">{item.quantite}</TableCell>
                        <TableCell className="text-right">{item.prixUnitaire.toLocaleString()} FCFA</TableCell>
                        <TableCell className="text-right font-bold">{item.montant.toLocaleString()} FCFA</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <div className="w-full md:w-1/2 space-y-2 bg-muted/20 p-5 rounded-xl border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total HT</span>
                    <span className="font-medium">{previewInvoice.sousTotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">TVA ({previewInvoice.tva}%)</span>
                    <span className="font-medium">{previewInvoice.tvaMontant.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-3 mt-1 text-lg">
                    <span>Total TTC</span>
                    <span className="text-primary">{previewInvoice.montantTTC.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
