import { useState, useEffect } from "react";
import api from '../api/api';
import DeleteDialog from "./Form/DeleteDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus, Search, Edit, Trash2, Phone, Mail, User, Calendar, RefreshCw, Power, PowerOff, ChevronLeft,
  ChevronRight, TrendingUp, CreditCard, Package
} from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "../hooks/usePagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function PersonnelSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statsPersonnel, setStatsPersonnel] = useState(null);
  const [personnels, setPersonnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [personnelDelete, setPersonnelDelete] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [filterTab, setFilterTab] = useState("all")
  // Formulaire
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");

  // Dans votre composant
  const { currentPage, totalPages, currentData, setCurrentPage } =
    usePagination({ data: personnels, itemsPerPage: 10 });

  const getStatsPersonnels = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token non trouvé');
        return;
      }
      const response = await api.get('/dashboard');
      setStatsPersonnel(response.data.data);

      const responses = await api.get('/admin/showEmploye');
      setPersonnels(responses.data.data || []);
    } catch (error: any) {
      console.log('erreur de récupération', error);
      if (error.response?.status === 401) {
        toast.error('Token invalide ou expiré. Veuillez vous reconnecter');
      } else if (error.response?.status === 403) {
        toast.error('Accès refusé');
      } else {
        toast.error('Erreur lors du chargement des données');
      }
      setPersonnels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await getStatsPersonnels();
      toast.success('Données actualisées');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname || !email || !telephone || !adresse) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setIsSubmitting(true)
    try {
      const response = await api.post('/admin/createUser', {
        fullname,
        email,
        telephone,
        adresse
      });

      toast.success(response.data.message);
      resetForm();
      setDialogOpen(false);
      getStatsPersonnels();
    } catch (error: any) {
      console.error(error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de l'ajout de l'employé";
      toast.error(message);
    } finally {
      setIsSubmitting(false)
    }
  };

  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee);
    setFullName(employee.fullname || "");
    setEmail(employee.email || "");
    setTelephone(employee.telephone || "");
    setAdresse(employee.adresse || "");
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    if (!fullname || !email || !telephone || !adresse) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsSubmitting(true)
    try {
      const response = await api.put(`/admin/updateEmploye/${selectedEmployee.id}`, {
        fullname,
        email,
        telephone,
        adresse
      });

      toast.success(response.data.message || 'Employé mis à jour avec succès');
      resetForm();
      setSelectedEmployee(null);
      setEditDialogOpen(false);
      getStatsPersonnels();

    } catch (error: any) {
      console.error('Erreur mise à jour employé:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de la mise à jour de l'employé";
      toast.error(message);
    } finally {
      setIsSubmitting(false)
    }
  };
  const handleClick = (fs: any) => {
    setPersonnelDelete(fs)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (personnelDelete) {
      try {
        await api.delete(`/admin/deleteEmploye/${personnelDelete.id}`);
        await getStatsPersonnels();
        toast.success(`Personnel ${personnelDelete.fullname} supprimé avec succès`);
        setDeleteDialogOpen(false)
        setPersonnelDelete(null)
      } catch (error: any) {
        toast.error("Erreur lors de la suppression");
        console.error(error.response?.data || error);
      } finally {
        setIsDeleting(false)
      }
    }
  };

  const handleToggleStatus = async (employeeId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activer' : 'désactiver';

    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} cet employé ?`)) {
      return;
    }

    try {
      const response = await api.post(`/admin/toggleUserStatus/${employeeId}`, {
        active: newStatus
      });

      toast.success(`Employé ${action} avec succès`);
      getStatsPersonnels();
    } catch (error: any) {
      console.error('Erreur changement statut:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors du changement de statut";
      toast.error(message);
    }
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setTelephone("");
    setAdresse("");
  };

  const filterPersonnals = personnels.filter((personnel: any) => {
    if (filterTab === "all") return true;
    if (filterTab === "employe") return personnel.role === "employe";
    if (filterTab === "intermediaire") return personnel.role === "intermediaire";
    return false; // Par défaut
  });

  useEffect(() => {
    getStatsPersonnels();
  }, []);

  const getStatutColor = (statut: boolean) => {
    return statut ? "default" : "destructive";
  };

  const getInitials = (fullname: string) => {
    const names = fullname.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return fullname.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement du personnel...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personnel</h1>
          <p className="text-muted-foreground">Gérez votre équipe et leurs performances</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvel Employé
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel employé</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Nom complet *</Label>
                    <Input
                      id="fullname"
                      value={fullname}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nom complet"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@employe.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone *</Label>
                    <Input
                      id="telephone"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="+225 01 02 03 04 05"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adresse">Adresse *</Label>
                    <Input
                      id="adresse"
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                      placeholder="Yopougon"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                        Ajout...
                      </span>
                    ) : (
                      "Ajouter un personnel"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog d'édition */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Modifier l'employé</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdate}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-fullname">Nom complet *</Label>
                    <Input
                      id="edit-fullname"
                      value={fullname}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nom complet"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@entreprise.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-telephone">Téléphone *</Label>
                    <Input
                      id="edit-telephone"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="+225 01 02 03 04 05"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-adresse">Adresse *</Label>
                    <Input
                      id="edit-adresse"
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                      placeholder="Yopougon"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditDialogOpen(false);
                      setSelectedEmployee(null);
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit"
                    disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                        Mise à jour...
                      </span>
                    ) : (
                      "Mettre à jour"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsPersonnel?.total_employe || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statsPersonnel?.total_employe_actif || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes ce mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsPersonnel?.total_ventes_employes || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques de commissions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-[var(--shadow-card)] bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {statsPersonnel?.taux_commission || 5}%
            </div>
            <p className="text-xs text-muted-foreground">Sur ventes réglées</p>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)] bg-gradient-to-br from-success/5 to-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions payées</CardTitle>
            <CreditCard className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {statsPersonnel?.commissions_payees ? parseFloat(statsPersonnel.commissions_payees).toLocaleString('fr-FR') : 0} Fcfa
            </div>
            <p className="text-xs text-muted-foreground">Commissions versées</p>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)] bg-gradient-to-br from-warning/5 to-warning/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions en attente</CardTitle>
            <Package className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {statsPersonnel?.commissions_en_attente ? parseFloat(statsPersonnel.commissions_en_attente).toLocaleString('fr-FR') : 0} Fcfa
            </div>
            <p className="text-xs text-muted-foreground">Ventes non soldées</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={filterTab} onValueChange={setFilterTab}>
        <TabsList>
          <TabsTrigger value="all">Tous les employés</TabsTrigger>
          <TabsTrigger value="employe">Employe</TabsTrigger>
          <TabsTrigger value="intermediaire">Intermediaire</TabsTrigger>
        </TabsList>

        <TabsContent value={filterTab} className="space-y-4 mt-6">
          <Card className="shadow-[var(--show-card)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Liste du personnel</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rechercher..." className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Personnel</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Commission Due</TableHead>
                    <TableHead>Statut Commission</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Depuis</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterPersonnals.length > 0 ? (
                    filterPersonnals.map((employe: any) => (
                      <TableRow key={employe.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="" />
                              <AvatarFallback>{getInitials(employe.fullname)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{employe.fullname}</p>
                              <p className="text-sm text-muted-foreground">{employe.adresse}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1" />
                              {employe.email}
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              {employe.telephone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {employe.role || 'Employé'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-primary">
                            {employe.commission_due ? parseFloat(employe.commission_due).toLocaleString('fr-FR') : 0} Fcfa
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={employe.commission_reversee ? "default" : "secondary"}>
                            {employe.commission_reversee ? "Reversée" : "En attente"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatutColor(employe.active)}>
                            {employe.active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(employe.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(employe)}
                              title="Modifier"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleClick(employe)}
                              title="Supprimer"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            {employe.active ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(employe.id, employe.active)}
                                title="Désactiver"
                                className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:border-orange-300"
                              >
                                <PowerOff className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(employe.id, employe.active)}
                                title="Activer"
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:border-green-300"
                              >
                                <Power className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <User className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
                        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                          Aucun employé disponible
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Vous n'avez pas encore d'employé dans votre équipe. Ajoutez votre premier employé pour commencer.
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <DeleteDialog
                open={deleteDialogOpen}
                openChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                itemName={`la commande ${personnelDelete?.fullname}`}
                description="Cela supprimera toutes les actions liés à cet employé. Cette action est irréversible."
                isDeleting={isDeleting}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}