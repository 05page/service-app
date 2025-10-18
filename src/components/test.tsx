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
  Eye,
  FileText,
  Receipt,
  CreditCard,
  CheckCircle,
  XCircle,
  Image as ImageIcon
} from "lucide-react";
import { toast } from 'sonner';

type Ventes = {
  ventes_en_attente: number;
  total_ventes: number;
  ventes_paye: number;
  chiffres_affaire_total: string;
  total_client?: number;
  mes_clients?: number;
  chiffres_affaire_mois: string;
}

export function VentesSection() {
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [venteDelete, setVendelete] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stock, setStock] = useState([]);
  const [stockId, setStockId] = useState("");
  const [client, setClient] = useState("");
  const [numero, setNumero] = useState("");
  const [adresse, setAdresse] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixUnitaire, setPrixUnitaire] = useState("");
  const [prixTotal, setPrixTotal] = useState("");
  const [filterTab, setFilterTab] = useState("all");
  
  // États pour règlements
  const [montantPaye, setMontantPaye] = useState("");
  const [dateReglement, setDateReglement] = useState(new Date().toISOString().split('T')[0]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

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
      setSelectVentes(response.data.data || [])
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
    if (!stockId || !client || !numero || !adresse || !quantite || !prixUnitaire) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await api.post('/ventes/', {
        stock_id: parseInt(stockId),
        nom_client: client,
        numero,
        adresse,
        quantite: parseInt(quantite),
      });
      toast.success(response.data.message || 'Vente créée avec succès');
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

  const handleAddReglement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVente || !montantPaye) {
      toast.error('Veuillez entrer un montant');
      return;
    }
    
    try {
      // Appel API pour ajouter un règlement
      toast.success('Règlement ajouté avec succès');
      setReglementDialogOpen(false);
      setMontantPaye("");
      await fetchVentesStats();
      await selectVente();
    } catch (error: any) {
      toast.error('Erreur lors de l\'ajout du règlement');
    }
  }

  const resetForm = () => {
    setStockId("");
    setClient("");
    setNumero("");
    setAdresse("");
    setQuantite("");
    setPrixUnitaire("");
    setPrixTotal("");
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
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`${isRecu ? 'Reçu' : 'Facture'} téléchargé avec succès`);
    } catch (error: any) {
      toast.error('Erreur lors du téléchargement');
    }
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

  const handleViewDetails = (vente: any) => {
    setSelectedVente(vente);
    setDetailDialogOpen(true);
  }

  const handleOpenReglement = (vente: any) => {
    setSelectedVente(vente);
    setReglementDialogOpen(true);
  }

  useEffect(() => {
    fetchVentesStats()
    selectVente()
    fetchFormData()
  }, [])

  useEffect(() => {
    const q = parseInt(quantite) || 0;
    const pU = parseFloat(prixUnitaire) || 0;
    setPrixTotal((q * pU).toFixed(2))
  }, [quantite, prixUnitaire])

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Ventes & Règlements</h1>
          <p className="text-muted-foreground">
            Gérez vos ventes, facturations et règlements
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ventes</CardTitle>
            <Euro className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {vente?.chiffres_affaire_total ? parseFloat(vente.chiffres_affaire_total).toLocaleString('fr-FR') : 0} Fcfa
            </div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réglées</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{vente?.ventes_paye || 0}</div>
            <p className="text-xs text-muted-foreground">Ventes réglées</p>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non réglées</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{vente?.ventes_en_attente || 0}</div>
            <p className="text-xs text-muted-foreground">Ventes en attente</p>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vente?.total_client || vente?.mes_clients || 0}</div>
            <p className="text-xs text-muted-foreground">Total clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour filtrer */}
      <Tabs value={filterTab} onValueChange={setFilterTab}>
        <TabsList>
          <TabsTrigger value="all">Toutes les ventes</TabsTrigger>
          <TabsTrigger value="regle">Réglées</TabsTrigger>
          <TabsTrigger value="non_regle">Non réglées</TabsTrigger>
        </TabsList>

        <TabsContent value={filterTab} className="space-y-4 mt-6">
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
                  currentVentes.map((v: any) => (
                    <div key={v.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
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

                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(v)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleOpenReglement(v)}>
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownloadFacture(v.id, v.statut_paiement !== 'réglé')}
                          >
                            {v.statut_paiement === 'réglé' ? <FileText className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucune vente à afficher
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
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
              {selectedVente.photo_url && (
                <img src={selectedVente.photo_url} alt="Produit" className="w-full h-48 object-cover rounded" />
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Règlement */}
      <Dialog open={reglementDialogOpen} onOpenChange={setReglementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un règlement</DialogTitle>
          </DialogHeader>
          {selectedVente && (
            <form onSubmit={handleAddReglement} className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Vente: {selectedVente.reference}</p>
                <p className="font-semibold mb-4">Montant total: {selectedVente.prix_total} Fcfa</p>
              </div>
              <div>
                <label className="text-sm font-medium">Montant payé</label>
                <Input
                  type="number"
                  value={montantPaye}
                  onChange={(e) => setMontantPaye(e.target.value)}
                  placeholder="Entrez le montant"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date de règlement</label>
                <Input
                  type="date"
                  value={dateReglement}
                  onChange={(e) => setDateReglement(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setReglementDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Enregistrer le règlement
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={deleteDialogOpen}
        openChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={venteDelete?.reference || "cette vente"}
        isDeleting={isDeleting}
      />
    </div>
  );
}