import { useState, useMemo } from "react";
import { Plus, Search, CreditCard, Calendar, ArrowUpRight, CheckCircle2, Wallet, Receipt, Filter } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, cn } from "@/lib/utils";

const Payments = () => {
  const { payments, invoices, addPayment } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form states
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>("Espèces");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");

  const selectedInvoice = useMemo(() => invoices.find(i => i.id === invoiceId), [invoices, invoiceId]);
  const resteAPayer = selectedInvoice ? selectedInvoice.montantTTC - selectedInvoice.paye : 0;

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = Number(amount);
    if (!invoiceId || numAmount <= 0) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }

    addPayment({ 
      invoiceId, 
      amount: numAmount, 
      date, 
      method, 
      reference 
    });

    toast({ 
      title: "Encaissement validé", 
      description: `Le versement de ${formatCurrency(numAmount)} pour la facture ${selectedInvoice?.numero} a été enregistré.` 
    });
    
    setInvoiceId(""); setAmount(""); setReference("");
    setDialogOpen(false);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const inv = invoices.find(i => i.id === p.invoiceId);
      return inv?.numero.toLowerCase().includes(search.toLowerCase()) || 
             inv?.clientName.toLowerCase().includes(search.toLowerCase()) ||
             p.method.toLowerCase().includes(search.toLowerCase()) ||
             p.reference?.toLowerCase().includes(search.toLowerCase());
    });
  }, [payments, invoices, search]);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Gestion des Paiements"
        description={`${payments.length} transactions enregistrées dans votre système`}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" /> Enregistrer un versement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black flex items-center gap-2">
                  <Wallet className="h-6 w-6 text-primary" /> Nouveau Paiement
                </DialogTitle>
              </DialogHeader>
              <form className="space-y-5 pt-4" onSubmit={handleAddPayment}>
                <div className="space-y-2">
                  <Label className="font-bold">Facture à régler</Label>
                  <Select value={invoiceId} onValueChange={setInvoiceId}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Sélectionner une facture en attente" /></SelectTrigger>
                    <SelectContent>
                      {invoices.filter(i => i.status !== "payée" && !i.archived).map((inv) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.numero} – {inv.clientName} ({formatCurrency(inv.montantTTC - inv.paye)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedInvoice && (
                  <Card className="bg-primary/5 border-primary/10 overflow-hidden">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-medium uppercase tracking-wider">Montant Facturé</span>
                        <span className="font-bold">{formatCurrency(selectedInvoice.montantTTC)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-medium uppercase tracking-wider">Déjà Encaissé</span>
                        <span className="font-bold text-success">{formatCurrency(selectedInvoice.paye)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-primary/20">
                        <span className="text-xs font-black uppercase text-primary tracking-widest">Reste à percevoir</span>
                        <span className="text-lg font-black text-primary">{formatCurrency(resteAPayer)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label className="font-bold">Montant versé (FCFA)</Label>
                  <Input 
                    type="number" 
                    className="h-12 text-lg font-black"
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="Saisir le montant reçu" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Mode</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Espèces">Espèces</SelectItem>
                        <SelectItem value="Chèque">Chèque</SelectItem>
                        <SelectItem value="Virement">Virement</SelectItem>
                        <SelectItem value="Orange Money">Orange Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Date</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Référence (N° Chèque, Transaction...)</Label>
                  <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Optionnel" className="h-11" />
                </div>

                <Button type="submit" className="w-full h-12 font-bold shadow-xl shadow-primary/20 mt-4">
                  Confirmer l'encaissement
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par facture, client ou mode..." 
            className="pl-10 bg-muted/20 border-none focus-visible:ring-1" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPayments.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-muted/10 rounded-3xl border border-dashed flex flex-col items-center gap-4">
            <Receipt className="h-16 w-16 opacity-10" />
            <p className="text-muted-foreground font-medium">Aucun versement ne correspond à votre recherche.</p>
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const inv = invoices.find(i => i.id === payment.invoiceId);
            return (
              <Card key={payment.id} className="glass-card group overflow-hidden border-border/50 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 animate-fade-in relative">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-success/5 text-success group-hover:bg-success group-hover:text-success-foreground transition-all duration-300">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Versement reçu</p>
                        <h3 className="font-black text-xl tracking-tighter group-hover:text-primary transition-colors">{formatCurrency(payment.amount)}</h3>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-widest bg-muted/50">{payment.method}</Badge>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/20 p-2.5 rounded-xl">
                      <CreditCard className="h-4 w-4 text-primary/50" />
                      <span className="font-medium">Facture: <span className="text-foreground font-black">{inv?.numero || "Inconnue"}</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/20 p-2.5 rounded-xl">
                      <ArrowUpRight className="h-4 w-4 text-primary/50" />
                      <span className="truncate font-medium">Client: <span className="text-foreground font-bold">{inv?.clientName || "Inconnu"}</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/20 p-2.5 rounded-xl">
                      <Calendar className="h-4 w-4 text-primary/50" />
                      <span className="font-medium italic">Le {new Date(payment.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {payment.reference && (
                    <div className="mt-6 pt-4 border-t border-dashed">
                      <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-1">
                        <Filter className="h-3 w-3" /> Référence Transaction
                      </p>
                      <div className="bg-muted/30 p-2.5 rounded-lg border text-[11px] font-mono text-center">
                        {payment.reference}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Payments;
