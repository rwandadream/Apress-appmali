import { useState } from "react";
import { Plus, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Payment {
  id: string;
  facture: string;
  client: string;
  date: string;
  montant: number;
  mode: "especes" | "virement" | "cheque";
  reference?: string;
}

const mockPayments: Payment[] = [
  { id: "1", facture: "APM-2026-001", client: "Société Alpha", date: "2026-01-20", montant: 1250000, mode: "virement" },
  { id: "2", facture: "APM-2026-002", client: "Enterprise Beta", date: "2026-02-05", montant: 400000, mode: "especes" },
  { id: "3", facture: "APM-2026-004", client: "Delta Services", date: "2026-02-15", montant: 500000, mode: "cheque", reference: "CHQ-78901" },
];

const modeLabels: Record<string, string> = {
  especes: "Espèces",
  virement: "Virement",
  cheque: "Chèque",
};

const modeColors: Record<string, string> = {
  especes: "bg-success/10 text-success",
  virement: "bg-info/10 text-info",
  cheque: "bg-warning/10 text-warning",
};

const Payments = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState("");

  const filtered = mockPayments.filter(
    (p) => p.facture.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        description="Suivi des encaissements"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nouveau paiement</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enregistrer un paiement</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setDialogOpen(false); }}>
                <div className="space-y-1.5">
                  <Label>Facture</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Sélectionner une facture" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APM-2026-002">APM-2026-002 – Enterprise Beta (450 000 FCFA restant)</SelectItem>
                      <SelectItem value="APM-2026-003">APM-2026-003 – Groupe Gamma (2 100 000 FCFA)</SelectItem>
                      <SelectItem value="APM-2026-005">APM-2026-005 – Société Alpha (750 000 FCFA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Montant (FCFA)</Label>
                    <Input type="number" placeholder="0" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input type="date" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Mode de paiement</Label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="especes">Espèces</SelectItem>
                      <SelectItem value="virement">Virement bancaire</SelectItem>
                      <SelectItem value="cheque">Chèque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {mode === "cheque" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>N° de chèque</Label>
                      <Input placeholder="CHQ-XXXXX" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Banque émettrice</Label>
                      <Input placeholder="Nom de la banque" />
                    </div>
                  </div>
                )}
                <Button type="submit" className="w-full">Enregistrer le paiement</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher par facture ou client..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Facture</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Référence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} className="animate-fade-in">
                <TableCell className="font-mono font-medium text-sm">{p.facture}</TableCell>
                <TableCell>{p.client}</TableCell>
                <TableCell className="text-muted-foreground">{p.date}</TableCell>
                <TableCell className="text-right font-medium">{p.montant.toLocaleString()} FCFA</TableCell>
                <TableCell>
                  <Badge variant="outline" className={modeColors[p.mode]}>{modeLabels[p.mode]}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.reference || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Payments;
