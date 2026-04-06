import { useState, useMemo } from "react";
import { Plus, Search, Download, Eye, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface InvoiceItem {
  serviceId: string;
  serviceName: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
}

interface Invoice {
  id: string;
  numero: string;
  client: string;
  date: string;
  echeance: string;
  items: InvoiceItem[];
  sousTotal: number;
  tva: number;
  tvaMontant: number;
  montantTTC: number;
  paye: number;
  status: "payée" | "partielle" | "non_payée";
  createdBy: string;
}

const mockClients = [
  { id: "1", nom: "Société Alpha" },
  { id: "2", nom: "Enterprise Beta" },
  { id: "3", nom: "Groupe Gamma" },
  { id: "4", nom: "Delta Services" },
];

const mockServices = [
  { id: "1", nom: "Gestion de la paie", prix: 250000 },
  { id: "2", nom: "Recrutement", prix: 500000 },
  { id: "3", nom: "Assistance administrative", prix: 150000 },
  { id: "4", nom: "Déclarations sociales", prix: 200000 },
  { id: "5", nom: "Gestion des contrats", prix: 180000 },
  { id: "6", nom: "Formation du personnel", prix: 350000 },
];

const statusConfig = {
  payée: { label: "Payée", variant: "default" as const, className: "bg-success text-success-foreground" },
  partielle: { label: "Partielle", variant: "outline" as const, className: "border-warning text-warning" },
  non_payée: { label: "Non payée", variant: "destructive" as const, className: "" },
};

const generateNumero = (index: number): string => {
  const year = new Date().getFullYear();
  return `APM-${year}-${String(index).padStart(3, "0")}`;
};

const Invoices = () => {
  const { isSuperviseur, user, logActivity } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "1", numero: "APM-2026-001", client: "Société Alpha", date: "2026-01-15", echeance: "2026-02-15",
      items: [{ serviceId: "1", serviceName: "Gestion de la paie", quantite: 5, prixUnitaire: 250000, montant: 1250000 }],
      sousTotal: 1250000, tva: 18, tvaMontant: 225000, montantTTC: 1475000, paye: 1475000, status: "payée", createdBy: "1",
    },
    {
      id: "2", numero: "APM-2026-002", client: "Enterprise Beta", date: "2026-01-20", echeance: "2026-02-20",
      items: [{ serviceId: "2", serviceName: "Recrutement", quantite: 1, prixUnitaire: 500000, montant: 500000 }, { serviceId: "3", serviceName: "Assistance administrative", quantite: 2, prixUnitaire: 150000, montant: 300000 }],
      sousTotal: 800000, tva: 18, tvaMontant: 144000, montantTTC: 944000, paye: 400000, status: "partielle", createdBy: "1",
    },
    {
      id: "3", numero: "APM-2026-003", client: "Groupe Gamma", date: "2026-02-01", echeance: "2026-03-01",
      items: [{ serviceId: "6", serviceName: "Formation du personnel", quantite: 6, prixUnitaire: 350000, montant: 2100000 }],
      sousTotal: 2100000, tva: 18, tvaMontant: 378000, montantTTC: 2478000, paye: 0, status: "non_payée", createdBy: "2",
    },
  ]);

  // Form state
  const [selectedClient, setSelectedClient] = useState("");
  const [dateFacture, setDateFacture] = useState("");
  const [dateEcheance, setDateEcheance] = useState("");
  const [tvaRate, setTvaRate] = useState(18);
  const [lineItems, setLineItems] = useState<{ serviceId: string; quantite: number }[]>([{ serviceId: "", quantite: 1 }]);

  const addLineItem = () => setLineItems((prev) => [...prev, { serviceId: "", quantite: 1 }]);
  const removeLineItem = (idx: number) => setLineItems((prev) => prev.filter((_, i) => i !== idx));
  const updateLineItem = (idx: number, field: string, value: string | number) =>
    setLineItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));

  const computedTotals = useMemo(() => {
    const items: InvoiceItem[] = lineItems
      .filter((li) => li.serviceId)
      .map((li) => {
        const svc = mockServices.find((s) => s.id === li.serviceId)!;
        return {
          serviceId: li.serviceId,
          serviceName: svc.nom,
          quantite: li.quantite,
          prixUnitaire: svc.prix,
          montant: svc.prix * li.quantite,
        };
      });
    const sousTotal = items.reduce((s, i) => s + i.montant, 0);
    const tvaMontant = Math.round(sousTotal * tvaRate / 100);
    return { items, sousTotal, tvaMontant, montantTTC: sousTotal + tvaMontant };
  }, [lineItems, tvaRate]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || computedTotals.items.length === 0) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }
    // Anti-doublon: check if same client + same date already exists
    const duplicate = invoices.find((inv) => inv.client === mockClients.find((c) => c.id === selectedClient)?.nom && inv.date === dateFacture);
    if (duplicate) {
      toast({ title: "Doublon détecté", description: `Une facture existe déjà pour ce client à cette date (${duplicate.numero})`, variant: "destructive" });
      return;
    }

    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      numero: generateNumero(invoices.length + 1),
      client: mockClients.find((c) => c.id === selectedClient)!.nom,
      date: dateFacture,
      echeance: dateEcheance,
      items: computedTotals.items,
      sousTotal: computedTotals.sousTotal,
      tva: tvaRate,
      tvaMontant: computedTotals.tvaMontant,
      montantTTC: computedTotals.montantTTC,
      paye: 0,
      status: "non_payée",
      createdBy: user?.id || "",
    };
    setInvoices((prev) => [...prev, newInvoice]);
    logActivity("Facture créée", `Facture ${newInvoice.numero} – ${newInvoice.client} – ${newInvoice.montantTTC.toLocaleString()} FCFA TTC`);
    toast({ title: "Facture créée", description: `${newInvoice.numero} générée avec succès` });
    setDialogOpen(false);
    setSelectedClient(""); setDateFacture(""); setDateEcheance(""); setLineItems([{ serviceId: "", quantite: 1 }]);
  };

  const handleDelete = (inv: Invoice) => {
    setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
    logActivity("Facture supprimée", `Facture ${inv.numero} supprimée`);
    toast({ title: "Facture supprimée", description: inv.numero });
  };

  const filtered = invoices.filter(
    (i) => i.numero.toLowerCase().includes(search.toLowerCase()) || i.client.toLowerCase().includes(search.toLowerCase())
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
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouvelle facture</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreate}>
                <div className="space-y-1.5">
                  <Label>Client</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                    <SelectContent>
                      {mockClients.map((c) => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
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

                {/* Line items */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Lignes de facturation</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                      <Plus className="h-3 w-3 mr-1" />Ajouter
                    </Button>
                  </div>
                  {lineItems.map((li, idx) => {
                    const svc = mockServices.find((s) => s.id === li.serviceId);
                    return (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-6 space-y-1">
                          {idx === 0 && <Label className="text-xs">Service</Label>}
                          <Select value={li.serviceId} onValueChange={(v) => updateLineItem(idx, "serviceId", v)}>
                            <SelectTrigger><SelectValue placeholder="Service" /></SelectTrigger>
                            <SelectContent>
                              {mockServices.map((s) => <SelectItem key={s.id} value={s.id}>{s.nom} – {s.prix.toLocaleString()} FCFA</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2 space-y-1">
                          {idx === 0 && <Label className="text-xs">Qté</Label>}
                          <Input type="number" min={1} value={li.quantite} onChange={(e) => updateLineItem(idx, "quantite", parseInt(e.target.value) || 1)} />
                        </div>
                        <div className="col-span-3 text-right text-sm font-medium pt-2">
                          {svc ? (svc.prix * li.quantite).toLocaleString() + " FCFA" : "—"}
                        </div>
                        <div className="col-span-1">
                          {lineItems.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeLineItem(idx)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* TVA + Totals */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm">TVA (%)</Label>
                    <Input type="number" className="w-20" value={tvaRate} onChange={(e) => setTvaRate(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total HT</span>
                      <span className="font-medium">{computedTotals.sousTotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TVA ({tvaRate}%)</span>
                      <span className="font-medium">{computedTotals.tvaMontant.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1.5 text-base">
                      <span className="font-semibold">Total TTC</span>
                      <span className="font-bold text-primary">{computedTotals.montantTTC.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full">Créer la facture</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher par numéro ou client..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Facture</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead className="text-right">HT</TableHead>
              <TableHead className="text-right">TTC</TableHead>
              <TableHead className="text-right">Payé</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((inv) => {
              const cfg = statusConfig[inv.status];
              return (
                <TableRow key={inv.id} className="animate-fade-in">
                  <TableCell className="font-mono font-medium text-sm">{inv.numero}</TableCell>
                  <TableCell>{inv.client}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.echeance}</TableCell>
                  <TableCell className="text-right">{inv.sousTotal.toLocaleString()} FCFA</TableCell>
                  <TableCell className="text-right font-medium">{inv.montantTTC.toLocaleString()} FCFA</TableCell>
                  <TableCell className="text-right">{inv.paye.toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    <Badge variant={cfg.variant} className={cfg.className}>{cfg.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewInvoice(inv)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                      {isSuperviseur && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cette facture ?</AlertDialogTitle>
                              <AlertDialogDescription>La facture {inv.numero} sera définitivement supprimée.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(inv)}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Facture {previewInvoice?.numero}</DialogTitle>
          </DialogHeader>
          {previewInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Client</span>
                  <p className="font-medium">{previewInvoice.client}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date</span>
                  <p className="font-medium">{previewInvoice.date}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Échéance</span>
                  <p className="font-medium">{previewInvoice.echeance}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Statut</span>
                  <Badge variant={statusConfig[previewInvoice.status].variant} className={statusConfig[previewInvoice.status].className}>
                    {statusConfig[previewInvoice.status].label}
                  </Badge>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead className="text-center">Qté</TableHead>
                      <TableHead className="text-right">P.U.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewInvoice.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">{item.serviceName}</TableCell>
                        <TableCell className="text-center">{item.quantite}</TableCell>
                        <TableCell className="text-right">{item.prixUnitaire.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">{item.montant.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span>Sous-total HT</span>
                  <span>{previewInvoice.sousTotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA ({previewInvoice.tva}%)</span>
                  <span>{previewInvoice.tvaMontant.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1.5">
                  <span>Total TTC</span>
                  <span className="text-primary">{previewInvoice.montantTTC.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Payé</span>
                  <span>{previewInvoice.paye.toLocaleString()} FCFA</span>
                </div>
                {previewInvoice.montantTTC - previewInvoice.paye > 0 && (
                  <div className="flex justify-between font-semibold text-destructive">
                    <span>Reste à payer</span>
                    <span>{(previewInvoice.montantTTC - previewInvoice.paye).toLocaleString()} FCFA</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
