import { useState } from "react";
import { Plus, Trash2, Shield, User } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const UsersPage = () => {
  const { users, user: currentUser, addUser, deleteUser } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("employee");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.find((u) => u.email === email)) {
      toast({ title: "Erreur", description: "Cet email existe déjà", variant: "destructive" });
      return;
    }
    addUser({ nom, prenom, email, role });
    toast({ title: "Succès", description: `Compte créé pour ${prenom} ${nom}` });
    setNom(""); setPrenom(""); setEmail(""); setRole("employee");
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des utilisateurs"
        description={`${users.length} utilisateurs enregistrés`}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nouvel utilisateur</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouvel utilisateur</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nom</Label>
                    <Input value={nom} onChange={(e) => setNom(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Prénom</Label>
                    <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Rôle</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="superviseur">Superviseur</SelectItem>
                      <SelectItem value="employee">Employé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">Mot de passe par défaut : employe123</p>
                <Button type="submit" className="w-full">Créer le compte</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="animate-fade-in">
                <TableCell className="font-medium">{u.prenom} {u.nom}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "superviseur" ? "default" : "secondary"} className="gap-1">
                    {u.role === "superviseur" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {u.role === "superviseur" ? "Superviseur" : "Employé"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {u.id !== currentUser?.id ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Le compte de {u.prenom} {u.nom} sera définitivement supprimé.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => {
                            deleteUser(u.id);
                            toast({ title: "Utilisateur supprimé" });
                          }}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <span className="text-xs text-muted-foreground">Vous</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsersPage;
