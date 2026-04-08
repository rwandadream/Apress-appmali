import { useState } from "react";
import { Plus, Search, Download, Eye, Trash2, Clock, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useData, type Invoice, type InvoiceItem } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, cn, exportToCSV } from "@/lib/utils";
import InvoiceForm from "@/components/InvoiceForm";
import logo from "@/assets/logo_apress.jpeg";

const statusConfig = {
  payée: { label: "Payée", variant: "default" as const, className: "bg-success text-success-foreground" },
  partielle: { label: "Partielle", variant: "outline" as const, className: "border-warning text-warning" },
  non_payée: { label: "Non payée", variant: "destructive" as const, className: "" },
};

const Invoices = () => {
  const { isSuperviseur, logActivity } = useAuth();
  const { clients, invoices, addInvoice, archiveItem } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleCreate = (data: { clientId: string; date: string; echeance: string; tva: number; items: InvoiceItem[]; sousTotal: number; tvaMontant: number; montantTTC: number }) => {
    const client = clients.find(c => c.id === data.clientId);
    if (!client) return;

    addInvoice({
      ...data,
      clientName: client.nom,
      paye: 0,
      status: "non_payée",
      type: "facture"
    });

    logActivity("Facture créée", `Facture pour ${client.nom} – ${formatCurrency(data.montantTTC)}`);
    toast({ title: "Facture créée", description: "La facture a été générée avec succès" });
    setDialogOpen(false);
  };

  const filtered = invoices.filter(
    (i) => !i.archived && (i.numero.toLowerCase().includes(search.toLowerCase()) || i.clientName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Factures"
        description="Gestion et suivi des factures d'Apress Mali"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" /> Nouvelle facture
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Créer une facture</DialogTitle>
              </DialogHeader>
              <InvoiceForm 
                onSubmit={handleCreate} 
                onCancel={() => setDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par numéro ou client..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-10 bg-muted/20 border-none focus-visible:ring-1" 
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={() => exportToCSV(filtered, "factures_apress")}
          >
            <Download className="h-4 w-4 mr-2" /> Exporter (CSV)
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden border border-border shadow-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">N° Facture</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Client</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-center">Date</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">Total TTC</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-center">Statut</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Search className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-medium">Aucune facture trouvée.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inv) => {
                const cfg = statusConfig[inv.status as keyof typeof statusConfig];
                return (
                  <TableRow key={inv.id} className="animate-fade-in hover:bg-muted/10 transition-colors group">
                    <TableCell className="font-mono font-bold text-xs text-primary">{inv.numero}</TableCell>
                    <TableCell>
                      <div className="font-bold text-sm">{inv.clientName}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs font-medium text-muted-foreground">{formatDate(inv.date)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-black text-sm">{formatCurrency(inv.montantTTC)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={cfg?.variant} className={cn("text-[10px] uppercase font-bold tracking-tighter px-2 py-0.5", cfg?.className)}>
                        {cfg?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-full transition-all" 
                          onClick={() => setPreviewInvoice(inv)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-full transition-all"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {isSuperviseur && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-bold">Supprimer cette facture ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  La facture {inv.numero} pour {inv.clientName} sera archivée. Cette action est réversible par un administrateur.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => archiveItem("invoices", inv.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">Supprimer</AlertDialogAction>
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
        <DialogContent className="sm:max-w-4xl rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
          {previewInvoice && (
            <div className="flex flex-col h-full max-h-[95vh]">
              <div className="flex-1 overflow-y-auto p-12 print:p-0" id="printable-invoice">
                {/* Official Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-100 pb-10">
                  <div className="flex flex-col gap-6">
                    <div className="w-28 h-28 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden">
                      <img src={logo} alt="Apress Mali" className="w-24 h-24 object-contain" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">APRESS MALI SARL</h2>
                      <p className="text-[11px] text-slate-500 font-bold max-w-[250px] leading-relaxed uppercase tracking-widest">
                        Conseils, Intermédiation, Transit, Transport et Prestations Diverses
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-4 pt-2">
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Siège Social</h3>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">
                        Bamako, Mali – Hamdallaye ACI 2000<br />
                        Immeuble ABK, 2ème Étage
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contacts</h3>
                      <p className="text-xs font-bold text-slate-700">
                        Tél: (+223) 70 00 00 00 / 60 00 00 00<br />
                        Email: contact@apress-mali.com
                      </p>
                    </div>
                    <div className="pt-2 flex flex-col gap-1 items-end">
                      <Badge variant="outline" className="text-[10px] font-black border-slate-200">NIF: 086112345Z</Badge>
                      <Badge variant="outline" className="text-[10px] font-black border-slate-200">RCCM: MA.BKO.2024.B.1234</Badge>
                    </div>
                  </div>
                </div>

                {/* Document Type & Reference */}
                <div className="py-10 flex justify-between items-end">
                  <div className="space-y-1">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic opacity-10">FACTURE</h1>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-primary tracking-tight">{previewInvoice.numero}</span>
                      <Badge className={cn("text-[10px] font-black uppercase", statusConfig[previewInvoice.status as keyof typeof statusConfig]?.className)}>
                        {statusConfig[previewInvoice.status as keyof typeof statusConfig]?.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Date d'émission : {formatDate(previewInvoice.date)}</p>
                  </div>
                  <div className="bg-slate-900 text-white p-8 rounded-[24px] shadow-xl shadow-slate-200 min-w-[300px]">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 block mb-2">Destinataire</span>
                    <div className="space-y-1">
                      <p className="text-xl font-black leading-tight tracking-tight">{previewInvoice.clientName}</p>
                      <div className="text-[11px] font-medium text-white/60 space-y-0.5 pt-2">
                        <p>{previewInvoice.clientAdresse || "Adresse non renseignée"}</p>
                        <p>{previewInvoice.clientTelephone || "Téléphone non renseigné"}</p>
                        <p>{previewInvoice.clientEmail || "Email non renseigné"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table of items */}
                <div className="border border-slate-100 rounded-[24px] overflow-hidden shadow-sm mb-8 bg-white">
                  <Table>
                    <TableHeader className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableRow className="border-b border-slate-100">
                        <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-500 py-6 pl-8">Désignation des Prestations</TableHead>
                        <TableHead className="text-center font-black uppercase text-[10px] tracking-widest text-slate-500">Qté</TableHead>
                        <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-slate-500">Prix Unitaire</TableHead>
                        <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-slate-500 pr-8">Total HT</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewInvoice.items.map((item: InvoiceItem, idx: number) => (
                        <TableRow key={idx} className="hover:bg-transparent border-b border-slate-50 last:border-0">
                          <TableCell className="font-bold text-sm py-6 pl-8">{item.serviceName}</TableCell>
                          <TableCell className="text-center font-black text-slate-400">{item.quantite}</TableCell>
                          <TableCell className="text-right text-slate-600 font-bold">{formatCurrency(item.prixUnitaire)}</TableCell>
                          <TableCell className="text-right font-black text-slate-900 pr-8">{formatCurrency(item.montant)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Payment Info & Totals */}
                <div className="grid grid-cols-5 gap-12 items-start">
                  <div className="col-span-3 space-y-8 pt-4">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Informations de Règlement</h3>
                      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Échéance</span>
                          <p className="text-xs font-black text-destructive uppercase tracking-tighter italic">
                            À régler avant le : {formatDate(previewInvoice.echeance)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mode de Paiement</span>
                          <p className="text-xs font-bold text-slate-700">{previewInvoice.paymentMethod || "Virement Bancaire"}</p>
                        </div>
                        <div className="col-span-2 space-y-1 pt-2 border-t border-slate-200">
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <CreditCard className="h-3 w-3" /> Référence de paiement à rappeler
                          </span>
                          <p className="text-sm font-black text-slate-900 tracking-tight">
                            {previewInvoice.paymentReference || previewInvoice.numero}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Coordonnées Bancaires</h3>
                      <div className="text-[10px] font-medium text-slate-500 leading-relaxed space-y-1 italic">
                        <p><strong>BMS-SA :</strong> ML012 01001 001234567890 12</p>
                        <p><strong>BDM-SA :</strong> ML016 01201 009876543210 45</p>
                        <p><strong>Mobile Money :</strong> (+223) 70 00 00 00 (Orange Money) / (+223) 60 00 00 00 (Moov Money)</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="bg-slate-50 border-2 border-slate-100 p-8 rounded-[32px] space-y-4">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                        <span>Sous-total HT</span>
                        <span className="text-slate-900">{formatCurrency(previewInvoice.sousTotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 pb-4 border-b-2 border-white">
                        <span>TVA ({previewInvoice.tva}%)</span>
                        <span className="text-slate-900">{formatCurrency(previewInvoice.tvaMontant)}</span>
                      </div>
                      <div className="flex justify-between pt-2 items-baseline">
                        <span className="font-black uppercase text-xs tracking-tighter text-primary">TOTAL TTC</span>
                        <span className="text-4xl font-black tracking-tighter text-slate-900">
                          {formatCurrency(previewInvoice.montantTTC)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal mentions */}
                <div className="mt-16 pt-8 border-t border-slate-100">
                  <div className="flex gap-4 items-start bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200">
                    <ShieldAlert className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mentions Légales & Conditions</p>
                      <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                        Conformément aux dispositions légales au Mali et à l'Acte Uniforme de l'OHADA : 
                        Le défaut de paiement à l'échéance fixée entraînera l'application de pénalités de retard au taux annuel de 10%, sans mise en demeure préalable. 
                        Tout litige sera porté devant le Tribunal de Commerce de Bamako.
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 italic">
                      Document généré par Apress Trace Connect
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t flex justify-center gap-4 no-print">
                <Button variant="outline" onClick={() => setPreviewInvoice(null)} className="h-14 px-8 rounded-2xl font-bold">
                  Fermer
                </Button>
                <Button onClick={handlePrint} className="gap-3 rounded-2xl h-14 px-12 font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                  <Download className="h-6 w-6" /> Télécharger au format PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
