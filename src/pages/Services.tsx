import { useState, useMemo } from "react";
import { Plus, Briefcase, Search, Filter, Pencil, Trash2, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const ITEMS_PER_PAGE = 8;

const Services = () => {
  const { categories, services, addService, deleteService, archiveItem } = useData();
  const { toast } = useToast();
  
  // UI State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [nom, setNom] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [prix, setPrix] = useState("");
  const [description, setDescription] = useState("");

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
    setNom(""); setCategorieId(""); setPrix(""); setDescription("");
    setServiceDialogOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setNom(service.nom);
    setCategorieId(service.categorieId);
    setPrix(service.prix.toString());
    setDescription(service.description);
    setServiceDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      // Logic for Update could be added to DataContext, 
      // but for now let's just use addService for new ones
      toast({ title: "Note", description: "Mise à jour à implémenter dans le context." });
    } else {
      addService({ nom, categorieId, prix: Number(prix), description });
      toast({ title: "Succès", description: "Service ajouté au catalogue" });
    }
    setServiceDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      archiveItem("services", deleteId);
      toast({ title: "Supprimé", description: "Le service a été retiré du catalogue" });
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalogue de Services"
        description="Gérez vos prestations et tarifs par catégorie"
        action={
          <Button onClick={handleOpenAdd} className="shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" /> Nouveau Service
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/20 p-4 rounded-xl border border-border/50">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un service..." 
            className="pl-10 h-10 bg-background" 
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

      <div className="glass-card rounded-xl overflow-hidden border border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-bold py-4">Désignation du Service</TableHead>
              <TableHead className="font-bold">Catégorie</TableHead>
              <TableHead className="text-right font-bold">Tarif (FCFA)</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Aucun service trouvé pour ces critères.
                </TableCell>
              </TableRow>
            ) : (
              paginatedServices.map((service) => {
                const cat = categories.find(c => c.id === service.categorieId);
                return (
                  <TableRow key={service.id} className="group animate-fade-in hover:bg-primary/5 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{service.nom}</span>
                        {service.description && (
                          <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1 italic">
                            {service.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-background font-normal text-[10px] uppercase tracking-wider">
                        {cat?.nom || "Non classé"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-primary">
                      {service.prix > 0 ? service.prix.toLocaleString() : "Sur devis"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(service)} className="cursor-pointer">
                            <Pencil className="h-4 w-4 mr-2" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteId(service.id)} 
                            className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
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
          <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/5">
            <p className="text-xs text-muted-foreground">
              Affichage de {Math.min(filteredServices.length, ITEMS_PER_PAGE)} services sur {filteredServices.length}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
              </Button>
              <div className="flex items-center gap-1 mx-2">
                <span className="text-xs font-bold text-primary">{currentPage}</span>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-xs text-muted-foreground">{totalPages}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? "Modifier le Service" : "Nouveau Service"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 pt-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label>Désignation du service</Label>
              <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Gestion de la paie" required />
            </div>
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <Select value={categorieId} onValueChange={setCategorieId} required>
                <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tarif indicatif (FCFA)</Label>
              <Input type="number" value={prix} onChange={(e) => setPrix(e.target.value)} placeholder="0" />
              <p className="text-[10px] text-muted-foreground italic">Laissez à 0 pour un tarif variable sur devis.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Description / Notes</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Détails optionnels" />
            </div>
            <Button type="submit" className="w-full h-11 shadow-lg shadow-primary/20">
              {editingService ? "Mettre à jour" : "Enregistrer le Service"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Ce service sera archivé et ne pourra plus être sélectionné pour de nouvelles factures.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmer l'archivage
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Services;
