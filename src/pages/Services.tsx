import { useState, useMemo, useCallback } from "react";
import { Plus, Search, Filter, Pencil, Trash2, ChevronLeft, ChevronRight, MoreVertical, Briefcase, Tag, Info, Settings2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useData, Service } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 8;

const serviceSchema = z.object({
  nom: z.string().min(3, "Le nom doit avoir au moins 3 caractères"),
  categorieId: z.string().min(1, "Catégorie requise"),
  prix: z.number().min(0, "Le prix ne peut pas être négatif"),
  description: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

const Services = () => {
  const { categories, services, addService, updateService, archiveItem, addCategory } = useData();
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { nom: "", categorieId: "", prix: 0, description: "" },
  });

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      if (s.archived) return false;
      const matchesSearch = s.nom.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || s.categorieId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [services, search, categoryFilter]);

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredServices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredServices, currentPage]);

  const handleOpenAdd = () => {
    setEditingService(null);
    form.reset({ nom: "", categorieId: "", prix: 0, description: "" });
    setServiceDialogOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    form.reset({ 
      nom: service.nom, 
      categorieId: service.categorieId, 
      prix: service.prix, 
      description: service.description || "" 
    });
    setServiceDialogOpen(true);
  };

  const onSubmit = (values: ServiceFormValues) => {
    if (editingService) {
      updateService(editingService.id, values);
      toast({ title: "Service mis à jour", description: "Les modifications ont été enregistrées." });
    } else {
      addService(values);
      toast({ title: "Succès", description: "Le service a été ajouté au catalogue." });
    }
    setServiceDialogOpen(false);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim().length < 2) return;
    addCategory({ nom: newCategoryName.trim().toUpperCase() });
    setNewCategoryName("");
    toast({ title: "Catégorie ajoutée", description: "La nouvelle catégorie est disponible." });
  };

  const handleDelete = () => {
    if (deleteId) {
      archiveItem("services", deleteId);
      toast({ title: "Supprimé", description: "Le service a été retiré du catalogue." });
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      <PageHeader
        title="Services"
        description="Catalogue des prestations"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCategoryDialogOpen(true)} className="gap-2 hidden sm:flex">
              <Settings2 className="h-4 w-4" /> Catégories
            </Button>
            <Button size="sm" onClick={handleOpenAdd} className="gap-2">
              <Plus className="h-4 w-4" /> <span className="hidden xs:inline">Nouveau</span>
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher..." 
            className="pl-10 bg-muted/20 border-none h-10" 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full bg-background h-10">
              <SelectValue placeholder="Catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les services</SelectItem>
              {categories.filter(c => !c.archived).map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setCategoryDialogOpen(true)} className="sm:hidden shrink-0">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-border shadow-md overflow-hidden">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-bold uppercase text-[10px] tracking-widest whitespace-nowrap">Désignation</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest whitespace-nowrap">Catégorie</TableHead>
                <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest whitespace-nowrap">Tarif</TableHead>
                <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-10 w-10 opacity-10" />
                      <p className="text-sm font-medium">Aucun service trouvé.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedServices.map((service) => {
                  const cat = categories.find(c => c.id === service.categorieId);
                  return (
                    <TableRow key={service.id} className="hover:bg-muted/5 transition-colors">
                      <TableCell className="min-w-[180px]">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{service.nom}</span>
                          {service.description && <span className="text-[10px] text-muted-foreground line-clamp-1">{service.description}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tighter truncate max-w-[100px]">
                          {cat?.nom || "Indéfini"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-black text-sm whitespace-nowrap">
                        {service.prix > 0 ? formatCurrency(service.prix) : "DEVIS"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl font-bold">
                            <DropdownMenuItem onClick={() => handleEdit(service)} className="gap-2">
                              <Pencil className="h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteId(service.id)} className="text-destructive focus:text-destructive gap-2">
                              <Trash2 className="h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{filteredServices.length} items</span>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-bold">{currentPage} / {totalPages}</span>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs remain similar but with improved mobile styling */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Catégories</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <Input placeholder="Nouvelle catégorie..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="h-10 font-bold" />
              <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()} size="icon" className="shrink-0"><Plus className="h-4 w-4" /></Button>
            </div>
            <ScrollArea className="h-60 pr-2">
              {categories.filter(c => !c.archived).map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 mb-2 rounded-lg bg-muted/30 border border-border/50">
                  <span className="text-xs font-bold uppercase">{cat.nom}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/50" onClick={() => archiveItem("categories", cat.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">{editingService ? "Modifier" : "Nouveau Service"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <FormField control={form.control} name="nom" render={({ field }) => (
                <FormItem><FormLabel className="font-bold text-xs">Désignation</FormLabel><FormControl><Input placeholder="Nom du service" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="categorieId" render={({ field }) => (
                <FormItem><FormLabel className="font-bold text-xs">Catégorie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                    <SelectContent>{categories.filter(c => !c.archived).map(c => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="prix" render={({ field }) => (
                <FormItem><FormLabel className="font-bold text-xs">Tarif (FCFA)</FormLabel>
                  <FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full h-11 font-bold mt-2">Enregistrer</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="w-[95vw] max-w-sm rounded-2xl">
          <AlertDialogHeader><AlertDialogTitle>Confirmer ?</AlertDialogTitle><AlertDialogDescription>Voulez-vous archiver ce service ?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive rounded-xl">Archiver</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Services;
