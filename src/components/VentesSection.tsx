// Import des hooks React pour gérer l'état et les effets
import { useState, useEffect } from "react";
import api from "../api/api"
import DeleteDialog from "./Form/DeleteDialog";
import FormVente from "./Form/FormVente";
import { VenteHistoryDialog } from "./Form/VenteHistoryDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Plus, Search, User, Package, Euro, TrendingUp, ShoppingCart, RefreshCw,
  ShieldAlert, ChevronLeft, ChevronRight, Eye, Edit,
  CreditCard, History, Ban
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type ItemVente = {
  stock_id: string;
  quantite: string;
  prix_unitaire: string;
  sous_total: string;
}

type Ventes = {
  reglement_statut: number;
  ventes_regles: number;
  ventes_en_attente: number;
  total_ventes: number;
  ventes_paye: number;
  chiffres_affaire_total: string;
  total_client?: number;
  mes_clients?: number;
  chiffres_affaire_mois: string;
  taux_commission?: number;
  commissions_payees?: string;
  commissions_en_attente?: string;
}

export function VentesSection() {
  const [vente, setVentes] = useState<Ventes | null>(null);
  const [selectedVente, setSelectedVente] = useState<any>(null);
  const [selectVentes, setSelectVentes] = useState([]);
  const [selectCommissionaire, setSelectCommissionaire] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [searchTerm, setSearchTerm] = useState("");
  const [stock, setStock] = useState([]);
  const [client, setClient] = useState("");
  const [numero, setNumero] = useState("");
  const [adresse, setAdresse] = useState("");
  const [commissionaire, setCommissionnire] = useState("");
  const [montant, setMontant] = useState("");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  //Etat pour le paiment
  const [payementDialog, setPayementDialog] = useState(false);
  const [selectedVenteForPayment, setSelectedVenteForPayment] = useState<any | null>(null);
  const [montantVerse, setMontantVerse] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Nouvel état pour gérer plusieurs articles
  const [items, setItems] = useState<ItemVente[]>([
    { stock_id: "", quantite: "", prix_unitaire: "", sous_total: "" }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filterTab, setFilterTab] = useState("all")

  // États pour l'historique
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedVenteHistory, setSelectedVenteHistory] = useState<any>(null);
  const [venteHistorique, setVenteHistorique] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // États pour l'annulation
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [venteToCanel, setVenteToCancel] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);


  const fetchVentesStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error('token non trouvé')
        return
      }
      const role = localStorage.getItem("userRole");
      const endpoint = role === "admin" ? "/allStats" : "/ventes/myStats";
      const response = await api.get(endpoint);
      setVentes(response.data.data)
      console.log(response.data.data)
    } catch (error: any) {
      console.error('Erreur de récupération', error);
      if (error.response?.status === 401) {
        toast.error('Token invalide ou expiré. Veuillez vous reconnecter');
        window.location.href = '/auth'
      } else {
        toast.error('Erreur lors du chargement des données');
      }
    } finally {
      setLoading(false)
    }
  }

  const selectVente = async () => {
    try {
      const response = await api.get('/ventes/');
      setSelectVentes(response.data.data || []);
    } catch (error: any) {
      console.error('Erreur survenue lors de la récupération des ventes', error);
      if (error.response?.status === 403) {
        setAccessDenied(true);
        toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires');
      } else {
        toast.error('Erreur lors du chargement des données');
      }
      setSelectVentes([]);
    } finally {
      setLoading(false)
    }
  }

  const selectCommissionaires = async () => {
    try {
      const response = await api.get('/admin/showEmploye')
      setSelectCommissionaire(response.data.data || [])
      console.log(response.data.data)
    } catch (error: any) {
      console.log('erreur de récupération', error);
    }
  }

  const fetchFormData = async () => {
    try {
      const stockResponse = await api.get('/stock/');
      setStock(stockResponse.data.data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données du formulaire', error);
      toast.error('Erreur lors du chargement des données');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérification des champs obligatoires
    if (!client || !numero || !adresse || items.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier que tous les items ont un stock_id et une quantité
    const itemsValides = items.every(item => item.stock_id && item.quantite);
    if (!itemsValides) {
      toast.error('Veuillez remplir tous les articles');
      return;
    }

    setIsSubmitting(true);

    try {
      // Formater les items selon le format attendu par l'API
      const formattedItems = items.map(item => ({
        stock_id: parseInt(item.stock_id),
        quantite: parseInt(item.quantite)
      }));

      const response = await api.post('/ventes/', {
        nom_client: client,
        numero,
        adresse,
        commissionaire: commissionaire || null,
        montant_verse: parseFloat(montant) || 0,
        items: formattedItems
      });

      toast.success(response.data.message || 'Vente créée avec succès');

      setDialogOpen(false);
      resetForm();
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
    // Si la vente a des items, les charger
    if (upVente.items && upVente.items.length > 0) {
      const formattedItems = upVente.items.map((item: any) => ({
        stock_id: item.stock_id?.toString() || "",
        quantite: item.quantite?.toString() || "",
        prix_unitaire: item.prix_unitaire?.toString() || "",
        sous_total: item.sous_total?.toString() || ""
      }));
      setItems(formattedItems);
    } else {
      // Format ancien (une seule ligne)
      setItems([{
        stock_id: upVente.stock_id?.toString() || "",
        quantite: upVente.quantite?.toString() || "",
        prix_unitaire: "",
        sous_total: ""
      }]);
    }
    setClient(upVente?.nom_client || "");
    setNumero(upVente?.numero || "");
    setAdresse(upVente?.adresse || "");
    setCommissionnire(upVente?.commissionaire?.toString() || "");
    setMontant(upVente?.montant_verse?.toString() || "");
    setEditDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVente) return
    if (!client || !numero || !adresse || items.length === 0) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    const itemsValides = items.every(item => item.stock_id && item.quantite);
    if (!itemsValides) {
      toast.error('Veuillez remplir tous les articles');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedItems = items.map(item => ({
        stock_id: parseInt(item.stock_id),
        quantite: parseInt(item.quantite)
      }));

      const response = await api.put(`/ventes/${selectedVente.id}`, {
        nom_client: client,
        numero,
        adresse,
        commissionaire: commissionaire || null,
        montant_verse: parseFloat(montant) || 0,
        items: formattedItems
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
    setClient("");
    setNumero("");
    setAdresse("");
    setCommissionnire("");
    setMontant("");
    setItems([{ stock_id: "", quantite: "", prix_unitaire: "", sous_total: "" }]);
  }

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

  const handleDownloadFacture = async (venteId: string) => {
    try {
      toast.info('Génération de facture en cours...');

      const response = await api.get(`factures/vente/${venteId}/document`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${venteId}.pdf`;
      document.body.appendChild(link);
      link.click();

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

  const closeDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedVente(null);
  }

  const handleOpenPaymentDialog = (vente: any) => {
    setSelectedVenteForPayment(vente);
    setMontantVerse("");
    setPayementDialog(true);
  };


  //Traiter le paiement
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenteForPayment || !montantVerse) {
      toast.error("Veuillez saisir un montant");
      return;
    }

    const montant = parseFloat(montantVerse);
    if (montant <= 0) {
      toast.error('Le montant doit être supérieur à 0');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const response = await api.put(`ventes/reglement/${selectedVenteForPayment.id}`, {
        montant_verse: montant
      });

      toast.success(response.data.message || 'Paiment enregistré avec succès');
      setPayementDialog(false);
      setSelectedVenteForPayment(null);
      setMontantVerse("");

      await Promise.all([fetchVentesStats(), selectVente()]);
    } catch (error: any) {
      console.error('Erreur de paiement:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de l'enregistrement du paiement";
      toast.error(message);
    } finally {
      setIsProcessingPayment(false);
    }
  }


  const handleShowHistory = async (vente: any) => {
    setSelectedVenteHistory(vente);
    setLoadingHistory(true);
    setHistoryDialogOpen(true);
    
    try {
      const response = await api.get(`/ventes/${vente.id}/historique`);
      setVenteHistorique(response.data.data);
    } catch (error: any) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      toast.error('Erreur lors du chargement de l\'historique');
      setVenteHistorique(null);
    } finally {
      setLoadingHistory(false);
    }
  }

  const handleCancelClick = (vente: any) => {
    setVenteToCancel(vente);
    setCancelDialogOpen(true);
  }

  const handleCancelVente = async () => {
    if (!venteToCanel) return;

    setIsCancelling(true);
    try {
      const response = await api.put(`/ventes/${venteToCanel.id}/annuler`);
      toast.success(response.data.message || 'Vente annulée avec succès');
      setCancelDialogOpen(false);
      setVenteToCancel(null);
      await Promise.all([fetchVentesStats(), selectVente()]);
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation de la vente');
    } finally {
      setIsCancelling(false);
    }
  }

  useEffect(() => {
    fetchVentesStats()
    selectVente()
    fetchFormData()
    selectCommissionaires()
  }, [])

  const filteredVentes = selectVentes.filter((v: any) => {
    const matchSearch =
      searchTerm === "" ||
      v.nom_client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.reference.toLowerCase().includes(searchTerm.toLowerCase());

    let matchFilter = true;
    if (filterTab === "regle") matchFilter = v.est_soldee === true;
    if (filterTab === "non_regle") matchFilter = v.est_soldee === false;

    return matchSearch && matchFilter;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVentes = filteredVentes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVentes.length / itemsPerPage);

  const goToNextPage = () => {
    setCurrentPage(page => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage(page => Math.max(page - 1, 1));
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ventes</h1>
          <p className="text-muted-foreground">
            Gérez vos ventes et facturations
          </p>
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
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle vente
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                commissionaire={commissionaire}
                setCommissionnire={setCommissionnire}
                selectCommissionaire={selectCommissionaire}
                setSelectCommissionaire={setSelectCommissionaire}
                montant={montant}
                setMontant={setMontant}
                items={items}
                setItems={setItems}
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                commissionaire={commissionaire}
                setCommissionnire={setCommissionnire}
                selectCommissionaire={selectCommissionaire}
                setSelectCommissionaire={setSelectCommissionaire}
                montant={montant}
                setMontant={setMontant}
                items={items}
                setItems={setItems}
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

      {/* Dialog de détails de la vente */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la vente - {selectedVente?.reference}</DialogTitle>
          </DialogHeader>

          {selectedVente && (
            <div className="space-y-6">
              {/* Informations client */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations Client</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom complet</p>
                    <p className="font-medium">{selectedVente.nom_client}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{selectedVente.numero}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    <p className="font-medium">{selectedVente.adresse}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Articles commandés */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Articles commandés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedVente.items && selectedVente.items.length > 0 ? (
                      selectedVente.items.map((item: any, index: number) => (
                        <div key={item.id || index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold">{item.nom_produit}</p>
                            <p className="text-sm text-muted-foreground">Code: {item.code_produit}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Quantité: {item.quantite}</p>
                            <p className="text-sm text-muted-foreground">Prix unitaire: {parseFloat(item.prix_unitaire).toLocaleString('fr-FR')} Fcfa</p>
                            <p className="font-semibold text-success">Sous-total: {parseFloat(item.sous_total).toLocaleString('fr-FR')} Fcfa</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">Aucun article</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Informations financières */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations Financières</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Prix total</span>
                    <span className="font-semibold">{parseFloat(selectedVente.prix_total).toLocaleString('fr-FR')} Fcfa</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Montant versé</span>
                    <span className="font-semibold text-success">{parseFloat(selectedVente.montant_verse).toLocaleString('fr-FR')} Fcfa</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Reste à payer</span>
                    <span className={`font-semibold ${selectedVente.reste_a_payer > 0 ? 'text-warning' : 'text-success'}`}>
                      {parseFloat(selectedVente.reste_a_payer).toLocaleString('fr-FR')} Fcfa
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge variant={selectedVente.est_soldee ? 'default' : 'destructive'}>
                      {selectedVente.est_soldee ? 'Réglé' : selectedVente.reglement_statut === 1 ? 'Partiel' : 'Non réglé'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Commissionnaire */}
              {selectedVente.commissionnaire && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Commissionnaire</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nom</p>
                      <p className="font-medium">{selectedVente.commissionnaire.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taux de commission</p>
                      <p className="font-medium">{selectedVente.commissionnaire.taux_commission}%</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informations système */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations Système</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Créé par</p>
                    <p className="font-medium">{selectedVente.cree_par?.nom}</p>
                    <Badge variant="outline" className="mt-1">{selectedVente.cree_par?.role}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de création</p>
                    <p className="font-medium">{selectedVente.created_at}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={closeDetailDialog}>
                  Fermer
                </Button>
                <Button onClick={() => handleDownloadFacture(selectedVente.id)}>
                  {selectedVente?.est_soldee
                    ? 'Télécharger la facture'
                    : 'Télécharger le reçu'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes réglées</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{vente?.ventes_regles || 0}</div>
            <p className="text-xs text-muted-foreground">Paiements complétés</p>
          </CardContent>
        </Card>

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

      <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Toutes ({selectVentes.length})
            </TabsTrigger>
            <TabsTrigger value="regle" className="data-[state=active]:bg-success data-[state=active]:text-white">
              Réglées ({selectVentes.filter((v: any) => v.est_soldee === true).length})
            </TabsTrigger>
            <TabsTrigger value="non_regle" className="data-[state=active]:bg-warning data-[state=active]:text-white">
              Non réglées ({selectVentes.filter((v: any) => v.est_soldee === false).length})
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
                  <Input placeholder="Rechercher..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentVentes.length > 0 ? (
                  <>
                    {currentVentes.map((v: any) => (
                      <div key={v.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-semibold">{v.reference}</p>
                              <p className="text-sm text-muted-foreground">
                                {v.nombre_articles || 0} article(s) - {v.total_quantite || 0} unité(s)
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Client</p>
                            <p className="font-medium">{v.nom_client}</p>
                            <p className="text-xs text-muted-foreground">{v.numero}</p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Personnel</p>
                            <p className="font-medium">{v.cree_par?.nom || 'N/A'}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {v.cree_par?.role || 'employé'}
                            </Badge>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Montant</p>
                            <p className="font-semibold text-success">{parseFloat(v.montant_verse).toLocaleString('fr-FR')} Fcfa</p>
                            {v.reste_a_payer > 0 && (
                              <p className="text-xs text-warning">Reste: {parseFloat(v.reste_a_payer).toLocaleString('fr-FR')} Fcfa</p>
                            )}
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Prix_total</p>
                            <p className="font-semibold text-success">{parseFloat(v.prix_total).toLocaleString('fr-FR')} Fcfa</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Statut</p>
                            <Badge variant={v.est_soldee ? 'default' : 'destructive'}>
                              {v.est_soldee ? 'Réglé' : v.reglement_statut === 1 ? 'Partiel' : 'Non réglé'}
                            </Badge>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="text-sm">{v.created_at}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end border-t pt-3 mt-3">
                          <Button variant="outline" size="sm" onClick={() => handleShowHistory(v)}>
                            <History className="h-4 w-4 mr-2" />
                            Historique
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(v)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Détails
                          </Button>
                          {(v.est_soldee === false || v.reste_a_payer > 0) && (
                            <Button size="sm" variant="outline"
                              className="text-green-600 hover:text-green-700 hover:border-green-300"
                              onClick={() => handleOpenPaymentDialog(v)}>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Régler
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleEdit(v)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {v.statut !== 'annule' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-destructive hover:text-destructive hover:border-destructive"
                              onClick={() => handleCancelClick(v)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    <VenteHistoryDialog
                      open={historyDialogOpen}
                      onOpenChange={setHistoryDialogOpen}
                      vente={selectedVenteHistory}
                      historique={venteHistorique}
                    />
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Card className="shadow-[var(--shadow-card)]">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredVentes.length)} sur {filteredVentes.length} ventes
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                              >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Précédent
                              </Button>

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

      {/* Dialog de paiement/règlement */}
      <Dialog open={payementDialog} onOpenChange={setPayementDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enregister un paiement</DialogTitle>
          </DialogHeader>

          {selectedVenteForPayment && (
            <form onSubmit={handleProcessPayment} className="space-y4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Client</span>
                  <span className="font-medium">{selectedVenteForPayment.nom_client}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm text-muted-foreground">Prix total</span>
                  <span className="font-semibold">
                    {parseFloat(selectedVenteForPayment.prix_total).toLocaleString('fr-FR')} Fcfa
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Déjà versé</span>
                  <span className="font-medium text-success">
                    {parseFloat(selectedVenteForPayment.montant_verse).toLocaleString('fr-FR')} Fcfa
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Reste à payer</span>
                  <span className="font-bold text-warning">
                    {parseFloat(selectedVenteForPayment.reste_a_payer).toLocaleString('fr-FR')} Fcfa
                  </span>
                </div>
              </div>

              {/* Champ de saisie du montant */}
              <div className="space-y-2">
                <label htmlFor="montant_verse" className="text-sm font-medium">
                  Montant à verser (Fcfa) *
                </label>
                <Input
                  id="montant_verse"
                  type="number"
                  placeholder="Entrez le montant"
                  value={montantVerse}
                  onChange={(e) => setMontantVerse(e.target.value)}
                  min="1"
                  max={selectedVenteForPayment.reste_a_payer}
                  step="0.01"
                  required
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Montant maximum: {parseFloat(selectedVenteForPayment.reste_a_payer).toLocaleString('fr-FR')} Fcfa
                </p>
              </div>

              {/* Message d'information */}
              <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                <CreditCard className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Ce paiement sera ajouté au montant déjà versé. Le statut de la vente sera mis à jour automatiquement.
                </p>
              </div>

              {/* Boutons */}
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPayementDialog(false);
                    setSelectedVenteForPayment(null);
                    setMontantVerse("");
                  }}
                  disabled={isProcessingPayment}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isProcessingPayment}>
                  {isProcessingPayment ? (
                    <span className="flex items-center">
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Traitement...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Enregistrer le paiement
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'annulation */}
      <DeleteDialog
        open={cancelDialogOpen}
        openChange={setCancelDialogOpen}
        onConfirm={handleCancelVente}
        title="Annuler cette vente ?"
        description="Cette action annulera la vente et restaurera les quantités en stock. Les commissions associées seront également annulées."
        itemName={venteToCanel?.reference}
        isDeleting={isCancelling}
        confirmText="Annuler la vente"
      />
    </div>
  );
}