import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Calendar, 
  Upload, 
  FolderOpen, 
  Info, 
  FileCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Eye,
  FileImage,
  ChevronRight,
  Download,
  History,
  FileSpreadsheet,
  Clock
} from "lucide-react";
import { exportToCSV } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData, Client, AppDocument } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { cn, generateId, generateNoteNumber, groupByYear, sortByDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { saveFile, getFile, deleteFile } from "@/lib/fileStorage";

const ClientCabinet = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, updateClient } = useData();
  const { toast } = useToast();
  
  // UI State
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Form State
  const [newDocName, setNewDocName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<{
    type: AppDocument["type"];
    annee?: number;
    categorie_admin?: AppDocument["categorie_admin"];
  } | null>(null);

  const client = useMemo(() => clients.find(c => c.id === id), [clients, id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!newDocName) setNewDocName(file.name.split('.')[0]);
      
      // Create local preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAddDocument = async () => {
    if (!client || !selectedSection || !selectedFile) return;

    // Validation de taille (5 Mo max pour performance locale)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop lourd",
        description: "La taille maximale est de 5 Mo pour le stockage local.",
        variant: "destructive"
      });
      return;
    }

    const fileId = generateId(); // ID unique pour IndexedDB
    const type_fichier: "pdf" | "image" = selectedFile.type.includes("pdf") ? "pdf" : "image";

    // Lecture et sauvegarde dans IndexedDB (Storage Lourd)
    const fileData = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(selectedFile);
    });

    await saveFile(fileId, fileData);

    const newDoc: AppDocument = {
      id: generateId(),
      clientId: client.id,
      nom: newDocName,
      type: selectedSection.type,
      annee: selectedSection.annee || new Date().getFullYear(),
      type_fichier,
      fileId, // On ne stocke que la référence ici
      dateAjout: new Date().toISOString(),
      categorie_admin: selectedSection.categorie_admin,
      numero: selectedSection.type === "note_service" ? generateNoteNumber(client.documents) : undefined
    };

    const updatedClient = { 
      ...client, 
      documents: [newDoc, ...client.documents] 
    };

    updateClient(client.id, updatedClient);
    toast({
      title: "Document ajouté",
      description: `${newDoc.nom} a été classé avec succès.`,
    });
    
    // Reset form
    setNewDocName("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsAddDocOpen(false);
    setSelectedSection(null);
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!client) return;
    const docToDelete = client.documents.find(d => d.id === docId);
    
    if (docToDelete) {
      await deleteFile(docToDelete.fileId); // Supprimer de IndexedDB
    }

    const updatedClient = {
      ...client,
      documents: client.documents.filter(d => d.id !== docId)
    };
    updateClient(client.id, updatedClient);
    toast({
      title: "Document supprimé",
      description: "Le document a été retiré du classeur.",
    });
  };

  const handleViewFile = async (doc: AppDocument) => {
    // Lazy Loading: On ne récupère le fichier que maintenant
    const fileData = await getFile(doc.fileId);

    if (fileData) {
      const newTab = window.open();
      if (newTab) {
        if (doc.type_fichier === "pdf") {
          newTab.document.write(
            `<iframe src="${fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
          );
        } else {
          newTab.document.write(
            `<html><body style="margin:0; display:flex; align-items:center; justify-content:center; background:#111;"><img src="${fileData}" style="max-width:100%; max-height:100%; object-fit:contain;"></body></html>`
          );
        }
      }
    } else {
      toast({ title: "Fichier introuvable", variant: "destructive" });
    }
  };

  // Filtered documents
  const filteredDocs = useMemo(() => {
    if (!client) return [];
    let docs = client.documents;
    
    if (activeTab !== "all") {
      docs = docs.filter(d => d.type === activeTab);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter(d => 
        d.nom.toLowerCase().includes(query) || 
        d.numero?.toLowerCase().includes(query)
      );
    }
    
    return sortByDate(docs);
  }, [client, activeTab, searchQuery]);

  const DocumentItem = ({ doc }: { doc: AppDocument }) => (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl group hover:bg-muted/50 transition-all border border-border/50 mb-2">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={cn(
          "p-2 rounded-lg bg-background shrink-0",
          doc.type_fichier === "pdf" ? "text-red-500" : "text-blue-500"
        )}>
          {doc.type_fichier === "pdf" ? <FileText className="h-4 w-4" /> : <FileImage className="h-4 w-4" />}
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm truncate">{doc.nom}</p>
            {doc.numero && <Badge variant="outline" className="text-[9px] h-4 font-mono">{doc.numero}</Badge>}
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-medium">
            Le {new Date(doc.dateAjout).toLocaleDateString()} • {doc.type_fichier.toUpperCase()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary hover:bg-primary/10" onClick={() => handleViewFile(doc)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDocument(doc.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (!client) return null;

  const notesDocs = filteredDocs.filter(d => d.type === "note_service");
  const inpsDocs = filteredDocs.filter(d => d.type === "inps");
  const lettreDocs = filteredDocs.filter(d => d.type === "lettre");
  const adminDocs = filteredDocs.filter(d => d.type === "administratif");

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Classeur Numérique
              <Badge className={cn(client.type_client === "contrat" ? "bg-primary" : "bg-secondary")}>
                {client.type_client === "contrat" ? "CONTRAT" : "HORS CONTRAT"}
              </Badge>
            </h1>
            <p className="text-muted-foreground font-medium">{client.nom}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un document..." 
              className="pl-9 rounded-full h-9 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar : Infos & Dossier Administratif */}
        <div className="space-y-6">
          <Card className="glass-card border-primary/20 overflow-hidden shadow-xl">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" /> Fiche Client
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Entreprise</Label>
                <div className="flex items-center gap-3 text-sm font-bold bg-muted/20 p-2 rounded-lg">
                  <Building2 className="h-4 w-4 text-primary" /> {client.nom}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Contact</Label>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <Mail className="h-3 w-3 text-muted-foreground" /> {client.email}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <Phone className="h-3 w-3 text-muted-foreground" /> {client.telephone}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Adresse</Label>
                  <div className="flex items-start gap-3 text-xs font-medium">
                    <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" /> {client.adresse}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tight">
                <FileCheck className="h-4 w-4 text-primary" /> Dossier Administratif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "NIF", key: "nif" },
                { label: "RCCM", key: "rccm" },
                { label: "NINA", key: "nina" },
                { label: "Compte Contribuable", key: "compte_contribuable" },
              ].map((field) => {
                const doc = adminDocs.find(d => d.categorie_admin === field.key);
                return (
                  <div key={field.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">{field.label}</Label>
                      {!doc && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 text-[9px] font-bold text-primary hover:bg-primary/5 px-1"
                          onClick={() => {
                            setSelectedSection({ 
                              type: "administratif", 
                              categorie_admin: field.key as AppDocument["categorie_admin"] 
                            });
                            setIsAddDocOpen(true);
                          }}
                        >
                          <Upload className="h-3 w-3 mr-1" /> Importer
                        </Button>
                      )}
                    </div>
                    {doc ? (
                      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border border-border/50 group">
                        <span className="text-[10px] font-bold truncate max-w-[100px]">{doc.nom}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => handleViewFile(doc)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteDocument(doc.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-8 border border-dashed rounded-lg flex items-center justify-center bg-muted/5 text-[9px] text-muted-foreground font-medium italic">
                        Document manquant
                      </div>
                    )}
                  </div>
                );
              })}
              
              <div className="pt-2 border-t border-border/50 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-[9px] font-black uppercase text-primary tracking-tighter">Autres pièces</Label>
                  <Button variant="ghost" size="sm" className="h-5 text-[9px] font-black" onClick={() => {
                    setSelectedSection({ type: "administratif", categorie_admin: "autre" });
                    setIsAddDocOpen(true);
                  }}>
                    <Plus className="h-3 w-3 mr-1" /> Ajouter
                  </Button>
                </div>
                <div className="space-y-1">
                  {adminDocs.filter(d => d.categorie_admin === "autre").map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg group">
                      <span className="text-[10px] font-medium truncate">{doc.nom}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => handleViewFile(doc)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content : Tabs & Documents */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-muted/50 p-1 rounded-2xl border border-border/50 w-full justify-start overflow-x-auto h-12">
              <TabsTrigger value="all" className="rounded-xl font-bold px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Tous les documents
                <Badge variant="secondary" className="ml-2 text-[10px]">{client.documents.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="note_service" className="rounded-xl font-bold px-6 data-[state=active]:bg-background">
                Notes de Service
                <Badge variant="secondary" className="ml-2 text-[10px]">{client.documents.filter(d => d.type === "note_service").length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="inps" className="rounded-xl font-bold px-6 data-[state=active]:bg-background">
                INPS
                <Badge variant="secondary" className="ml-2 text-[10px]">{client.documents.filter(d => d.type === "inps").length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="lettre" className="rounded-xl font-bold px-6 data-[state=active]:bg-background">
                Lettres
                <Badge variant="secondary" className="ml-2 text-[10px]">{client.documents.filter(d => d.type === "lettre").length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="journal" className="rounded-xl font-bold px-6 data-[state=active]:bg-background flex items-center gap-2 text-primary">
                <History className="h-4 w-4" />
                Journal d'activité
              </TabsTrigger>
            </TabsList>

            <div className="mt-8 space-y-8">
              {/* Journal d'activité (Timeline) */}
              <TabsContent value="journal" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Historique des classements</h3>
                    <p className="text-sm text-muted-foreground">Suivi chronologique des documents ajoutés au dossier.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full font-bold text-primary border-primary/20 hover:bg-primary/5"
                    onClick={() => {
                      const csvData = client.documents.map(d => ({
                        Date: new Date(d.dateAjout).toLocaleDateString(),
                        Nom: d.nom,
                        Type: d.type.toUpperCase(),
                        Année: d.annee || "-",
                        Numéro: d.numero || "N/A",
                        Fichier: d.type_fichier.toUpperCase()
                      }));
                      exportToCSV(csvData, `Registre_Documents_${client.nom.replace(/\s+/g, '_')}`);
                    }}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" /> Exporter le registre (CSV)
                  </Button>
                </div>

                <div className="relative pl-8 border-l-2 border-primary/20 space-y-8 pb-8">
                  {sortByDate(client.documents).map((doc, index) => (
                    <div key={doc.id} className="relative">
                      {/* Cercle sur la ligne */}
                      <div className="absolute -left-[41px] top-1 p-1 bg-background rounded-full border-2 border-primary">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      
                      <div className="bg-muted/20 p-4 rounded-2xl border border-border/50 hover:bg-muted/30 transition-all group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                            {formatDistanceToNow(new Date(doc.dateAjout), { addSuffix: true, locale: fr })}
                          </span>
                          <Badge variant="outline" className="text-[9px] font-bold">
                            {doc.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "p-3 rounded-xl bg-background",
                              doc.type_fichier === "pdf" ? "text-red-500 shadow-sm" : "text-blue-500 shadow-sm"
                            )}>
                              {doc.type_fichier === "pdf" ? <FileText className="h-5 w-5" /> : <FileImage className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="font-black text-sm">{doc.nom}</p>
                              {doc.numero && <p className="text-[10px] font-mono text-muted-foreground">{doc.numero}</p>}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => handleViewFile(doc)}>
                              <Eye className="h-4 w-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-destructive" onClick={() => handleDeleteDocument(doc.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {client.documents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <History className="h-12 w-12 mb-4 opacity-10" />
                      <p className="text-sm font-medium">Aucun historique disponible pour le moment.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              {/* Note de Service Section */}
              {(activeTab === "all" || activeTab === "note_service") && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter">
                      <FileText className="h-5 w-5 text-primary" /> Notes de Service
                    </h3>
                    <Button 
                      size="sm" 
                      className="rounded-full h-8 font-bold px-4 shadow-lg shadow-primary/20"
                      onClick={() => {
                        setSelectedSection({ type: "note_service" });
                        setIsAddDocOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Créer une note
                    </Button>
                  </div>
                  
                  {notesDocs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {notesDocs.map(doc => <DocumentItem key={doc.id} doc={doc} />)}
                    </div>
                  ) : (
                    <div className="h-24 border border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                      <p className="text-xs font-medium italic">Aucune note de service répertoriée</p>
                    </div>
                  )}
                </section>
              )}

              {/* INPS Section */}
              {(activeTab === "all" || activeTab === "inps") && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter">
                      <Calendar className="h-5 w-5 text-primary" /> Dossiers INPS
                    </h3>
                    <Button 
                      variant="outline"
                      size="sm" 
                      className="rounded-full h-8 font-bold"
                      onClick={() => {
                        const annee = prompt("Quelle année ?", new Date().getFullYear().toString());
                        if (annee) {
                          setSelectedSection({ type: "inps", annee: parseInt(annee) });
                          setIsAddDocOpen(true);
                        }
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Nouvelle année
                    </Button>
                  </div>
                  
                  {inpsDocs.length > 0 ? (
                    <Accordion type="multiple" className="w-full space-y-3">
                      {groupByYear(inpsDocs).map((group) => (
                        <AccordionItem key={group.annee} value={`inps-${group.annee}`} className="border-none">
                          <AccordionTrigger className="hover:no-underline bg-muted/20 px-6 py-3 rounded-2xl group">
                            <div className="flex items-center gap-4">
                              <span className="font-black text-sm tracking-widest">ANNÉE {group.annee}</span>
                              <Badge variant="outline" className="text-[10px] font-black bg-background">{group.documents.length} PIÈCES</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 px-2 space-y-2">
                            <Button 
                              variant="ghost" 
                              className="w-full border border-dashed rounded-xl mb-4 h-10 text-xs font-bold text-primary hover:bg-primary/5"
                              onClick={() => {
                                setSelectedSection({ type: "inps", annee: group.annee });
                                setIsAddDocOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" /> Ajouter un document ({group.annee})
                            </Button>
                            {group.documents.map(doc => <DocumentItem key={doc.id} doc={doc} />)}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div 
                      className="h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5 group hover:bg-muted/10 transition-all cursor-pointer"
                      onClick={() => {
                        const annee = prompt("Pour quelle année ?", new Date().getFullYear().toString());
                        if (annee) {
                          setSelectedSection({ type: "inps", annee: parseInt(annee) });
                          setIsAddDocOpen(true);
                        }
                      }}
                    >
                      <Plus className="h-8 w-8 mb-2 opacity-20 group-hover:opacity-50 transition-all" />
                      <p className="text-sm font-black uppercase tracking-widest opacity-40">Ajouter un document INPS</p>
                    </div>
                  )}
                </section>
              )}

              {/* Lettres Section */}
              {(activeTab === "all" || activeTab === "lettre") && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter">
                      <Mail className="h-5 w-5 text-primary" /> Correspondances / Lettres
                    </h3>
                    <Button 
                      variant="outline"
                      size="sm" 
                      className="rounded-full h-8 font-bold"
                      onClick={() => {
                        const annee = prompt("Quelle année ?", new Date().getFullYear().toString());
                        if (annee) {
                          setSelectedSection({ type: "lettre", annee: parseInt(annee) });
                          setIsAddDocOpen(true);
                        }
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Nouvelle année
                    </Button>
                  </div>
                  
                  {lettreDocs.length > 0 ? (
                    <Accordion type="multiple" className="w-full space-y-3">
                      {groupByYear(lettreDocs).map((group) => (
                        <AccordionItem key={group.annee} value={`lettre-${group.annee}`} className="border-none">
                          <AccordionTrigger className="hover:no-underline bg-muted/20 px-6 py-3 rounded-2xl group">
                            <div className="flex items-center gap-4">
                              <span className="font-black text-sm tracking-widest">CORRESPONDANCE {group.annee}</span>
                              <Badge variant="outline" className="text-[10px] font-black bg-background">{group.documents.length} LETTRES</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4 px-2 space-y-2">
                            <Button 
                              variant="ghost" 
                              className="w-full border border-dashed rounded-xl mb-4 h-10 text-xs font-bold text-primary hover:bg-primary/5"
                              onClick={() => {
                                setSelectedSection({ type: "lettre", annee: group.annee });
                                setIsAddDocOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" /> Ajouter une lettre ({group.annee})
                            </Button>
                            {group.documents.map(doc => <DocumentItem key={doc.id} doc={doc} />)}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div 
                      className="h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5 group hover:bg-muted/10 transition-all cursor-pointer"
                      onClick={() => {
                        const annee = prompt("Pour quelle année ?", new Date().getFullYear().toString());
                        if (annee) {
                          setSelectedSection({ type: "lettre", annee: parseInt(annee) });
                          setIsAddDocOpen(true);
                        }
                      }}
                    >
                      <Plus className="h-8 w-8 mb-2 opacity-20 group-hover:opacity-50 transition-all" />
                      <p className="text-sm font-black uppercase tracking-widest opacity-40">Ajouter une lettre</p>
                    </div>
                  )}
                </section>
              )}
            </div>
          </Tabs>
        </div>
      </div>

      {/* Dialog d'Ajout de Document */}
      <Dialog open={isAddDocOpen} onOpenChange={setIsAddDocOpen}>
        <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
          <DialogHeader className="pt-6">
            <DialogTitle className="text-2xl font-black tracking-tight">Ajouter au Classeur</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="docName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nom du document</Label>
              <Input 
                id="docName" 
                placeholder="Ex: Attestation de régularité..." 
                className="h-12 rounded-2xl border-muted bg-muted/20 focus:bg-background transition-all font-bold"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Importation</Label>
              <div className="relative group">
                <Input 
                  id="fileInput" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                />
                <Label 
                  htmlFor="fileInput" 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted rounded-[24px] cursor-pointer group-hover:border-primary/50 group-hover:bg-primary/5 transition-all overflow-hidden"
                >
                  {previewUrl ? (
                    selectedFile?.type.includes("pdf") ? (
                      <div className="flex flex-col items-center">
                        <FileText className="h-8 w-8 text-red-500 mb-2" />
                        <span className="text-xs font-bold text-muted-foreground">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-muted/50 rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tight">Glisser ou cliquer pour uploader</span>
                      <span className="text-[9px] text-muted-foreground mt-1">PDF, JPG, PNG (Max 5Mo)</span>
                    </div>
                  )}
                </Label>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-[24px] border border-primary/10 flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <FolderOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-primary tracking-widest">Section de classement</p>
                <p className="text-xs font-bold capitalize">
                  {selectedSection?.type.replace('_', ' ')} 
                  {selectedSection?.annee && ` • ${selectedSection.annee}`}
                  {selectedSection?.categorie_admin && ` • ${selectedSection.categorie_admin.replace('_', ' ')}`}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between pt-4">
            <Button variant="ghost" className="rounded-2xl font-bold px-6 h-12" onClick={() => {
              setIsAddDocOpen(false);
              setPreviewUrl(null);
            }}>
              Annuler
            </Button>
            <Button 
              className="rounded-2xl font-black px-10 h-12 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground" 
              onClick={handleAddDocument}
              disabled={!newDocName || !selectedFile}
            >
              Classer le document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientCabinet;
