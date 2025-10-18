// Import des hooks React pour gérer l'état et les effets
import { useState, useEffect } from "react";
import api from "../api/api"
import DeleteDialog from "./Form/DeleteDialog";
import FormVente from "./Form/FormVente";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Calendar,
  User,
  Package,
  Euro,
  TrendingUp,
  ShoppingCart,
  RefreshCw,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Eye,
  Image as ImageICon,
  CreditCard,
  FileText,
  Receipt,
  Edit,
  Trash2
} from "lucide-react";
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
// Définition d'un type pour les statistiques des ventes
type Ventes = {
  ventes_en_attente: number;
  total_ventes: number;
  ventes_paye: number;
  chiffres_affaire_total: string;
  total_client?: number; // Pour admin
  mes_clients?: number; // Pour employé
  chiffres_affaire_mois: string;
  taux_commission?: number;
  commissions_payees?: string;
  commissions_en_attente?: string;
}

// Composant principal pour la section Ventes
export function VentesSection() {
  // États pour les statistiques générales
  const [vente, setVentes] = useState<Ventes | null>(null);
  const [selectedVente, setSelectedVente] = useState<any>(null);
  const [selectVentes, setSelectVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false)
  const [venteDelete, setVendelete] = useState<any | null>(null)
  // États du formulaire de création de vente
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stock, setStock] = useState([]); // Liste des articles en stock
  const [stockId, setStockId] = useState(""); // ID de l'article sélectionné
  const [client, setClient] = useState(""); // Nom du client
  const [numero, setNumero] = useState(""); // Numéro de téléphone du client
  const [adresse, setAdresse] = useState(""); // Adresse du client
  const [quantite, setQuantite] = useState(""); // Quantité vendue
  const [prixUnitaire, setPrixUnitaire] = useState(""); // Prix unitaire
  const [prixTotal, setPrixTotal] = useState(""); // Prix total calculé automatiquement
  const [photo, setPhoto] = useState("");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filterTab, setFilterTab] = useState("all")
  // Récupère les statistiques de ventes (admin ou employé)
  const fetchVentesStats = async () => {
    try {
      const token = localStorage.getItem("token"); // Récupère le token dans le localStorage
      if (!token) {
        console.error('token non trouvé')
        return
      }
      console.log(token)
      // Déterminer l'endpoint selon le rôle
      const role = localStorage.getItem("userRole");
      const endpoint = role === "admin" ? "/allStats" : "/ventes/myStats";

      // Requête pour récupérer les statistiques
      const response = await api.get(endpoint);
      setVentes(response.data.data) // Stocke les stats dans l'état
      console.log(response.data.data)
    } catch (error: any) {
      console.error('Erreur de récupération', error);
      if (error.response?.status === 401) {
        toast.error('Token invalide ou expiré. Veuillez vous reconnecter');
        window.location.href = '/auth' // Redirige vers l'authentification si token invalide
      } else {
        toast.error('Erreur lors du chargement des données');
      }
    } finally {
      setLoading(false) // Fin du chargement
    }
  }

  // Récupère toutes les ventes pour l'affichage
  const selectVente = async () => {
    try {
      const response = await api.get('/ventes/');
      setSelectVentes(response.data.data || [])
      console.log("Liste des ventes", response.data.data)
    } catch (error: any) {
      console.error('Erreur survenue lors de la récupération des ventes', error);
      if (error.response?.status === 403) {
        setAccessDenied(true); // Active l'affichage d'accès refusé
        toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires');
      } else {
        toast.error('Erreur lors du chargement des données');
      }
      setSelectVentes([]);
    } finally {
      setLoading(false)
    }
  }

  // Récupère les stocks disponibles pour le formulaire
  const fetchFormData = async () => {
    try {
      const stockResponse = await api.get('/stock/');
      setStock(stockResponse.data.data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données du formulaire', error);
      toast.error('Erreur lors du chargement des données');
    }
  }

  // Soumission du formulaire de création de vente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérification des champs obligatoires
    if (!stockId || !client || !numero || !adresse || !quantite || !prixUnitaire) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsSubmitting(true);

    try {
      // Requête POST pour créer la vente
      const response = await api.post('/ventes/', {
        stock_id: parseInt(stockId),
        nom_client: client,
        numero,
        adresse,
        quantite: parseInt(quantite),
      });

      toast.success(response.data.message || 'Vente créée avec succès');

      // Fermer le dialogue et recharger les données
      setDialogOpen(false);
      fetchVentesStats();
      selectVente();

    } catch (error: any) {
      console.error('Erreur création vente:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de la création de la vente";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleEdit = (upVente: any) => {
    setSelectedVente(upVente)
    setStockId(upVente.stock_id?.toString() || "");
    setClient(upVente?.nom_client || "");
    setNumero(upVente?.numero || "");
    setAdresse(upVente?.adresse || "");
    setQuantite(upVente?.quantite || "")
    setEditDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVente) return
    if (!stockId || !client || !numero || !adresse || !quantite || !prixUnitaire) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }
    setIsSubmitting(true);
    try {
      const response = await api.put(`/ventes/${selectedVente.id}`, {
        stock_id: parseInt(stockId),
        nom_client: client,
        numero,
        adresse,
        quantite: parseInt(quantite),
      })
      toast.success(response.data.message || "Vente mis à jour");
      setVentes(null);
      resetForm();
      await fetchVentesStats();
      await selectVente();
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error(error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de mise à jour de la vente";
      toast.error(message);
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    // Réinitialisation du formulaire
    setStockId("");
    setClient("");
    setNumero("");
    setAdresse("");
    setQuantite("");
    setPrixUnitaire("");
    setPrixTotal("");
    setPhoto("")
  }
  // Actualisation des données
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchVentesStats(),
        selectVente()
      ]);
      toast.success('Données actualisées');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  }

  // Téléchargement de la facture PDF pour une vente
  const handleDownloadFacture = async (venteId: string) => {
    try {
      toast.info('Génération de facture en cours...');

      const response = await api.get(`factures/vente/${venteId}/pdf`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${venteId}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Nettoyage de l'objet URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Facture téléchargée avec succès');
    } catch (error: any) {
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        console.error("Réponse brute:", text);
        try {
          const errorData = JSON.parse(text);
          toast.error(errorData.message || 'Erreur lors de la génération de la facture');
        } catch {
          toast.error('Erreur lors de la génération de la facture');
        }
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors du téléchargement de la facture');
      }
    }
  }

  const handleViewDetails = (vente: any) => {
    setSelectedVente(vente);
    setDetailDialogOpen(true);
  }

  const handleClick = (v: any) => {
    setVendelete(v)
    setDeleteDialogOpen(true)
  }
  const handleDelete = async () => {
    if (venteDelete) {
      try {
        await api.delete(`ventes/${venteDelete.id}`);
        await Promise.all([fetchVentesStats(), selectVente()]);
        toast.success(`Vente ${venteDelete?.reference} supprimé avec succès`)
        setDeleteDialogOpen(false);
        setVendelete(null);
      } catch (error: any) {
        toast.error("Erreur lors de la suppression");
        console.error(error.response?.data || error);
      } finally {
        setIsDeleting(false)
      }
    }
  }
  // useEffect pour initialiser les données
  useEffect(() => {
    fetchVentesStats()
    selectVente()
    fetchFormData()
  }, [])

  // Calcul automatique du prix total en fonction de la quantité et du prix unitaire
  useEffect(() => {
    const q = parseInt(quantite) || 0;
    const pU = parseFloat(prixUnitaire) || 0;
    setPrixTotal((q * pU).toFixed(2))
  }, [quantite, prixUnitaire])

  // Met à jour le prix unitaire quand un stock est sélectionné
  useEffect(() => {
    if (stockId) {
      const selectedStock = stock.find((s: any) => s.id === parseInt(stockId));
      if (selectedStock) {
        setPrixUnitaire(selectedStock.prix_vente.toString());
      }
    }
  }, [stockId, stock]);

    // Filtrer les ventes selon le statut
  const filteredVentes = selectVentes.filter((v: any) => {
    if (filterTab === "all") return true;
    if (filterTab === "regle") return v.statut_paiement === "réglé";
    if (filterTab === "non_regle") return v.statut_paiement === "non réglé" || v.statut_paiement === "partiel";
    return true;
  });

  // Calculs pour la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVentes = filteredVentes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVentes.length / itemsPerPage);

  // Fonctions de navigation
  const goToNextPage = () => {
    setCurrentPage(page => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage(page => Math.max(page - 1, 1));
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement des ventes...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  // Affichage en cas d'accès refusé (erreur 403)
  if (accessDenied) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">
              Vous n'avez pas la permission d'accéder à la gestion des ventes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header et boutons d'action */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ventes</h1>
          <p className="text-muted-foreground">
            Gérez vos ventes et facturations
          </p>
        </div>
        <div className="flex gap-2">
          {/* Bouton Actualiser */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>

          {/* Bouton + dialogue pour créer une nouvelle vente */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle vente
              </Button>
            </DialogTrigger>

            {/* Contenu du formulaire dans le dialogue */}
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle vente</DialogTitle>
              </DialogHeader>
              <FormVente
                stock={stock}
                setStock={setStock}
                stockId={stockId}
                setStockId={setStockId}
                client={client}
                setClient={setClient}
                numero={numero}
                setNumero={setNumero}
                adresse={adresse}
                setAdresse={setAdresse}
                quantite={quantite}
                setQuantite={setQuantite}
                prixUnitaire={prixUnitaire}
                setPrixUnitaire={setPrixUnitaire}
                prixTotal={prixTotal}
                setPrixTotal={setPrixTotal}
                isSubmitting={isSubmitting}
                setDialogOpen={setDialogOpen}
                setEditDialogOpen={setEditDialogOpen}
                handleSubmit={handleSubmit}
                handleUpdate={handleUpdate}
                resetForm={resetForm}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            {/* Contenu du formulaire dans le dialogue */}
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Modifier la vente</DialogTitle>
              </DialogHeader>
              <FormVente
                isEdit
                stock={stock}
                setStock={setStock}
                stockId={stockId}
                setStockId={setStockId}
                client={client}
                setClient={setClient}
                numero={numero}
                setNumero={setNumero}
                adresse={adresse}
                setAdresse={setAdresse}
                quantite={quantite}
                setQuantite={setQuantite}
                prixUnitaire={prixUnitaire}
                setPrixUnitaire={setPrixUnitaire}
                prixTotal={prixTotal}
                setPrixTotal={setPrixTotal}
                isSubmitting={isSubmitting}
                setDialogOpen={setDialogOpen}
                setEditDialogOpen={setEditDialogOpen}
                handleSubmit={handleSubmit}
                handleUpdate={handleUpdate}
                resetForm={resetForm}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary cards (stats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total ventes */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ventes</CardTitle>
            <Euro className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {vente?.chiffres_affaire_total ? parseFloat(vente.chiffres_affaire_total).toLocaleString('fr-FR') : 0} Fcfa
            </div>
            <p className="text-xs text-muted-foreground">Chiffre d'affaires total</p>
          </CardContent>
        </Card>

        {/* Ventes réglées */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes réglées</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{vente?.ventes_paye || 0}</div>
            <p className="text-xs text-muted-foreground">Paiements complétés</p>
          </CardContent>
        </Card>

        {/* Ventes en attente */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non réglées</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{vente?.ventes_en_attente || 0}</div>
            <p className="text-xs text-muted-foreground">En attente de paiement</p>
          </CardContent>
        </Card>

        {/* Total clients */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total clients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vente?.total_client || vente?.mes_clients || 0}
            </div>
            <p className="text-xs text-muted-foreground">Clients actifs</p>
          </CardContent>
        </Card>
      </div>


      {/* Section recherche et filtres */}
      <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Toutes ({selectVentes.length})
            </TabsTrigger>
            <TabsTrigger value="regle" className="data-[state=active]:bg-success data-[state=active]:text-white">
              Réglées ({selectVentes.filter((v: any) => v.statut_paiement === "réglé").length})
            </TabsTrigger>
            <TabsTrigger value="non_regle" className="data-[state=active]:bg-warning data-[state=active]:text-white">
              Non réglées ({selectVentes.filter((v: any) => v.statut_paiement === "non réglé" || v.statut_paiement === "partiel").length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={filterTab} className="space-y-4 mt-0">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Liste des ventes</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Rechercher..." className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentVentes.length > 0 ? (
                  <>
                    {currentVentes.map((v: any) => (
                      <div key={v.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                          <div className="flex items-center gap-3">
                            {v.photo_url ? (
                              <img src={v.photo_url} alt={v.nom_produit} className="w-12 h-12 rounded object-cover" />
                            ) : (
                              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold">{v.reference}</p>
                              <p className="text-sm text-muted-foreground">{v.nom_produit}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Client</p>
                            <p className="font-medium">{v.nom_client}</p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Personnel</p>
                            <p className="font-medium">{v.employe_nom || 'N/A'}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {v.employe_role || 'employé'}
                            </Badge>
                            {v.commission_touche && (
                              <p className="text-xs text-success mt-1">✓ Commissionné</p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Montant</p>
                            <p className="font-semibold text-success">{v.prix_total} Fcfa</p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Statut</p>
                            <Badge variant={v.statut_paiement === 'réglé' ? 'default' : 'destructive'}>
                              {v.statut_paiement || 'non réglé'}
                            </Badge>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="text-sm">{new Date(v.created_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end border-t pt-3 mt-3">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(v)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm">
                            {v.statut_paiement === 'réglé' ? <FileText className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(v)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleClick(v)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <DeleteDialog
                            open={deleteDialogOpen}
                            openChange={setDeleteDialogOpen}
                            onConfirm={handleDelete}
                            itemName={`la commande ${venteDelete?.reference}`}
                            description="Cela suprrimera toutes les actions liées à cette vente. Cette action est irréversible."
                            isDeleting={isDeleting}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Composant de pagination */}
                    {totalPages > 1 && (
                      <Card className="shadow-[var(--shadow-card)]">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, selectVentes.length)} sur {selectVentes.length} ventes
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Bouton Précédent */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                              >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Précédent
                              </Button>

                              {/* Numéros de pages */}
                              <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                  <Button
                                    key={pageNumber}
                                    variant={currentPage === pageNumber ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => goToPage(pageNumber)}
                                    className="w-10"
                                  >
                                    {pageNumber}
                                  </Button>
                                ))}
                              </div>

                              {/* Bouton Suivant */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                              >
                                Suivant
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  // Affichage si aucune vente
                  <Card className="shadow-[var(--shadow-card)]">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        Aucune vente disponible
                      </h3>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Détails */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la vente</DialogTitle>
          </DialogHeader>
          {selectedVente && (
            <div className="space-y-4">
              {selectedVente.photo_url ? (
                <img src={selectedVente.photo_url} alt="Produit" className="w-full h-48 object-cover rounded" />
              ) : (
                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Référence</p>
                  <p className="font-semibold">{selectedVente.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Produit</p>
                  <p className="font-semibold">{selectedVente.nom_produit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-semibold">{selectedVente.nom_client}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-semibold">{selectedVente.numero}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-semibold">{selectedVente.adresse}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantité</p>
                  <p className="font-semibold">{selectedVente.quantite}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prix total</p>
                  <p className="font-semibold text-success">{selectedVente.prix_total} Fcfa</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut paiement</p>
                  <Badge variant={selectedVente.statut_paiement === 'réglé' ? 'default' : 'destructive'}>
                    {selectedVente.statut_paiement || 'non réglé'}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">Personnel</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{selectedVente.employe_nom || 'N/A'}</p>
                        <Badge variant="outline" className="mt-1">
                          {selectedVente.employe_role || 'employé'}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Commission</p>
                        <p className="font-semibold text-primary">
                          {selectedVente.commission_montant ? `${selectedVente.commission_montant} Fcfa` : 'N/A'}
                        </p>
                        {selectedVente.commission_touche && (
                          <Badge variant="default" className="mt-1">
                            ✓ Commissionné
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}