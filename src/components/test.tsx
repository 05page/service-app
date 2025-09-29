import { useState, useEffect } from "react";
import api from "../api/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { toast } from 'sonner';

type Ventes = {
  ventes_en_attente: number;
  total_ventes: number;
  total_ventes_paye: number;
  chiffres_affaire_total: number;
  total_client: number;
}

export function VentesSection() {
  const [vente, setVentes] = useState<Ventes | null>(null);
  const [selectVentes, setSelectVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // États pour le formulaire
  const [stock, setStock] = useState([]);
  const [clients, setClients] = useState([]);
  const [stockId, setStockId] = useState("");
  const [clientId, setClientId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixUnitaire, setPrixUnitaire] = useState("");

  const fetchVentesStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error('token non trouvé')
        return
      }

      console.log(token)
      const response = await api.get('/allStats')
      setVentes(response.data.data)
    } catch (error: any) {
      console.error('Erreur de récupération', error);
      if (error.response?.status === 401) {
        toast.error('Token invalide ou expiré. Veuillez vous reconnecter');
        window.location.href = '/auth'
      } else if (error.response?.status === 403) {
        toast.error('Accès refusé')
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
        toast.error('Accès refusé')
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
      // Récupérer les stocks disponibles
      const stockResponse = await api.get('/stock/');
      setStock(stockResponse.data.data || []);
      
      // Récupérer les clients
      const clientsResponse = await api.get('/clients/');
      setClients(clientsResponse.data.data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données du formulaire', error);
      toast.error('Erreur lors du chargement des données');
    }
  }

  useEffect(() => {
    fetchVentesStats()
    selectVente()
    fetchFormData()
  }, [])

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
      toast.info('Génération de la facture en cours...');
      
      const response = await api.get(`/vente/${venteId}/pdf`, {
        responseType: 'blob' // Important pour récupérer le PDF
      });

      // Créer un blob URL pour le téléchargement
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Créer un lien temporaire et déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${venteId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Facture téléchargée avec succès');
      
    } catch (error: any) {
      console.error('Erreur téléchargement facture:', error.response?.data);
      
      // Si l'erreur est un JSON (pas un PDF), la lire
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const errorData = JSON.parse(text);
          toast.error(errorData.message || 'Erreur lors de la génération de la facture');
        } catch {
          toast.error('Erreur lors de la génération de la facture');
        }
      } else {
        const message = error.response?.data?.message || 'Erreur lors du téléchargement de la facture';
        toast.error(message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stockId || !clientId || !quantite || !prixUnitaire) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const response = await api.post('/ventes/', {
        stock_id: parseInt(stockId),
        client_id: parseInt(clientId),
        quantite: parseInt(quantite),
        prix_unitaire: parseFloat(prixUnitaire)
      });

      toast.success(response.data.message || 'Vente créée avec succès');
      
      // Réinitialiser le formulaire
      setStockId("");
      setClientId("");
      setQuantite("");
      setPrixUnitaire("");
      
      // Fermer le dialog et recharger les données
      setDialogOpen(false);
      fetchVentesStats();
      selectVente();
      
    } catch (error: any) {
      console.error('Erreur création vente:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de la création de la vente";
      toast.error(message);
    }
  }

  // Mettre à jour le prix unitaire quand un stock est sélectionné
  useEffect(() => {
    if (stockId) {
      const selectedStock = stock.find((s: any) => s.id === parseInt(stockId));
      if (selectedStock) {
        setPrixUnitaire(selectedStock.prix_vente.toString());
      }
    }
  }, [stockId, stock]);

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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle vente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 py-4">
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
                              {s.nom_produit} - Stock: {s.quantite}
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

                  <div className="space-y-2">
                    <Label htmlFor="client">Client *</Label>
                    {clients && clients.length > 0 ? (
                      <Select value={clientId} onValueChange={setClientId} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((c: any) => (
                            <SelectItem key={c.id} value={c.id.toString()}>
                              {c.nom} {c.prenom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Aucun client disponible" />
                        </SelectTrigger>
                      </Select>
                    )}
                    {clients.length === 0 && (
                      <p className="text-sm text-red-500">
                        Aucun client trouvé. Veuillez ajouter des clients.
                      </p>
                    )}
                  </div>

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
                    />
                    <p className="text-xs text-muted-foreground">
                      Prix automatiquement rempli selon l'article sélectionné
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setStockId("");
                      setClientId("");
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ventes</CardTitle>
            <Euro className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{vente?.chiffres_affaire_total || 0} Fcfa</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{vente?.ventes_en_attente || 0}</div>
            <p className="text-xs text-muted-foreground">Vente en attente</p>
          </CardContent>
        </Card>

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

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total client</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vente?.total_client || 0}</div>
            <p className="text-xs text-muted-foreground">Client</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
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

      {/* Sales list */}
      <div className="grid gap-6">
        {selectVentes && selectVentes.length > 0 ? (
          selectVentes.map((vente: any) => (
            <Card key={vente.id} className="shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow">
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
              <CardContent>
                <div className="space-y-4">
                  {/* Articles */}
                  <div>
                    <h4 className="font-medium mb-2">Article vendu:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                        <span className="text-sm">
                          {vente.stock?.nom_produit || 'Produit'} (x{vente.quantite})
                        </span>
                        <span className="text-sm font-medium">{vente.prix_total} FCFA</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold text-success">{vente.total} FcFA</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">Modifier</Button>
                    <Button size="sm" variant="outline">Facture PDF</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
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