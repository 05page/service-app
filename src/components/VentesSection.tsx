// Import des hooks React pour gérer l'état et les effets
import { useState, useEffect } from "react";

// Import de l'API configurée pour les appels HTTP
import api from "../api/api"

// Import des composants UI du projet
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import des icônes utilisées
import {
  Plus,
  Search,
  Calendar,
  User,
  Package,
  Euro,
  TrendingUp,
  ShoppingCart,
  RefreshCw
} from "lucide-react";

// Import pour les notifications toast
import { toast } from 'sonner';

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

  // États pour la liste des ventes affichées
  const [selectVentes, setSelectVentes] = useState([]);

  // États pour le chargement et l'actualisation
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // État pour l'ouverture du dialog de création de vente
  const [dialogOpen, setDialogOpen] = useState(false);

  // États du formulaire de création de vente
  const [stock, setStock] = useState([]); // Liste des articles en stock
  const [stockId, setStockId] = useState(""); // ID de l'article sélectionné
  const [client, setClient] = useState(""); // Nom du client
  const [numero, setNumero] = useState(""); // Numéro de téléphone du client
  const [adresse, setAdresse] = useState(""); // Adresse du client
  const [quantite, setQuantite] = useState(""); // Quantité vendue
  const [prixUnitaire, setPrixUnitaire] = useState(""); // Prix unitaire
  const [prixTotal, setPrixTotal] = useState(""); // Prix total calculé automatiquement

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
      toast.error('Erreur lors du chargement des données');
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
  // useEffect pour initialiser les données
  useEffect(() => {
    fetchVentesStats()
    selectVente()
    fetchFormData()
  }, [])
  // Debug: observer les changements d'état
  useEffect(() => {
    console.log("État vente mis à jour:", vente);
  }, [vente]);

  // Calcul automatique du prix total en fonction de la quantité et du prix unitaire
  useEffect(() => {
    const q = parseInt(quantite) || 0;
    const pU = parseFloat(prixUnitaire) || 0;
    setPrixTotal((q * pU).toFixed(2))
  }, [quantite, prixUnitaire])

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

  // Soumission du formulaire de création de vente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérification des champs obligatoires
    if (!stockId || !client || !numero || !adresse || !quantite || !prixUnitaire) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

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

      // Réinitialisation du formulaire
      setStockId("");
      setClient("");
      setNumero("");
      setAdresse("");
      setQuantite("");
      setPrixUnitaire("");
      setPrixTotal("");

      // Fermer le dialogue et recharger les données
      setDialogOpen(false);
      fetchVentesStats();
      selectVente();

    } catch (error: any) {
      console.error('Erreur création vente:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de la création de la vente";
      toast.error(message);
    }
  }

  // Met à jour le prix unitaire quand un stock est sélectionné
  useEffect(() => {
    if (stockId) {
      const selectedStock = stock.find((s: any) => s.id === parseInt(stockId));
      if (selectedStock) {
        setPrixUnitaire(selectedStock.prix_vente.toString());
      }
    }
  }, [stockId, stock]);

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
              <form onSubmit={handleSubmit}>
                {/* Grille pour les champs du formulaire */}
                <div className="grid grid-cols-2 gap-4 py-4">
                  {/* Champ Article */}
                  <div className="space-y-2">
                    <Label htmlFor="stock">Article *</Label>
                    {stock && stock.length > 0 ? (
                      <Select value={stockId} onValueChange={setStockId} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un article" />
                        </SelectTrigger>
                        <SelectContent>
                          {stock.map((s: any) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.achat?.nom_service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Aucun article en stock" />
                        </SelectTrigger>
                      </Select>
                    )}
                    {stock.length === 0 && (
                      <p className="text-sm text-red-500">
                        Aucun article en stock. Veuillez ajouter des articles au stock.
                      </p>
                    )}
                  </div>

                  {/* Champ Client */}
                  <div className="space-y-2">
                    <Label htmlFor="client">Client *</Label>
                    <Input
                      id="client"
                      type="text"
                      placeholder="Nom complet"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      min="1"
                      required
                    />
                  </div>

                  {/* Champ Numéro */}
                  <div className="space-y-2">
                    <Label htmlFor="client">Numero *</Label>
                    <Input
                      id="numero"
                      type="text"
                      placeholder="+225 07 01 02 03 04"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      min="1"
                      required
                    />
                  </div>

                  {/* Champ Adresse */}
                  <div className="space-y-2">
                    <Label htmlFor="client">Adresse *</Label>
                    <Input
                      id="adresse"
                      type="text"
                      placeholder="Ex: Yopougon"
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                      min="1"
                      required
                    />
                  </div>

                  {/* Champ Quantité */}
                  <div className="space-y-2">
                    <Label htmlFor="quantite">Quantité *</Label>
                    <Input
                      id="quantite"
                      type="number"
                      placeholder="1"
                      value={quantite}
                      onChange={(e) => setQuantite(e.target.value)}
                      min="1"
                      required
                    />
                  </div>

                  {/* Champ Prix unitaire */}
                  <div className="space-y-2">
                    <Label htmlFor="prixUnitaire">Prix unitaire (FCFA) *</Label>
                    <Input
                      id="prixUnitaire"
                      type="number"
                      placeholder="Prix de vente"
                      value={prixUnitaire}
                      onChange={(e) => setPrixUnitaire(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Prix automatiquement rempli selon l'article sélectionné
                    </p>
                  </div>

                  {/* Champ Prix total */}
                  <div className="space-y-2">
                    <Label htmlFor="prixTotal">Prix Total (FCFA) *</Label>
                    <Input
                      id="prixTotal"
                      type="number"
                      placeholder="Prix total"
                      value={prixTotal}
                      onChange={(e) => setPrixTotal(e.target.value)}
                      min="0"
                      step="0.01"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Prix automatiquement rempli selon la quantité sélectionnée
                    </p>
                  </div>
                </div>

                {/* Boutons annuler et créer */}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setStockId("");
                      setClient("");
                      setQuantite("");
                      setPrixUnitaire("");
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    Créer la vente
                  </Button>
                </div>
              </form>
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

      {/* Section recherche et filtres */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="pt-6">
          <div className="flex gap-4">
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
        </CardContent>
      </Card>

      {/* Liste des ventes */}
      <div className="grid gap-6">
        {selectVentes && selectVentes.length > 0 ? (
          selectVentes.map((vente: any) => (
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
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(vente.created_at).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center gap-1">
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
                          "outline"
                    }
                    className={
                      vente.statut === "Payé" ? "bg-success text-success-foreground" :
                        vente.statut === "En attente" ? "bg-warning text-warning-foreground" : ""
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

                  {/* Boutons modifier et télécharger */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">Modifier</Button>
                    <Button
                      onClick={() => handleDownloadFacture(vente.id)}
                      size="sm"
                      variant="outline"
                    >
                      Facture PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
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
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer ma première vente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
