import { useState, useEffect } from "react";
import api from '../api/api';
import DeleteDialog from "./Form/DeleteDialog";
import FormFournisseur from "./Form/FormFournisseur";
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "../components/Pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, RefreshCw, PowerOff, Power, Building, Tag } from "lucide-react";
import { toast } from "sonner";

export function FournisseursSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState<string>("tous");
  const [refreshing, setRefreshing] = useState(false);
  const [fournisseur, setFournisseurs] = useState([]);
  const [selectStats, setSelectStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [fournisseurDelete, setFournisseurDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFournisseur = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token non trouvé');
        return;
      }

      const response = await api.get('/fournisseurs/stats/');
      setSelectStats(response.data.data);

      const responses = await api.get('/fournisseurs/');
      setFournisseurs(responses.data.data || []);
    } catch (error: any) {
      console.error('Erreur de récupération', error);
      if (error.response?.status === 401) {
        toast.error('Token invalide ou expiré. Veuillez vous reconnecter');
        window.location.href = '/auth';
      } else if (error.response?.status === 403) {
        toast.error('Accès refusé');
      } else {
        toast.error('Erreur lors du chargement des données');
      }
      setFournisseurs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await getFournisseur();
      toast.success("Données actualisées");
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ Gestion de la création avec FormFournisseur
  const handleCreateSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/fournisseurs/', data);
      toast.success(response.data.message || 'Fournisseur créé avec succès');
      setDialogOpen(false);
      await getFournisseur();
    } catch (error: any) {
      console.error(error.response?.data);
      const message = error.response?.data?.message || "Erreur survenue lors de l'ajout du fournisseur";
      toast.error(message);
      throw error; // Important pour que le formulaire sache que ça a échoué
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Gestion de la modification avec FormFournisseur
  const handleEdit = (fournisseurItem: any) => {
    setSelectedFournisseur(fournisseurItem);
    setEditDialogOpen(true);
  };

  const handleUpdateSubmit = async (data: any) => {
    if (!selectedFournisseur) return;

    setIsSubmitting(true);
    try {
      const response = await api.put(`/fournisseurs/${selectedFournisseur.id}`, data);
      toast.success(response.data.message || 'Fournisseur mis à jour avec succès');
      setEditDialogOpen(false);
      setSelectedFournisseur(null);
      await getFournisseur();
    } catch (error: any) {
      console.error('Erreur mise à jour fournisseur:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de la mise à jour du fournisseur";
      toast.error(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClick = (fs: any) => {
    setFournisseurDelete(fs);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!fournisseurDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/fournisseurs/${fournisseurDelete.id}`);
      await getFournisseur();
      toast.success(`Fournisseur ${fournisseurDelete.nom_fournisseurs} supprimé avec succès`);
      setDeleteDialogOpen(false);
      setFournisseurDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
      console.error(error.response?.data || error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (fournisseurId: string, action: "desactive" | "reactive") => {
    const confirmMessage = action === "desactive"
      ? "Voulez-vous vraiment désactiver ce fournisseur ?"
      : "Voulez-vous vraiment réactiver ce fournisseur ?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await api.post(`/fournisseurs/${action}/${fournisseurId}`);
      toast.success(response.data.message);
      await getFournisseur();
    } catch (error: any) {
      console.error('Erreur:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erreur lors du changement de statut');
    }
  };

  useEffect(() => {
    getFournisseur();
  }, []);

  // ✅ Filtrage amélioré pour gérer les services en tableau
  const filteredFournisseurs = fournisseur.filter((f: any) => {
    const matchesSearch = 
      f.nom_fournisseurs?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.telephone?.includes(searchTerm) ||
      // Recherche dans les services (tableau)
      (Array.isArray(f.services) && f.services.some((s: string) => 
        s.toLowerCase().includes(searchTerm.toLowerCase())
      ));

    const matchesStatut = selectedStatut === "tous" ||
      (selectedStatut === "actif" && f.actif === true) ||
      (selectedStatut === "inactif" && f.actif === false);

    return matchesSearch && matchesStatut;
  });

  const {
    currentPage,
    totalPages,
    currentData: currentFournisseur,
    setCurrentPage
  } = usePagination({ data: filteredFournisseurs, itemsPerPage: 6 });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement de la liste de fournisseurs...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fournisseurs</h1>
          <p className="text-muted-foreground">Gérez vos fournisseurs de services</p>
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

          {/* Dialog de création */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Fournisseur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau fournisseur</DialogTitle>
              </DialogHeader>
              <FormFournisseur
                onSubmit={handleCreateSubmit}
                onCancel={() => setDialogOpen(false)}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>

          {/* Dialog de modification */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Modifier le fournisseur</DialogTitle>
              </DialogHeader>
              <FormFournisseur
                isEdit
                initialData={selectedFournisseur ? {
                  nom_fournisseurs: selectedFournisseur.nom_fournisseurs,
                  email: selectedFournisseur.email,
                  telephone: selectedFournisseur.telephone,
                  adresse: selectedFournisseur.adresse,
                  services: selectedFournisseur.services
                } : undefined}
                onSubmit={handleUpdateSubmit}
                onCancel={() => {
                  setEditDialogOpen(false);
                  setSelectedFournisseur(null);
                }}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fournisseurs</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectStats?.total_fournisseurs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs Actifs</CardTitle>
            <Power className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{selectStats?.total_fournisseurs_actifs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes ce mois</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectStats?.total_commande || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des fournisseurs</CardTitle>
          <CardDescription>Recherchez et filtrez vos fournisseurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, email ou service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatut} onValueChange={setSelectedStatut}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actifs</SelectItem>
                <SelectItem value="inactif">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Services proposés</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentFournisseur && currentFournisseur.length > 0 ? (
                currentFournisseur.map((f: any) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{f.nom_fournisseurs}</div>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {f.adresse}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {f.email}
                        </div>
                        {f.telephone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {f.telephone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* ✅ Affichage des services en badges */}
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(f.services) ? (
                          f.services.slice(0, 3).map((service: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Aucun service</span>
                        )}
                        {Array.isArray(f.services) && f.services.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{f.services.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={f.actif ? "default" : "secondary"}>
                        {f.actif ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(f)}
                          title="Modifier"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClick(f)}
                          title="Supprimer"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        {f.actif ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(f.id, "desactive")}
                            title="Désactiver"
                            className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:border-orange-300"
                          >
                            <PowerOff className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(f.id, "reactive")}
                            title="Réactiver"
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
                  <TableCell colSpan={5} className="text-center py-12">
                    <Building className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      {searchTerm || selectedStatut !== "tous"
                        ? 'Aucun fournisseur trouvé'
                        : 'Aucun fournisseur disponible'
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-6">
                      {searchTerm || selectedStatut !== "tous"
                        ? 'Aucun fournisseur ne correspond à vos critères de recherche'
                        : 'Vous n\'avez pas encore de fournisseur. Ajoutez votre premier fournisseur pour commencer.'
                      }
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {currentFournisseur && currentFournisseur.length > 0 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredFournisseurs.length}
                itemsPerPage={6}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de suppression */}
      <DeleteDialog
        open={deleteDialogOpen}
        openChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Supprimer ce fournisseur ?"
        itemName={fournisseurDelete?.nom_fournisseurs}
        description="Cela supprimera toutes les actions liées à ce fournisseur. Cette action est irréversible."
        isDeleting={isDeleting}
      />
    </div>
  );
}