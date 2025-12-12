import { useState, useEffect } from "react";
import api from '../api/api'
import FormDialog from "./Form/FormDialog";
import RenewStockDialog from "./Form/RenewStockDialog";
import StockHistoryDialog from "./Form/StockHistoryDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Search, Edit, Package, AlertTriangle, TrendingDown, BarChart3, RefreshCw, ShieldAlert,
  Image as ImageIcon, Eye, TrendingUp, PackagePlus, PackageMinus, RotateCcw, History
} from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "./Pagination";

export function StockSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategorie, setSelectedCategorie] = useState<string>("tous");
  const [selectedStatut, setSelectedStatut] = useState<string>("tous");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [stock, setStock] = useState(null);
  const [selectStock, setSelectStock] = useState([]);
  const [selectUpdateStock, setSelecUpdatetStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [achatId, setAchatId] = useState<any[]>([]);
  const [mouvements, setMouvements] = useState<any[]>([]);
  
  // États pour le renouvellement
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [stockToRenew, setStockToRenew] = useState<any>(null);
  const [isRenewing, setIsRenewing] = useState(false);
  
  // États pour l'historique
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [stockHistorique, setStockHistorique] = useState<any>(null);

  //Formulaire
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [achat, setAchat] = useState("");
  const [categorie, setCategorie] = useState("");
  const [quantite, setQuantite] = useState("");
  const [quantiMin, setQuantiteMin] = useState("")
  const [prixAchat, setPrixAchat] = useState("");
  const [prixVente, setPrixVente] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const userRole = localStorage.getItem("userRole");

  const fetchStock = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token non trouvé")
        return
      }
      const role = localStorage.getItem("userRole");
      const endpoint = role === "admin" ? "/allStats" : "/allStats"
      const response = await api.get(endpoint);
      setStock(response.data.data);

      const res = await api.get('/achat/achatsDisponibles');
      console.log('Réponse achats:', res.data.data);
      if (res.data.success && res.data.data) {
        console.log("Nombre d'achat trouvés:", res.data.data.length);
        setAchatId(res.data.data)
      } else {
        console.warn('Aucun achat trouvé');
        setAchatId([]);
      }

    } catch (error: any) {
      console.error('Erreur survenue lors de la récupération du stock', error)
      if (error.response?.status === 401) {
        toast.error('Token invalide ou expiré. Veuillez vous reconnecter');
        window.location.href = '/auth'
      } else if (error.response?.status === 403) {
        setAccessDenied(true)
        toast.error('Accès refusé')
      } else {
        toast.error('Erreur lors du chargement des données');
      }
      setAchatId([]);
    } finally {
      setLoading(false);
    }
  }

  const getStock = async () => {
    try {
      const response = await api.get('/stock/');
      setSelectStock(response.data.data);
      console.log(response.data.data?.pho)

    } catch (error) {
      console.error('Erreur survenue lors de la récupération', error);
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStock();
      await getStock();
      toast.success('Données actualisées')
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  }

  const resetForm = () => {
    setAchat("");
    setCategorie("");
    setQuantite("");
    setQuantiteMin("");
    setPrixAchat("");
    setPrixVente("");
    setDescription("");
    setPhoto("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Données du formulaire:', {
      achat, categorie, quantite,
      quantiMin, prixVente, description
    });

    if (!achat || !categorie || !quantite || !quantiMin || !prixVente) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsSubmitting(true)
    try {
      const stockData = {
        achat_id: parseInt(achat), // S'assurer que c'est un entier
        categorie,
        quantite: parseInt(quantite), // CORRECTION: Ajouter la quantité
        quantite_min: parseInt(quantiMin),
        prix_vente: parseFloat(prixVente),
        description: description || null
      };

      console.log('Données envoyées à l\'API:', stockData);

      const response = await api.post('/stock', stockData);

      toast.success(response.data.message || "Stock ajouté avec succès");

      // Réinitialiser le formulaire
      resetForm();
      await fetchStock();
      await getStock();
      setDialogOpen(false);

    } catch (error: any) {
      console.error('Erreur création stock:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de l'ajout du stock";
      toast.error(message);
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (updateStock: any) => {
    setSelecUpdatetStock(updateStock)  // Notez le typo dans le nom de la fonction
    setAchat(updateStock.achat_id?.toString() || "");
    setCategorie(updateStock.categorie || "");
    setQuantite(updateStock.quantite?.toString() || "");  // Ajoutez toString()
    setQuantiteMin(updateStock.quantite_min?.toString() || "");  // Ajoutez toString()
    setPrixVente(updateStock.prix_vente?.toString() || "");  // Ajoutez toString()
    setDescription(updateStock.description || "");
    setPhoto(updateStock.photo || "");
    setEditDialogOpen(true);  // Ouvrir le dialog ici
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectUpdateStock) return;
    if (!achatId || !categorie || !quantite || !quantiMin || !prixVente) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true)
    try {
      const response = await api.put(`/stock/${selectUpdateStock.id}`, {
        achat_id: parseInt(achat), // S'assurer que c'est un entier
        categorie,
        quantite: parseInt(quantite), // CORRECTION: Ajouter la quantité
        quantite_min: parseInt(quantiMin),
        prix_vente: parseFloat(prixVente),
        description: description || null
      });
      toast.success(response.data.message || 'Stock mis à jour');
      setSelecUpdatetStock(null)
      resetForm()
      await fetchStock();
      await getStock();
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error(error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de mise à jour du stock";
      toast.error(message);
    } finally {
      setIsSubmitting(false)
    }
  }


  // Fonction pour renouveler un stock
  const handleRenewStock = async (stockId: number, achatId: number, commentaire: string) => {
    setIsRenewing(true);
    try {
      const response = await api.post('/stock/renouveler', {
        stock_id: stockId,
        achat_id: achatId,
        commentaire
      });
      
      toast.success(response.data.message || "Stock renouvelé avec succès");
      await Promise.all([fetchStock(), getStock()]);
      setRenewDialogOpen(false);
      setStockToRenew(null);
    } catch (error: any) {
      console.error('Erreur renouvellement:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors du renouvellement du stock";
      toast.error(message);
    } finally {
      setIsRenewing(false);
    }
  };

  // Fonction pour afficher l'historique d'un stock
  const handleShowHistory = async (stock: any) => {
    try {
      console.log('=== CHARGEMENT HISTORIQUE ===');
      console.log('Stock ID:', stock.id);
      const response = await api.get(`/stock/${stock.id}/historique`);
      console.log('Réponse complète:', response.data);
      console.log('Données reçues:', response.data.data);
      setStockHistorique(response.data.data);
      setHistoryDialogOpen(true);
    } catch (error: any) {
      console.error('Erreur historique:', error.response?.data);
      toast.error("Erreur lors du chargement de l'historique");
    }
  };

  // Fonction pour ouvrir le dialogue de renouvellement
  const handleRenewClick = (stock: any) => {
    setStockToRenew(stock);
    setRenewDialogOpen(true);
  };

  // Calculer les IDs des achats déjà utilisés dans le stock
  const usedAchatIds = selectStock.map((s: any) => s.achat_id).filter(Boolean);

  useEffect(() => {
    fetchStock();
    getStock();
  }, []);

  useEffect(() => {
    if (achat) {
      const achatSelectionne = achatId.find(a => a.id === parseInt(achat));
      console.log('Achat sélectionné:', achatSelectionne);
      if (achatSelectionne) {
        setQuantite(String(achatSelectionne.quantite));
        setPrixAchat(String(achatSelectionne.prix_unitaire)); // Récupérer aussi le prix d'achat
        console.log('Quantité mise à jour:', achatSelectionne.quantite);
      }
    }
  }, [achat, achatId]);

  const getStatutColor = (statut: string) => {
    const colors = {
      disponible: "default",
      alerte: "secondary",
      rupture: "destructive",
      indisponible: "secondary"
    };
    return colors[statut] || "secondary";
  };

  const getStatutLabel = (statut: string) => {
    const labels = {
      disponible: "Disponible",
      alerte: "Alerte",
      rupture: "Rupture",
      indisponible: "Indisponible"
    };
    return labels[statut] || statut;
  };

  // Filtrage des stocks
  const filteredStock = selectStock.filter((s: any) => {
    const matchSearch = searchTerm === "" ||
      s.achat?.nom_service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code_produit?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategorie = selectedCategorie === "tous" || s.categorie === selectedCategorie;
    const matchStatut = selectedStatut === "tous" || s.statut === selectedStatut;
    return matchSearch && matchCategorie && matchStatut;
  });

  const { currentPage, totalPages, currentData: currentStock, setCurrentPage } =
    usePagination({ data: filteredStock, itemsPerPage: 8 });

  // Calculer les entrées et sorties par article
  const getEntreesSorties = (stockId: number) => {
    const entrees = mouvements
      .filter((m: any) => m.stock_id === stockId && (m.type_mouvement === 'achat' || m.type_mouvement === 'renouvellement'))
      .reduce((acc: number, m: any) => acc + parseInt(m.quantite || 0), 0);

    const sorties = mouvements
      .filter((m: any) => m.stock_id === stockId && m.type_mouvement === 'vente')
      .reduce((acc: number, m: any) => acc + parseInt(m.quantite || 0), 0);

    return { entrees, sorties };
  };

  const getImages = (item: any) => {
    console.log('Item reçu:', item);
    console.log('Photos dans achat.items:', item?.achat?.items?.[0]?.photos);

    // L'image se trouve dans item.achat.items[0].photos
    const photos = item?.achat?.items?.[0]?.photos;

    if (photos && Array.isArray(photos) && photos.length > 0) {
      const imagePath = photos[0].path;
      console.log('Image path brut:', imagePath);

      // Si le path ne commence pas par http, ajouter l'URL de base
      if (imagePath && !imagePath.startsWith('http')) {
        const baseURL = 'http://127.0.0.1:8000/'; // Votre URL backend https://api.entralevel.ci/
        const fullUrl = baseURL + imagePath;
        console.log('URL complète:', fullUrl);
        return fullUrl;
      }
      return imagePath;
    }

    console.log('Aucune image trouvée');
    return null;
  };
  // Calculer les stats globales
  const totalEntrees = mouvements
    .filter((m: any) => m.type_mouvement === 'achat' || m.type_mouvement === 'renouvellement')
    .reduce((acc: number, m: any) => acc + parseInt(m.quantite || 0), 0);

  const totalSorties = mouvements
    .filter((m: any) => m.type_mouvement === 'vente')
    .reduce((acc: number, m: any) => acc + parseInt(m.quantite || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement du stock...</p>
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
              Vous n'avez pas la permission d'accéder à la gestion des stocks.
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
          <h1 className="text-3xl font-bold tracking-tight">Stock</h1>
          <p className="text-muted-foreground">Gérez votre inventaire de services et produits</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Nouvel Article</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Ajouter un nouvel article</DialogTitle></DialogHeader>
              <FormDialog
                achatId={achatId}
                usedAchatIds={usedAchatIds}
                achat={achat}
                setAchat={setAchat}
                categorie={categorie}
                setCategorie={setCategorie}
                quantiMin={quantiMin}
                setQuantiteMin={setQuantiteMin}
                prixVente={prixVente}
                setPrixVente={setPrixVente}
                description={description}
                setDescription={setDescription}
                isSubmitting={isSubmitting}
                handleSubmit={handleSubmit}
                handleUpdate={handleUpdate}
                setEditDialogOpen={setEditDialogOpen}
                setDialogOpen={setDialogOpen}
                resetForm={resetForm}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Modifier l'article</DialogTitle></DialogHeader>
              <FormDialog
                isEdit
                achatId={achatId}
                usedAchatIds={usedAchatIds}
                achat={achat}
                setAchat={setAchat}
                categorie={categorie}
                setCategorie={setCategorie}
                quantiMin={quantiMin}
                setQuantiteMin={setQuantiteMin}
                prixVente={prixVente}
                setPrixVente={setPrixVente}
                description={description}
                setDescription={setDescription}
                isSubmitting={isSubmitting}
                handleSubmit={handleSubmit}
                handleUpdate={handleUpdate}
                setEditDialogOpen={setEditDialogOpen}
                setDialogOpen={setDialogOpen}
                resetForm={resetForm}
              />
            </DialogContent>
          </Dialog>
          
          {/* Dialog de renouvellement */}
          <RenewStockDialog
            open={renewDialogOpen}
            onOpenChange={setRenewDialogOpen}
            stock={stockToRenew}
            availableAchats={achatId}
            onRenew={handleRenewStock}
            isSubmitting={isRenewing}
          />
          
          {/* Dialog d'historique */}
          <StockHistoryDialog
            open={historyDialogOpen}
            onOpenChange={setHistoryDialogOpen}
            historique={stockHistorique}
          />
        </div>
      </div>

      <div className={`grid gap-4 md:grid-cols-3 ${userRole === "admin" ? "lg:grid-cols-6" : "lg:grid-cols-5"}`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stock?.total_produits_stock || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stock?.total_stock_disponible || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stock?.total_stock_faible || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entrées</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stock?.total_entrees_stock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sorties</CardTitle>
            <PackageMinus className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stock?.total_sorties_stock}</div>
          </CardContent>
        </Card>
        {userRole === "admin" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valeur Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stock?.total_valeur_stock?.toLocaleString() || 0} Fcfa</div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventaire</CardTitle>
          <CardDescription>Suivez vos stocks et gérez les niveaux d'inventaire</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={selectedCategorie} onValueChange={setSelectedCategorie}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes</SelectItem>
                <SelectItem value="logiciels">Logiciels</SelectItem>
                <SelectItem value="hebergement">Hébergement</SelectItem>
                <SelectItem value="securite">Sécurité</SelectItem>
                <SelectItem value="services">Services</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatut} onValueChange={setSelectedStatut}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="alerte">Alerte</SelectItem>
                <SelectItem value="rupture">Rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Entrées</TableHead>
                <TableHead>Sorties</TableHead>
                <TableHead>Prix unitaire</TableHead>
                <TableHead>Prix vente</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentStock.length > 0 ? (
                currentStock.map((s: any) => {
                  const { entrees, sorties } = getEntreesSorties(s.id);
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{s.achat?.nom_service}</div>
                          <div className="text-sm text-muted-foreground">{s.code_produit}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.categorie || "Non définie"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          {(() => {
                            const imageUrl = getImages(s);
                            console.log('URL image pour', s.code_produit, ':', imageUrl);

                            return imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={s.achat?.nom_service || s.nom_service || 'Produit'}
                                className="w-12 h-12 object-cover rounded border"
                                onLoad={() => console.log('Image chargée avec succès:', imageUrl)}
                              />
                            ) : (
                              <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            );
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{s.quantite} unités</div>
                          <div className="text-muted-foreground text-xs">Min: {s.quantite_min}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <PackagePlus className="h-3 w-3 mr-1" />
                          {s?.entre_stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <PackageMinus className="h-3 w-3 mr-1" />
                          {s?.sortie_stock}
                        </Badge>
                      </TableCell>
                      <TableCell>{s?.achat?.items && s.achat.items.length > 0 ? s.achat.items[0].prix_unitaire.toLocaleString() : 0} Fcfa</TableCell>
                      <TableCell>{s.prix_vente} Fcfa</TableCell>
                      <TableCell>
                        <Badge variant={getStatutColor(s.statut)}>{getStatutLabel(s.statut)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            onClick={() => handleShowHistory(s)} 
                            variant="outline" 
                            size="sm" 
                            title='Historique complet'
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          {(s.statut === 'rupture' || s.statut === 'alerte') && userRole === "admin" && (
                            <Button 
                              onClick={() => handleRenewClick(s)} 
                              variant="outline" 
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              title='Renouveler le stock'
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            onClick={() => { setDetail(s); setDetailDialogOpen(true) }} 
                            variant="outline" 
                            size="sm" 
                            title='Détails'
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {userRole === "admin" && (
                            <Button onClick={() => handleEdit(s)} variant="outline" size="sm" title='Modifier'>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-[400px]">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">Aucun article en stock</h3>
                      <p className="text-sm text-muted-foreground text-center mb-6">
                        {searchTerm || selectedCategorie !== "tous" || selectedStatut !== "tous"
                          ? "Aucun article ne correspond à vos critères."
                          : "Ajoutez votre premier article pour commencer."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {currentStock.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredStock.length}
              itemsPerPage={8}
              onPageChange={setCurrentPage}
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog Détails */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Détails du produit {detail?.code_produit}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleShowHistory(detail)}
              >
                <History className="h-4 w-4 mr-2" />
                Voir l'historique complet
              </Button>
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="grid gap-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  {getImages(detail) ? (
                    <img
                      src={getImages(detail)}
                      alt={detail.achat?.nom_service || 'Produit'}
                      className="h-48 w-48 object-cover rounded-lg border shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`h-48 w-48 bg-muted rounded-lg flex items-center justify-center ${getImages(detail) ? 'hidden' : ''}`}>
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1 grid gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Article</p>
                    <p className="font-medium">{detail?.achat?.items && detail.achat.items.length > 0 ? detail.achat.items[0].nom_service : "Non défini"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Code produit</p>
                    <p className="font-medium">{detail.code_produit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Catégorie</p>
                    <Badge variant="outline">{detail.categorie}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantité actuelle</p>
                      <p className="font-bold text-xl">{detail.quantite} unités</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quantité min</p>
                      <p className="font-medium">{detail.quantite_min} unités</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Entrées totales</p>
                  <p className="font-bold text-lg text-green-600">+{detail.entre_stock}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sorties totales</p>
                  <p className="font-bold text-lg text-red-600">-{detail.sortie_stock}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prix d'achat unitaire</p>
                  <p className="font-medium">{detail?.achat?.items && detail.achat.items.length > 0 ? detail.achat.items[0].prix_unitaire.toLocaleString() : 0} Fcfa</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prix de vente</p>
                  <p className="text-2xl font-bold">{detail.prix_vente?.toLocaleString()} Fcfa</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant={getStatutColor(detail.statut)}>
                    {getStatutLabel(detail.statut)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valeur totale</p>
                  <p className="font-medium">
                    {((detail.quantite || 0) * (detail.prix_vente || 0)).toLocaleString()} Fcfa
                  </p>
                </div>
              </div>
              {detail.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{detail.description}</p>
                </div>
              )}
              {(detail.statut === 'rupture' || detail.statut === 'alerte') && (
                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => {
                      setDetailDialogOpen(false);
                      handleRenewClick(detail);
                    }}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Renouveler ce stock
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
