import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Filter, Pencil, Trash2, ChevronLeft, ChevronRight, MoreVertical, Briefcase, Tag, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  const { categories, services, addService, updateService, archiveItem } = useData();
  const { toast } = useToast();
  
  // UI State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { nom: "", categorieId: "", prix: 0, description: "" },
  });

  // Logic: Filtering & Searching
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      if (s.archived) return false;
      const matchesSearch = s.nom.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || s.categorieId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [services, search, categoryFilter]);

  // Logic: Pagination
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
      description: service.description 
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

  const handleDelete = () => {
    if (deleteId) {
      archiveItem("services", deleteId);
      toast({ title: "Supprimé", description: "Le service a été retiré du catalogue." });
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Catalogue de Services"
        description="Gérez l'offre de prestations d'Apress Mali"
        action={
          <Button onClick={handleOpenAdd} className="shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" /> Nouveau Service
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une prestation..." 
            className="pl-10 h-10 bg-muted/20 border-none focus-visible:ring-1" 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full md:w-[250px] bg-background">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-border shadow-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-black uppercase text-[10px] tracking-widest py-5">Désignation du Service</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Catégorie</TableHead>
              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest">Tarif indicatif</TableHead>
              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-12 w-12 opacity-10" />
                    <p className="text-sm font-medium">Aucun service trouvé dans cette catégorie.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedServices.map((service) => {
                const cat = categories.find(c => c.id === service.categorieId);
                return (
                  <TableRow key={service.id} className="group animate-fade-in hover:bg-primary/5 transition-colors border-b">
                    <TableCell className="py-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-black text-sm text-foreground tracking-tight group-hover:text-primary transition-colors">{service.nom}</span>
                        {service.description && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Info className="h-3 w-3 opacity-50" />
                            <span className="line-clamp-1 italic">{service.description}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-muted text-[9px] uppercase font-black tracking-tighter px-2">
                        {cat?.nom || "Non classé"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-black text-sm text-primary">
                        {service.prix > 0 ? formatCurrency(service.prix) : "SUR DEVIS"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-2">
                          <DropdownMenuItem onClick={() => handleEdit(service)} className="cursor-pointer font-bold gap-2">
                            <Pencil className="h-4 w-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteId(service.id)} 
                            className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive font-bold gap-2"
                          >
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/5">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              {filteredServices.length} prestations au total
            </p>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 rounded-lg font-bold"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
              </Button>
              <div className="flex items-center gap-1 font-black text-xs">
                <span className="text-primary">{currentPage}</span>
                <span className="opacity-20">/</span>
                <span className="text-muted-foreground">{totalPages}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 rounded-lg font-bold"
              >
                Suivant <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <Tag className="h-6 w-6 text-primary" />
              {editingService ? "Modifier la prestation" : "Nouveau service"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Libellé du service</FormLabel>
                    <FormControl><Input placeholder="Ex: Audit de sécurité" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categorieId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Tarif indicatif (FCFA)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        className="font-bold h-11"
                        placeholder="Saisir tarif"
                        value={field.value === 0 ? "" : field.value}
                        onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                      />
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground italic font-medium">Mettre 0 pour afficher "SUR DEVIS".</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Description courte</FormLabel>
                    <FormControl><Input placeholder="Détails de la prestation..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20">
                {editingService ? "Mettre à jour le service" : "Enregistrer au catalogue"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Retirer du catalogue ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ce service sera archivé. Il restera visible sur les anciennes factures mais ne pourra plus être sélectionné pour les nouvelles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              Confirmer l'archivage
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Services;
