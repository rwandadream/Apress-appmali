import { useState, useMemo } from "react";
import { Plus, Search, CreditCard, Calendar, ArrowUpRight, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData, type Invoice } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

const Payments = () => {
  const { payments, addPayment } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Pour lier les paiements aux factures, nous devons récupérer les factures
  const invoices = useMemo<Invoice[]>(() => {
    const saved = localStorage.getItem("apress_invoices");
    return saved ? JSON.parse(saved) : [];
  }, []);

  // Form states
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>("Espèces");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Enregistrer le paiement
    addPayment({ 
      invoiceId, 
      amount: Number(amount), 
      date, 
      method, 
      reference 
    });

    // 2. Mettre à jour la facture correspondante (Persistance locale pour cette démo)
    const updatedInvoices = invoices.map((inv: Invoice) => {
      if (inv.id === invoiceId) {
        const newPaye = inv.paye + Number(amount);
        let newStatus = inv.status;
        if (newPaye >= inv.montantTTC) newStatus = "payée";
        else if (newPaye > 0) newStatus = "partielle";
        
        return { ...inv, paye: newPaye, status: newStatus };
      }
      return inv;
    });
    localStorage.setItem("apress_invoices", JSON.stringify(updatedInvoices));

    toast({ title: "Paiement enregistré", description: `Le versement de ${Number(amount).toLocaleString()} FCFA a été validé.` });
    setInvoiceId(""); setAmount(""); setReference("");
    setDialogOpen(false);
    
    // Forcer le rafraîchissement si nécessaire (dans une vraie app on utiliserait un Context global pour les factures)
    window.location.reload(); 
  };

  const filteredPayments = payments.filter(p => {
    const inv = invoices.find((i: Invoice) => i.id === p.invoiceId);
    return inv?.numero.toLowerCase().includes(search.toLowerCase()) || 
           inv?.clientName.toLowerCase().includes(search.toLowerCase());
  });

  const selectedInvoice = invoices.find((i: Invoice) => i.id === invoiceId);
  const resteAPayer = selectedInvoice ? selectedInvoice.montantTTC - selectedInvoice.paye : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        description="Suivi des encaissements et règlements clients"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Enregistrer un paiement</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouvel encaissement</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleAddPayment}>
                <div className="space-y-1.5">
                  <Label>Facture à régler</Label>
                  <Select value={invoiceId} onValueChange={setInvoiceId}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner une facture" /></SelectTrigger>
                    <SelectContent>
                      {invoices.filter((i: Invoice) => i.status !== "payée").map((inv: Invoice) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.numero} – {inv.clientName} (Reste: {(inv.montantTTC - inv.paye).toLocaleString()} FCFA)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedInvoice && (
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/10 text-xs space-y-1">
                    <p className="flex justify-between"><span>Total Facture:</span> <span className="font-bold">{selectedInvoice.montantTTC.toLocaleString()} FCFA</span></p>
                    <p className="flex justify-between text-destructive"><span>Reste à payer:</span> <span className="font-bold">{resteAPayer.toLocaleString()} FCFA</span></p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Montant versé (FCFA)</Label>
                  <Input 
                    type="number" 
                    max={resteAPayer}
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="0" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Mode de paiement</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Espèces">Espèces</SelectItem>
                        <SelectItem value="Chèque">Chèque</SelectItem>
                        <SelectItem value="Virement">Virement</SelectItem>
                        <SelectItem value="Orange Money">Orange Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Référence (N° Chèque, Transaction...)</Label>
                  <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Optionnel" />
                </div>

                <Button type="submit" className="w-full h-11">Confirmer le paiement</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Rechercher par facture ou client..." 
          className="pl-10" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPayments.length === 0 ? (
          <p className="text-muted-foreground text-sm col-span-full py-12 text-center bg-muted/20 rounded-xl border border-dashed">
            Aucun paiement enregistré pour le moment.
          </p>
        ) : (
          filteredPayments.map((payment) => {
            const inv = invoices.find((i: Invoice) => i.id === payment.invoiceId);
            return (
              <Card key={payment.id} className="glass-card hover:shadow-md transition-shadow animate-fade-in">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success/10 text-success">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Reçu de paiement</p>
                        <h3 className="font-bold text-lg">{payment.amount.toLocaleString()} FCFA</h3>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-muted/50">{payment.method}</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span>Facture: <span className="text-primary font-medium">{inv?.numero || "Inconnue"}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Le {new Date(payment.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>Client: <span className="text-foreground font-medium">{inv?.clientName || "Inconnu"}</span></span>
                    </div>
                  </div>

                  {payment.reference && (
                    <div className="mt-4 p-2 bg-muted/30 rounded border text-[11px] text-muted-foreground font-mono">
                      Réf: {payment.reference}
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
