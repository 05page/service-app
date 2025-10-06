import { useState, useEffect } from "react";
import api from '../api/api';
import DeleteDialog from "./Form/DeleteDialog";
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "../components/Pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, RefreshCw, PowerOff, Power, Building } from "lucide-react";
import { toast } from "sonner";

interface Fournisseur {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  statut: "actif" | "inactif";
  typeServices: string;
  dateCreation: string;
  totalCommandes: number;
  montantTotal: number;
}

export function FournisseursSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState<string>("tous");

  const [refreshing, setRefreshing] = useState(false);
  const [fournisseur, setFournisseurs] = useState([]);
  const [selectStats, setSelectStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [fournisseurDelete, setFournisseurDelete] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Formulaire
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nomFournisseurs, setNomFournisseurs] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [description, setDescription] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomFournisseurs || !email || !adresse || !description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsSubmitting(true)
    try {
      const response = await api.post('/fournisseurs/', {
        nom_fournisseurs: nomFournisseurs,
        email,
        telephone,
        adresse,
        description,
      });

      toast.success(response.data.message);
      resetForm();
      setDialogOpen(false);
      getFournisseur();
    } catch (error: any) {
      console.error(error.response?.data);
      const message = error.response?.data?.message || "Erreur survenue lors de l'ajout du fournisseur";
      toast.error(message);
    } finally {
      setIsSubmitting(false)
    }
  };

  const handleEdit = (fournisseurItem: any) => {
    setSelectedFournisseur(fournisseurItem);
    setNomFournisseurs(fournisseurItem.nom_fournisseurs || "");
    setEmail(fournisseurItem.email || "");
    setTelephone(fournisseurItem.telephone || "");
    setAdresse(fournisseurItem.adresse || "");
    setDescription(fournisseurItem.description || "");
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFournisseur) return;

    if (!nomFournisseurs || !email || !adresse || !description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsSubmitting(true)
    try {
      const response = await api.put(`/fournisseurs/${selectedFournisseur.id}`, {
        nom_fournisseurs: nomFournisseurs,
        email,
        telephone,
        adresse,
        description
      });

      toast.success(response.data.message || 'Fournisseur mis à jour avec succès');
      resetForm();
      setSelectedFournisseur(null);
      setEditDialogOpen(false);
      getFournisseur();

    } catch (error: any) {
      console.error('Erreur mise à jour fournisseur:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de la mise à jour du fournisseur";
      toast.error(message);
    } finally {
      setIsSubmitting(false)
    }
  };

  const handleClick = (fs: any) => {
    setFournisseurDelete(fs)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (fournisseurDelete) {
      try {
        await api.delete(`/fournisseurs/${fournisseurDelete.id}`);
        await getFournisseur();
        toast.success(`Fournisseur ${fournisseurDelete.nom_fournisseurs} supprimé avec succès`);
        setDeleteDialogOpen(false)
        setFournisseurDelete(null)
      } catch (error: any) {
        toast.error("Erreur lors de la suppression");
        console.error(error.response?.data || error);
      } finally {
        setIsDeleting(false)
      }
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
      getFournisseur();
    } catch (error: any) {
      console.error('Erreur:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erreur lors du changement de statut');
    }
  };

  const resetForm = () => {
    setNomFournisseurs("");
    setEmail("");
    setTelephone("");
    setAdresse("");
    setDescription("");
  };

  useEffect(() => {
    getFournisseur();
  }, []);

  // Filtrage des fournisseurs
  const filteredFournisseurs = fournisseur.filter((f: any) => {
    const matchesSearch = f.nom_fournisseurs?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.telephone?.includes(searchTerm);

    // Correction du filtrage par statut pour correspondre aux valeurs booléennes du serveur
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
  } = usePagination({ data: filteredFournisseurs, itemsPerPage: 6 })


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement de la liste de fournisseur...</p>
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

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Fournisseur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau fournisseur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom de l'entreprise *</Label>
                    <Input
                      id="nom"
                      value={nomFournisseurs}
                      onChange={(e) => setNomFournisseurs(e.target.value)}
                      placeholder="Nom du fournisseur"
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
                      placeholder="contact@fournisseur.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="+225 01 02 03 04 05"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adresse">Adresse *</Label>
                    <Input
                      id="adresse"
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                      placeholder="Ex: Yopougon"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Type de service *</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ex: Services Informatiques"
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
                      "Ajouter un fournisseur"
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
                <DialogTitle>Modifier le fournisseur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdate}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-nom">Nom de l'entreprise *</Label>
                    <Input
                      id="edit-nom"
                      value={nomFournisseurs}
                      onChange={(e) => setNomFournisseurs(e.target.value)}
                      placeholder="Nom du fournisseur"
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
                      placeholder="contact@fournisseur.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-telephone">Téléphone</Label>
                    <Input
                      id="edit-telephone"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="+225 01 02 03 04 05"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-adresse">Adresse *</Label>
                    <Input
                      id="edit-adresse"
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                      placeholder="Ex: Yopougon"
                      required
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="edit-description">Type de service *</Label>
                    <Input
                      id="edit-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ex: Services Informatiques"
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
                      setSelectedFournisseur(null);
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
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
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{selectStats?.total_fournisseurs_actifs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes ce mois</CardTitle>
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
                  placeholder="Rechercher par nom, email ou type de service..."
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
                <TableHead>Type de services</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFournisseurs && filteredFournisseurs.length > 0 ? (
                <>
                  {currentFournisseur.map((f: any) => (
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
                      <TableCell>{f.description}</TableCell>
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
                          <DeleteDialog
                            open={deleteDialogOpen}
                            openChange={setDeleteDialogOpen}
                            onConfirm={handleDelete}
                            itemName={`la commande ${fournisseurDelete?.numero_achat}`}
                            description="Cela supprimera toutes les actions liés à cet fournisseur. Cette action est irréversible."
                            isDeleting={isDeleting}
                          />
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
                  ))}
                </>
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
                        ? `Aucun fournisseur ne correspond à vos critères de recherche`
                        : 'Vous n\'avez pas encore de fournisseur. Ajoutez votre premier fournisseur pour commencer.'
                      }
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {/* Composant de pagination réutilisable */}
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
      </Card>
    </div>
  );
}