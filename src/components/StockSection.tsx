import { useState, useEffect } from "react";
import api from '../api/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, TrendingDown, BarChart3, RefreshCw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function StockSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategorie, setSelectedCategorie] = useState<string>("tous");
  const [selectedStatut, setSelectedStatut] = useState<string>("tous");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [stock, setStock] = useState(null);
  const [selectStock, setSelectStock] = useState([]);
  const [selectUpdateStock, setSelecUpdatetStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [achatId, setAchatId] = useState<any[]>([]);

  //Formulaire
  const [achat, setAchat] = useState("");
  const [categorie, setCategorie] = useState("");
  const [quantite, setQuantite] = useState("");
  const [quantiMin, setQuantiteMin] = useState("")
  const [prixAchat, setPrixAchat] = useState("");
  const [prixVente, setPrixVente] = useState("");
  const [description, setDescription] = useState("");

  //Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stockDelete, setStockDelete] = useState<any | null>(null);

  const handleDeleteClick = (stock: any) => {
    setStockDelete(stock);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (stockDelete) {
      // Logique de suppression ici
      try {
        // Exemple d'appel API
        await api.delete(`/stock/${stockDelete.id}`);
        // Recharger les données
        await fetchStock();
        await getStock();
        toast.success(`Produit ${stockDelete.code_produit} supprimé avec succès`);
        setDeleteDialogOpen(false);
        setStockDelete(null);
      } catch (error: any) {
        toast.error("Erreur lors de la suppression");
        console.error(error.response?.data || error);
      }
    }
  };
  const fetchStock = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token non trouvé")
        return
      }
      const role = localStorage.getItem("userRole");
      const endpoint = role === "admin" ? "/allStats" : "/stock/stats"
      const response = await api.get(endpoint);
      setStock(response.data.data);

      const res = await api.get('/achat');
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
    } catch (error) {
      console.error('Erreur survenue lors de la récupération', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Données du formulaire:', {
      achat,
      categorie,
      quantite,
      quantiMin,
      prixVente,
      description
    });

    if (!achat || !categorie || !quantite || !quantiMin || !prixVente) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

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
      setAchat("");
      setCategorie("");
      setQuantite("");
      setQuantiteMin("");
      setPrixAchat("");
      setPrixVente("");
      setDescription("");

      fetchStock();
      getStock();
      setDialogOpen(false);

    } catch (error: any) {
      console.error('Erreur création stock:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de l'ajout du stock";
      toast.error(message);
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
    setEditDialogOpen(true);  // Ouvrir le dialog ici
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectUpdateStock) return;
    if (!achatId || !categorie || !quantite || !quantiMin || !prixVente) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

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
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error(error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de mise à jour de du stock";
      toast.error(message);
    }
  }

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


  // const filteredArticles = articles.filter(article => {
  //   const matchesSearch = article.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     article.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     article.fournisseur.toLowerCase().includes(searchTerm.toLowerCase());
  //   const matchesCategorie = selectedCategorie === "tous" || article.categorie === selectedCategorie;
  //   const matchesStatut = selectedStatut === "tous" || article.statut === selectedStatut;
  //   return matchesSearch && matchesCategorie && matchesStatut;
  // });

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "disponible":
        return "default";
      case "alerte":
        return "secondary";
      case "rupture":
        return "destructive";
      case "indisponible":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case "disponible":
        return "Disponible";
      case "alerte":
        return "Alerte";
      case "rupture":
        return "Rupture";
      case "indisponible":
        return "Indisponible";
      default:
        return statut;
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock</h1>
          <p className="text-muted-foreground">Gérez votre inventaire de services et produits</p>
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
                Nouvel Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel article au stock</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="achat">Achat *</Label>
                    {achatId && achatId.length > 0 ? (
                      <Select value={achat} onValueChange={setAchat} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'achat à ajouter au stock" />
                        </SelectTrigger>
                        <SelectContent>
                          {achatId?.map((a: any) => (
                            <SelectItem key={a.id} value={a.id.toString()}>
                              {a.numero_achat} - {a.nom_service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Aucun achat disponible" />
                        </SelectTrigger>
                      </Select>
                    )}
                    {achatId.length === 0 && (
                      <p className="text-sm text-red-500">
                        Aucun achat trouvé. Veuillez effectuer un achat
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categorie">Catégorie *</Label>
                    <Select value={categorie} onValueChange={setCategorie} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="logiciels">Logiciels</SelectItem>
                        <SelectItem value="hebergement">Hébergement</SelectItem>
                        <SelectItem value="securite">Sécurité</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="materiel">Matériel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantite">Quantité initiale *</Label>
                    <Input
                      id="quantite"
                      type="number"
                      value={quantite}
                      onChange={(e) => setQuantite(e.target.value)}
                      placeholder="Quantité récupérée de l'achat"
                      required
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Cette quantité sera automatiquement remplie selon l'achat sélectionné
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantiteMin">Quantité minimale *</Label>
                    <Input
                      id="quantiteMin"
                      value={quantiMin}
                      onChange={(e) => setQuantiteMin(e.target.value)}
                      type="number"
                      placeholder="5"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prixAchat">Prix d'achat (FCFA)</Label>
                    <Input
                      id="prixAchat"
                      type="number"
                      value={prixAchat}
                      placeholder="Prix d'achat automatique"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prixVente">Prix de vente (FCFA) *</Label>
                    <Input
                      id="prixVente"
                      value={prixVente}
                      onChange={(e) => setPrixVente(e.target.value)}
                      type="number"
                      placeholder="150"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description détaillée de l'article"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      // Réinitialiser le formulaire
                      setAchat("");
                      setCategorie("");
                      setQuantite("");
                      setQuantiteMin("");
                      setPrixAchat("");
                      setPrixVente("");
                      setDescription("");
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    Ajouter à l'inventaire
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel article au stock</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdate}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="achat">Achat *</Label>
                    {achatId && achatId.length > 0 ? (
                      <Select value={achat} onValueChange={setAchat} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'achat à ajouter au stock" />
                        </SelectTrigger>
                        <SelectContent>
                          {achatId?.map((a: any) => (
                            <SelectItem key={a.id} value={a.id.toString()}>
                              {a.numero_achat} - {a.nom_service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Aucun achat disponible" />
                        </SelectTrigger>
                      </Select>
                    )}
                    {achatId.length === 0 && (
                      <p className="text-sm text-red-500">
                        Aucun achat trouvé. Veuillez effectuer un achat
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categorie">Catégorie *</Label>
                    <Select value={categorie} onValueChange={setCategorie} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="logiciels">Logiciels</SelectItem>
                        <SelectItem value="hebergement">Hébergement</SelectItem>
                        <SelectItem value="securite">Sécurité</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="materiel">Matériel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantite">Quantité initiale *</Label>
                    <Input
                      id="quantite"
                      type="number"
                      value={quantite}
                      onChange={(e) => setQuantite(e.target.value)}
                      placeholder="Quantité récupérée de l'achat"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Cette quantité sera automatiquement remplie selon l'achat sélectionné
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantiteMin">Quantité minimale *</Label>
                    <Input
                      id="quantiteMin"
                      value={quantiMin}
                      onChange={(e) => setQuantiteMin(e.target.value)}
                      type="number"
                      placeholder="5"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prixAchat">Prix d'achat (FCFA)</Label>
                    <Input
                      id="prixAchat"
                      type="number"
                      value={prixAchat}
                      placeholder="Prix d'achat automatique"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prixVente">Prix de vente (FCFA) *</Label>
                    <Input
                      id="prixVente"
                      value={prixVente}
                      onChange={(e) => setPrixVente(e.target.value)}
                      type="number"
                      placeholder="150"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description détaillée de l'article"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditDialogOpen(false);
                      // Réinitialiser le formulaire
                      setAchat("");
                      setCategorie("");
                      setQuantite("");
                      setQuantiteMin("");
                      setPrixAchat("");
                      setPrixVente("");
                      setDescription("");
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    Ajouter à l'inventaire
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
            <CardTitle className="text-sm font-medium">Valeur Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stock?.total_valeur_stock?.toLocaleString() || 0} Fcfa</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire</CardTitle>
          <CardDescription>Suivez vos stocks et gérez les niveaux d'inventaire</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, référence ou fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategorie} onValueChange={setSelectedCategorie}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes les catégories</SelectItem>
                <SelectItem value="Logiciels">Logiciels</SelectItem>
                <SelectItem value="Hébergement">Hébergement</SelectItem>
                <SelectItem value="Sécurité">Sécurité</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatut} onValueChange={setSelectedStatut}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
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
                <TableHead>Stock</TableHead>
                {/* <TableHead>Prix d'achat</TableHead> */}
                <TableHead>Prix de vente</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectStock && selectStock.length > 0 ? (
                selectStock.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{s.achat?.nom_service}</div>
                        <div className="text-sm text-muted-foreground">{s?.code_produit}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{s?.quantite} unités</div>
                        <div className="text-muted-foreground text-xs">
                          Min: {s?.quantite_min}
                        </div>
                      </div>
                    </TableCell>
                    {/* <TableCell>{s?.prix_unitaire} Fcfa</TableCell> */}
                    <TableCell>{s?.prix_vente} Fcfa</TableCell>
                    <TableCell>
                      <Badge variant={getStatutColor(s?.statut)}>
                        {getStatutLabel(s?.statut)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            handleEdit(s)
                            setEditDialogOpen(true)
                          }}
                          variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(s)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    Aucun article en stock
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la commande {stockDelete?.code_produit} ?
              Cela supprimera toutes les ventes liées à ce stock !! Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}