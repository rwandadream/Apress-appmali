import { useState } from "react";
import { Plus, Search, Download, Eye } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Invoice {
  id: string;
  numero: string;
  client: string;
  date: string;
  echeance: string;
  montant: number;
  paye: number;
  status: "payée" | "partielle" | "non_payée";
}

const mockInvoices: Invoice[] = [
  { id: "1", numero: "APM-2026-001", client: "Société Alpha", date: "2026-01-15", echeance: "2026-02-15", montant: 1250000, paye: 1250000, status: "payée" },
  { id: "2", numero: "APM-2026-002", client: "Enterprise Beta", date: "2026-01-20", echeance: "2026-02-20", montant: 850000, paye: 400000, status: "partielle" },
  { id: "3", numero: "APM-2026-003", client: "Groupe Gamma", date: "2026-02-01", echeance: "2026-03-01", montant: 2100000, paye: 0, status: "non_payée" },
  { id: "4", numero: "APM-2026-004", client: "Delta Services", date: "2026-02-10", echeance: "2026-03-10", montant: 500000, paye: 500000, status: "payée" },
  { id: "5", numero: "APM-2026-005", client: "Société Alpha", date: "2026-03-01", echeance: "2026-04-01", montant: 750000, paye: 0, status: "non_payée" },
];

const statusConfig = {
  payée: { label: "Payée", variant: "default" as const, className: "bg-success text-success-foreground" },
  partielle: { label: "Partielle", variant: "outline" as const, className: "border-warning text-warning" },
  non_payée: { label: "Non payée", variant: "destructive" as const, className: "" },
};

const Invoices = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = mockInvoices.filter(
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
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nouvelle facture</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setDialogOpen(false); }}>
                <div className="space-y-1.5">
                  <Label>Client</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Société Alpha</SelectItem>
                      <SelectItem value="2">Enterprise Beta</SelectItem>
                      <SelectItem value="3">Groupe Gamma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Date de facturation</Label>
                    <Input type="date" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date d'échéance</Label>
                    <Input type="date" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Service</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un service" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Gestion de la paie - 250 000 FCFA</SelectItem>
                      <SelectItem value="2">Recrutement - 500 000 FCFA</SelectItem>
                      <SelectItem value="3">Assistance admin. - 150 000 FCFA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Quantité</Label>
                    <Input type="number" defaultValue={1} min={1} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>TVA (%)</Label>
                    <Input type="number" defaultValue={18} />
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
              <TableHead className="text-right">Montant</TableHead>
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
                  <TableCell className="text-right font-medium">{inv.montant.toLocaleString()} FCFA</TableCell>
                  <TableCell className="text-right">{inv.paye.toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    <Badge variant={cfg.variant} className={cfg.className}>{cfg.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Invoices;
