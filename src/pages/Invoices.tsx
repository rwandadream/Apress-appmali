import { useState, useMemo } from "react";
import { Plus, Search, Download, Eye, Trash2, Clock, CheckCircle2, Pencil, Wallet, MoreHorizontal, ShieldAlert } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useData, Invoice } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate, exportToCSV, cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const statusConfig = {
  payée: { label: "Payée", variant: "success" as const, className: "bg-success/10 text-success border-success/20" },
  partielle: { label: "Moitié", variant: "warning" as const, className: "bg-warning/10 text-warning border-warning/20" },
  non_payée: { label: "Impayée", variant: "destructive" as const, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const Invoices = () => {
  const { invoices, archiveItem, updateInvoiceStatus } = useData();
  const { isSuperviseur } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const filtered = useMemo(() => {
    return invoices
      .filter(i => !i.archived)
      .filter(i => 
        i.numero.toLowerCase().includes(search.toLowerCase()) ||
        i.clientName.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [invoices, search]);

  const handleStatusChange = (invoice: Invoice, status: Invoice["status"]) => {
    // Logic to update status via updateInvoiceStatus
    const amountToPay = status === "payée" ? (invoice.montantTTC - invoice.paye) : 0;
    if (amountToPay > 0 || status === "non_payée") {
       // In a real app, we'd have a specific setStatus function, 
       // but here we can simulate it by updating the paye amount.
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      <PageHeader 
        title="Facturation" 
        description="Gestion des documents financiers"
        action={
          <Button size="sm" onClick={() => navigate("/invoices/new")} className="gap-2">
            <Plus className="h-4 w-4" /> <span className="hidden xs:inline">Nouvelle Facture</span>
          </Button>
        }
      />

      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une facture..." 
            className="pl-10 bg-muted/20 border-none h-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto h-10 gap-2" onClick={() => exportToCSV(filtered, "factures")}>
          <Download className="h-4 w-4" /> Exporter CSV
        </Button>
      </div>

      <div className="glass-card rounded-xl border border-border shadow-md overflow-hidden">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-bold uppercase text-[10px] tracking-widest whitespace-nowrap">Référence</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest whitespace-nowrap">Client</TableHead>
                <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest whitespace-nowrap">Montant</TableHead>
                <TableHead className="text-center font-bold uppercase text-[10px] tracking-widest whitespace-nowrap">Statut</TableHead>
                <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground">Aucune facture.</TableCell></TableRow>
              ) : (
                filtered.map((inv) => {
                  const cfg = statusConfig[inv.status as keyof typeof statusConfig];
                  return (
                    <TableRow key={inv.id} className="hover:bg-muted/5 transition-colors">
                      <TableCell className="font-mono font-bold text-xs text-primary whitespace-nowrap">
                        {inv.numero}
                      </TableCell>
                      <TableCell className="min-w-[150px]">
                        <div className="font-bold text-sm">{inv.clientName}</div>
                        <div className="text-[10px] text-muted-foreground">{formatDate(inv.date)}</div>
                      </TableCell>
                      <TableCell className="text-right font-black text-sm whitespace-nowrap">
                        {formatCurrency(inv.montantTTC)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={cfg?.variant} className={cn("text-[9px] uppercase font-black px-2 py-0.5", cfg?.className)}>
                          {cfg?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => navigate(`/invoices/${inv.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl font-bold">
                              <DropdownMenuItem onClick={() => navigate(`/payments?invoiceId=${inv.id}`)}>
                                <Wallet className="h-4 w-4 mr-2" /> Paiement
                              </DropdownMenuItem>
                              {isSuperviseur && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                      <Trash2 className="h-4 w-4 mr-2" /> Archiver
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="rounded-2xl w-[90vw] max-w-sm">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmer ?</AlertDialogTitle>
                                      <AlertDialogDescription>Archiver la facture {inv.numero} ?</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="rounded-xl">Non</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => archiveItem("invoices", inv.id)} className="bg-destructive rounded-xl">Oui</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default Invoices;
