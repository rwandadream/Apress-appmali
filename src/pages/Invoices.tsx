import { useState, useEffect } from "react";
import { Plus, Search, Download, Eye, Trash2, Clock, CheckCircle2, Pencil, Wallet, CreditCard, ShieldAlert, MoreHorizontal, Printer, Building2, Phone, Mail, Globe } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useData, type Invoice, type InvoiceItem } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, cn, exportToCSV } from "@/lib/utils";
import InvoiceForm, { InvoiceFormSubmitData } from "@/components/InvoiceForm";
import logo from "@/assets/logo_apress.jpeg";

const statusConfig = {
  payée: { label: "Payée", variant: "default" as const, className: "bg-success text-success-foreground" },
  partielle: { label: "Partielle", variant: "outline" as const, className: "border-warning text-warning" },
  non_payée: { label: "Non payée", variant: "destructive" as const, className: "" },
};

const Invoices = () => {
  const { isSuperviseur, logActivity } = useAuth();
  const { clients, invoices, addInvoice, updateInvoice, archiveItem, settings } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const s = searchParams.get("search");
    if (s) setSearch(s);
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const handleCreateOrUpdate = (data: InvoiceFormSubmitData) => {
    const client = clients.find(c => c.id === data.clientId);
    if (!client) return;

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, {
        ...data,
        clientName: client.nom,
      });
      logActivity("Document mis à jour", `${data.type === 'facture' ? 'Facture' : 'Devis'} ${editingInvoice.numero} pour ${client.nom}`);
      toast({ title: "Mis à jour", description: "Le document a été modifié avec succès" });
    } else {
      addInvoice({
        ...data,
        clientName: client.nom,
        paye: 0,
        status: "non_payée"
      });
      logActivity("Document créé", `${data.type === 'facture' ? 'Facture' : 'Devis'} pour ${client.nom}`);
      toast({ title: "Document créé", description: "Le document a été généré avec succès" });
    }
    
    setEditingInvoice(null);
    setDialogOpen(false);
  };

  const handleStatusChange = (invoice: Invoice, newStatus: Invoice["status"]) => {
    let newPaye = invoice.paye;
    
    if (newStatus === "payée") {
      newPaye = invoice.montantTTC;
    } else if (newStatus === "non_payée") {
      newPaye = 0;
    } else if (newStatus === "partielle") {
      newPaye = invoice.status === "non_payée" ? invoice.montantTTC / 2 : invoice.paye;
    }

    updateInvoice(invoice.id, { status: newStatus, paye: newPaye });
    logActivity("Statut modifié", `${invoice.numero} passé en ${newStatus}`);
    toast({ title: "Statut mis à jour", description: `La facture ${invoice.numero} est maintenant marquée comme ${newStatus}.` });
  };

  const handleEdit = (inv: Invoice) => {
    setEditingInvoice(inv);
    setDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingInvoice(null);
    setDialogOpen(true);
  };

  const filtered = invoices.filter(
    (i) => !i.archived && (
      i.numero.toLowerCase().includes(search.toLowerCase()) || 
      i.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (i.type || 'facture').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Factures & Devis"
        description="Gestion et suivi des documents commerciaux d'Apress Mali"
        action={
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingInvoice(null);
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAdd} className="shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" /> Nouveau document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">
                  {editingInvoice ? `Modifier ${editingInvoice.numero}` : "Créer un document"}
                </DialogTitle>
              </DialogHeader>
              <InvoiceForm 
                onSubmit={handleCreateOrUpdate} 
                onCancel={() => setDialogOpen(false)} 
                initialData={editingInvoice}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par numéro, client ou type..." 
            value={search} 
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchParams(e.target.value ? { search: e.target.value } : {});
            }} 
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
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Référence</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Client</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">Total TTC</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-center">Statut</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Search className="h-10 w-10 opacity-20" />
                    <p className="text-sm font-medium">Aucun document trouvé.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inv) => {
                const cfg = statusConfig[inv.status as keyof typeof statusConfig];
                return (
                  <TableRow key={inv.id} className="animate-fade-in hover:bg-muted/10 transition-colors group">
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      {inv.numero}
                      <Badge variant="outline" className="ml-2 text-[8px] uppercase px-1 py-0 border-primary/20 text-primary/70">
                        {inv.type || 'facture'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm">{inv.clientName}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-black text-sm">{formatCurrency(inv.montantTTC)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                            <Badge variant={cfg?.variant} className={cn("text-[10px] uppercase font-black tracking-tighter px-2 py-1 cursor-pointer hover:opacity-80 transition-all", cfg?.className)}>
                              {cfg?.label}
                            </Badge>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="rounded-xl font-bold">
                          <DropdownMenuLabel className="text-[10px] uppercase opacity-50">Changer le statut</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-success focus:text-success" onClick={() => handleStatusChange(inv, "payée")}>
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Marquer comme PAYÉE
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-warning focus:text-warning" onClick={() => handleStatusChange(inv, "partielle")}>
                            <Clock className="h-4 w-4 mr-2" /> Marquer comme MOITIÉ (Partielle)
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleStatusChange(inv, "non_payée")}>
                            <ShieldAlert className="h-4 w-4 mr-2" /> Marquer comme NON PAYÉE
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                          onClick={() => handleEdit(inv)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl font-bold">
                            <DropdownMenuItem onClick={() => navigate(`/payments?invoiceId=${inv.id}`)}>
                              <Wallet className="h-4 w-4 mr-2" /> Enregistrer paiement
                            </DropdownMenuItem>
                            {isSuperviseur && (
                              <>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                      <Trash2 className="h-4 w-4 mr-2" /> Archiver le document
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-2xl">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-xl font-bold">Confirmer l'archivage ?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Le document {inv.numero} sera masqué mais restera consultable dans les archives.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => archiveItem("invoices", inv.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">Confirmer</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        <DialogContent className="sm:max-w-[850px] rounded-none p-0 overflow-hidden border-none shadow-2xl bg-white">
          {previewInvoice && (
            <div className="flex flex-col h-full max-h-[98vh]">
              <div className="flex-1 overflow-y-auto p-10 print:p-0 bg-white" id="printable-invoice">
                {/* Official Header */}
                <div className="flex justify-between items-start border-b-4 border-primary pb-8">
                  <div className="flex flex-col gap-4">
                    <div className="w-32 h-32 flex items-center justify-start">
                      <img src={logo} alt="APRESS MALI" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">{settings.companyName}</h2>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Société à Responsabilité Limitée</p>
                    </div>
                  </div>
                  <div className="text-right space-y-3 pt-2">
                    <div className="space-y-0.5">
                      <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Siège Social</h3>
                      <p className="text-[11px] font-bold text-slate-800 leading-tight">
                        Immeuble ABK III, 1er étage, Porte 102<br />
                        Hamdallaye ACI 2000, Bamako<br />
                        République du Mali
                      </p>
                    </div>
                    <div className="space-y-0.5 pt-1">
                      <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Contacts & Identifiants</h3>
                      <p className="text-[11px] font-bold text-slate-800">
                        Tél: 20 29 39 53 / Fax: 20 29 21 35<br />
                        NIF: {settings.companyNif} | NINA: {settings.companyNina || "40609194223321A"}<br />
                        RCCM: {settings.companyRCCM}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="py-8 space-y-8">
                  <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                      <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                        {previewInvoice.type === 'devis' ? 'DEVIS' : 'FACTURE'}
                      </h1>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-primary">{previewInvoice.numero}</span>
                        <span className="text-xs font-bold text-slate-400">| Du {formatDate(previewInvoice.date)}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date d'échéance</p>
                      <p className="text-sm font-black text-destructive italic">{formatDate(previewInvoice.echeance)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Building2 className="h-4 w-4" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Facturé à :</h3>
                      </div>
                      <div className="pl-6 border-l-2 border-slate-100 space-y-1">
                        <p className="text-xl font-black text-slate-900">{previewInvoice.clientName}</p>
                        <p className="text-xs font-medium text-slate-500">{previewInvoice.clientAdresse || "Adresse non renseignée"}</p>
                        <div className="flex flex-col gap-1 pt-2">
                          <p className="text-[11px] font-bold text-slate-700 flex items-center gap-2"><Phone className="h-3 w-3 opacity-30" /> {previewInvoice.clientTelephone || "-"}</p>
                          <p className="text-[11px] font-bold text-slate-700 flex items-center gap-2"><Mail className="h-3 w-3 opacity-30" /> {previewInvoice.clientEmail || "-"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex flex-col justify-center items-center text-center space-y-2">
                      <CreditCard className="h-8 w-8 text-primary opacity-20" />
                      <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Total Net à payer</p>
                      <h2 className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(previewInvoice.montantTTC)}</h2>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader className="bg-slate-900">
                        <TableRow className="hover:bg-slate-900 border-none">
                          <TableHead className="text-white font-black uppercase text-[9px] tracking-widest py-4 pl-6">Description des services</TableHead>
                          <TableHead className="text-white text-center font-black uppercase text-[9px] tracking-widest py-4">Qté</TableHead>
                          <TableHead className="text-white text-right font-black uppercase text-[9px] tracking-widest py-4">P.U (HT)</TableHead>
                          <TableHead className="text-white text-right font-black uppercase text-[9px] tracking-widest py-4 pr-6">Total (HT)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewInvoice.items.map((item: InvoiceItem, idx: number) => (
                          <TableRow key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                            <TableCell className="font-bold text-xs py-5 pl-6">{item.serviceName}</TableCell>
                            <TableCell className="text-center font-black text-slate-400 text-xs">{item.quantite}</TableCell>
                            <TableCell className="text-right text-slate-600 font-bold text-xs">{formatCurrency(item.prixUnitaire)}</TableCell>
                            <TableCell className="text-right font-black text-slate-900 text-xs pr-6">{formatCurrency(item.montant)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Totals & Banking */}
                  <div className="grid grid-cols-12 gap-8 pt-4">
                    <div className="col-span-7 space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Coordonnées Bancaires</h3>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Banque BDM-SA</p>
                              <p className="text-xs font-mono font-bold text-slate-900">ML016 01201 020401004992-60</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-200">
                            <p className="text-[10px] font-bold text-slate-500 italic">
                              Référence à indiquer : <span className="text-primary not-italic font-black">{previewInvoice.paymentReference || previewInvoice.numero}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Badge variant="outline" className="text-[9px] font-black border-slate-200 text-slate-400">BP E1466</Badge>
                        <Badge variant="outline" className="text-[9px] font-black border-slate-200 text-slate-400 uppercase">specialprestamali@hotmail.com</Badge>
                      </div>
                    </div>

                    <div className="col-span-5 bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-xl" />
                      <div className="space-y-4 relative">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
                          <span>Total HT</span>
                          <span>{formatCurrency(previewInvoice.sousTotal)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50 pb-4 border-b border-white/10">
                          <span>TVA ({previewInvoice.tva}%)</span>
                          <span>{formatCurrency(previewInvoice.tvaMontant)}</span>
                        </div>
                        <div className="flex justify-between pt-2 items-baseline">
                          <span className="font-black uppercase text-xs tracking-tighter text-primary">TOTAL TTC</span>
                          <span className="text-3xl font-black tracking-tighter text-white">
                            {formatCurrency(previewInvoice.montantTTC)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-slate-100 text-center space-y-4">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] max-w-lg mx-auto leading-relaxed">
                    Assistance • Conseil • Gestion • Contrôle • Formation • Services
                  </p>
                  <div className="flex justify-center items-center gap-8 opacity-20">
                    <div className="h-px w-20 bg-slate-400" />
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-400 italic">Document Officiel APRESS MALI</p>
                    <div className="h-px w-20 bg-slate-400" />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-8 bg-slate-50 border-t flex justify-center gap-4 no-print">
                <Button variant="outline" onClick={() => setPreviewInvoice(null)} className="h-14 px-8 rounded-2xl font-bold">
                  Fermer
                </Button>
                <Button onClick={handlePrint} className="gap-3 rounded-2xl h-14 px-12 font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                  <Printer className="h-6 w-6" /> Imprimer / PDF
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