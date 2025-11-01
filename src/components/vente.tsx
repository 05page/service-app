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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  FileText,
  Receipt,
  CreditCard,
  XCircle,
  Clock
} from "lucide-react";
import { toast } from 'sonner';
import { RecuPreview } from "./Form/RecuPreview";
import { ReglementDialog } from "./Form/ReglementDialog";
// Définition d'un type pour les statistiques des ventes
type Ventes = {
  ventes_en_attente: number;
  total_ventes: number;
  ventes_paye: number;
  chiffres_affaire_total: string;
  total_client?: number; // Pour admin
  mes_clients?: number; // Pour employé
  chiffres_affaire_mois: string;
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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reglementDialogOpen, setReglementDialogOpen] = useState(false);
  const [recuPreviewOpen, setRecuPreviewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false)
  const [venteDelete, setVendelete] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState("all");
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
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
  const [intermediaire, setIntermediaire] = useState(""); // Intermédiaire
  const [montant, setMontant] = useState(""); // Montant payé

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
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
    setStockId(upVente.stock_id.toString() || "");
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

  const handleDelete = async () => {
    if (venteDelete) {
      setIsDeleting(true);
      try {
        await api.delete(`/ventes/${venteDelete.id}`);
        await fetchVentesStats();
        await selectVente();
        toast.success(`Vente ${venteDelete.reference} supprimée avec succès`);
        setDeleteDialogOpen(false)
        setVendelete(null)
      } catch (error: any) {
        toast.error("Erreur lors de la suppression");
        console.error(error.response?.data || error);
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleCancelVente = async (venteId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette vente?')) return;
    try {
      await api.put(`/ventes/${venteId}/cancel`);
      toast.success('Vente annulée avec succès');
      setDetailDialogOpen(false);
      await fetchVentesStats();
      await selectVente();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation');
      console.error(error);
    }
  }

  const fetchPaymentHistory = async (venteId: number) => {
    try {
      const response = await api.get(`/ventes/${venteId}/payments`);
      setPaymentHistory(response.data.data || []);
    } catch (error: any) {
      console.error('Erreur récupération historique:', error);
      setPaymentHistory([]);
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

  const handleDownloadFacture = async (venteId: string, isRecu: boolean = false) => {
    try {
      toast.info(`Génération ${isRecu ? 'du reçu' : 'de la facture'} en cours...`);

      const response = await api.get(`factures/vente/${venteId}/pdf`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${isRecu ? 'recu' : 'facture'}-${venteId}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Nettoyage de l'objet URL
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${isRecu ? 'Reçu' : 'Facture'} téléchargé avec succès`);
    } catch (error: any) {
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        console.error("Réponse brute:", text);
        try {
          const errorData = JSON.parse(text);
          toast.error(errorData.message || 'Erreur lors de la génération');
        } catch {
          toast.error('Erreur lors de la génération');
        }
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors du téléchargement');
      }
    }
  }

  const handleClick = (v: any) => {
    setVendelete(v)
    setDeleteDialogOpen(true)
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

  // Calculs pour la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVentes = selectVentes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(selectVentes.length / itemsPerPage);

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
                client={client}
                setClient={setClient}
                numero={numero}
                setNumero={setNumero}
                adresse={adresse}
                setAdresse={setAdresse}
                commissionaire={intermediaire}
                setCommissionnire={setIntermediaire}
                selectCommissionaire={[]}
                setSelectCommissionaire={() => {}}
                montant={montant}
                setMontant={setMontant}
                items={[]}
                setItems={() => {}}
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
                client={client}
                setClient={setClient}
                numero={numero}
                setNumero={setNumero}
                adresse={adresse}
                setAdresse={setAdresse}
                commissionaire={intermediaire}
                setCommissionnire={setIntermediaire}
                selectCommissionaire={[]}
                setSelectCommissionaire={() => {}}
                montant={montant}
                setMontant={setMontant}
                items={[]}
                setItems={() => {}}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total ventes */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ventes</CardTitle>
            <Euro className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {vente?.chiffres_affaire_total ? parseFloat(vente.chiffres_affaire_total).toLocaleString('fr-FR') : 0}
              Fcfa</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        {/* Ventes en attente */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{vente?.ventes_en_attente || 0}</div>
            <p className="text-xs text-muted-foreground">Ventes en attente</p>
          </CardContent>
        </Card>

        {/* Total ventes effectuées */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventes Effectuées</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{vente?.total_ventes || 0}</div>
            <p className="text-xs text-muted-foreground">Ventes éffectuées</p>
          </CardContent>
        </Card>

        {/* Total clients */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total client</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vente?.total_client || vente?.mes_clients || 0}
            </div>
            <p className="text-xs text-muted-foreground">Clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Section recherche et filtres avec tabs */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <TabsList className="grid w-full md:w-auto grid-cols-4 gap-2">
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="attente">En attente</TabsTrigger>
                <TabsTrigger value="paye">Payées</TabsTrigger>
                <TabsTrigger value="annule">Annulées</TabsTrigger>
              </TabsList>
              <div className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une vente..."
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">Filtres</Button>
                <Button variant="outline">Exporter</Button>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Liste des ventes */}
      <div className="grid gap-6">
        {selectVentes && selectVentes.length > 0 ? (
          <>
            {currentVentes
              .filter((vente: any) => {
                if (activeTab === "all") return true;
                if (activeTab === "attente") return vente.statut === "En attente";
                if (activeTab === "paye") return vente.statut === "Payé";
                if (activeTab === "annule") return vente.statut === "Annulé";
                return true;
              })
              .map((vente: any) => (
              <Card key={vente.id} className="shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow">
                {/* Détails de la vente */}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Vente {vente.reference}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="h-3 w-3" />
                            {new Date(vente.created_at).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            <User className="h-3 w-3" />
                            {vente.nom_client}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Badge statut */}
                    <Badge
                      variant={
                        vente.statut === "Payé" ? "default" :
                        vente.statut === "En attente" ? "secondary" :
                        vente.statut === "Annulé" ? "destructive" :
                        "outline"
                      }
                      className={
                        vente.statut === "Payé" ? "bg-success text-success-foreground" :
                        vente.statut === "En attente" ? "bg-warning text-warning-foreground" : 
                        vente.statut === "Annulé" ? "bg-destructive text-destructive-foreground" : ""
                      }
                    >
                      {vente.statut}
                    </Badge>
                  </div>
                </CardHeader>

                {/* Contenu de la vente */}
                <CardContent>
                  <div className="space-y-4">
                    {/* Articles */}
                    <div>
                      <h4 className="font-medium mb-2">Article vendu:</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                          <span className="text-sm">
                            {vente.stock?.achat?.nom_service || 'Produit'} (x{vente.quantite})
                          </span>
                          <span className="text-sm font-medium">{vente.prix_total} FCFA</span>
                        </div>
                      </div>
                    </div>

                    {/* Résumé */}
                    <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-xl font-bold text-success">{vente.prix_total} FcFA</p>
                      </div>
                    </div>

                    {/* Boutons d'actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setSelectedVente(vente);
                          fetchPaymentHistory(vente.id);
                          setDetailDialogOpen(true);
                        }}
                      >
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
              <p className="text-sm text-muted-foreground text-center mb-6">
                Vous n'avez pas encore effectué de vente. Créez votre première vente pour commencer.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <DeleteDialog
        open={deleteDialogOpen}
        openChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={`la vente ${venteDelete?.reference}`}
        description="Cela supprimera toutes les actions liées à cette vente. Cette action est irréversible."
        isDeleting={isDeleting}
      />

      {/* Dialog Détails avec actions */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de la vente</DialogTitle>
          </DialogHeader>
          {selectedVente && (
            <div className="space-y-6">
              {selectedVente.photo_url && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                  <img src={selectedVente.photo_url} alt="Produit" className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Référence</p>
                  <p className="font-semibold">{selectedVente.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Produit</p>
                  <p className="font-semibold">{selectedVente.stock?.achat?.nom_service || 'Produit'}</p>
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
                  <p className="font-semibold text-success text-lg">{selectedVente.prix_total} Fcfa</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant={selectedVente.statut === 'Payé' ? 'default' : selectedVente.statut === 'Annulé' ? 'destructive' : 'secondary'} className="mt-1">
                    {selectedVente.statut || 'En attente'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de vente</p>
                  <p className="font-semibold">{new Date(selectedVente.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Historique des paiements */}
              {selectedVente.statut !== 'Annulé' && paymentHistory.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Historique des paiements
                  </h3>
                  <div className="space-y-2">
                    {paymentHistory.map((payment: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{payment.montant} Fcfa</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleString('fr-FR')}
                          </p>
                        </div>
                        <Badge variant="outline">{payment.mode_paiement || 'Espèces'}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Actions disponibles</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedVente.statut !== 'Annulé' && (
                    <Button variant="outline" className="justify-start" onClick={() => {
                      setDetailDialogOpen(false);
                      handleEdit(selectedVente);
                    }}>
                      <FileText className="h-4 w-4 mr-2" />
                      Modifier la vente
                    </Button>
                  )}
                  
                  {selectedVente.statut === 'Payé' ? (
                    <Button variant="outline" className="justify-start" onClick={() => handleDownloadFacture(selectedVente.id)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Télécharger facture
                    </Button>
                  ) : selectedVente.statut !== 'Annulé' ? (
                    <>
                      <Button variant="outline" className="justify-start" onClick={() => {
                        handleDownloadFacture(selectedVente.id, true);
                      }}>
                        <Receipt className="h-4 w-4 mr-2" />
                        Télécharger reçu
                      </Button>
                      <Button variant="outline" className="justify-start col-span-2" onClick={() => {
                        setDetailDialogOpen(false);
                        setReglementDialogOpen(true);
                      }}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Ajouter un règlement
                      </Button>
                    </>
                  ) : null}

                  {selectedVente.statut !== 'Annulé' && (
                    <Button variant="destructive" className="justify-start col-span-2" onClick={() => handleCancelVente(selectedVente.id)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Annuler la vente
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setDetailDialogOpen(false)}>Fermer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Règlement */}
      <ReglementDialog 
        open={reglementDialogOpen} 
        onOpenChange={setReglementDialogOpen} 
        vente={selectedVente} 
        onSuccess={async () => {
          await fetchVentesStats();
          await selectVente();
        }} 
      />

      {/* Dialog Aperçu Reçu */}
      <Dialog open={recuPreviewOpen} onOpenChange={setRecuPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu du reçu de paiement</DialogTitle>
          </DialogHeader>
          {selectedVente && <RecuPreview vente={selectedVente} />}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => setRecuPreviewOpen(false)}>
              Fermer
            </Button>
            <Button onClick={() => {
              handleDownloadFacture(selectedVente.id, true);
              setRecuPreviewOpen(false);
            }}>
              Télécharger le reçu (PDF)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}