import api from '../api/api';
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Package, Calendar, TrendingUp, DollarSign, RefreshCw, FileText } from "lucide-react";
import { toast } from 'sonner';


interface Achat {
  id: string;
  numeroCommande: string;
  fournisseur: string;
  service: string;
  quantite: number;
  prixUnitaire: number;
  montantTotal: number;
  statut: "en_attente" | "confirme" | "recu" | "annule";
  dateCommande: string;
  dateLivraison?: string;
  description: string;
}

type Achats = {
  total_achat_commande: number,
  total_achats: number,
  total_achats_recu: number,
  total_prix_achats: number
}

export function AchatsSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState<string>("tous");
  const [selectedPeriode, setSelectedPeriode] = useState<string>("ce_mois");

  const [refreshing, setRefreshing] = useState(false)
  const [achat, setchAchat] = useState([]);
  const [fournisseur, setFournisseur] = useState<any[]>([]);
  const [selectCount, setSelectCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectAchat, setSelectAchat] = useState<any>(null);

  const [fournisseurId, setFournisseurId] = useState("");
  const [typeService, setTypeService] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixUnitaire, setPrixUnitaire] = useState("")
  const [dateCommande, setDateCommande] = useState("");
  const [dateLivraison, setDateLivraison] = useState("");
  const [statut, setStatut] = useState("");
  const [description, setDescription] = useState("");


  const fecthAchats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error('token non trouvé');
      }
      console.log(token);

      //Réupération des stats
      const role = localStorage.getItem("userRole");
      const endpoint = role === "admin" ? "/allStats" : "/achat/stats";
      const response = await api.get(endpoint);
      setSelectCount(response.data.data);

      //Récupération des fournisseurs 
      const res = await api.get('/fournisseurs')
      console.log('Réponse API fournisseurs:', res.data.data);
      if (res.data.success && res.data.data) {
        console.log('Nombre de fournisseurs trouvés:', res.data.data.length);
        setFournisseur(res.data.data);
      } else {
        console.warn('Aucun fournisseur trouvé');
        setFournisseur([]);
      }
    } catch (error: any) {
      console.error('Erreur de récupération', error);

      if (error.response) {
        // ✅ Erreur renvoyée par le backend
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        console.error("Headers:", error.response.headers);

        if (error.response.status === 401) {
          console.error('Token invalide ou expiré. Veuillez vous reconnecter');
          window.location.href = '/auth';
        } else {
          console.error('Erreur API:', error.response.data.message || 'Erreur inconnue');
        }

      } else if (error.request) {
        // ✅ Requête envoyée mais pas de réponse (timeout, serveur down, CORS…)
        console.error("Pas de réponse du serveur:", error.request);

      } else {
        // ✅ Erreur côté front (bug JS, mauvaise config axios…)
        console.error("Erreur front:", error.message);
      }

      setFournisseur([]);
    } finally {
      setLoading(false)
    }
  }

  const getAchats = async () => {
    try {
      const response = await api.get('/achat/');
      setchAchat(response.data.data)
    } catch (error) {
      console.error('Erreur survenue lors de la récupération des achats', error);
      setchAchat([]);
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fecthAchats();
      await getAchats();
      toast.success('Données actualisées')
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fournisseurId || !typeService || !quantite || !prixUnitaire || !dateCommande || !statut) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      const response = await api.post('/achat/', {
        fournisseur_id: fournisseurId,
        nom_service: typeService,
        quantite: parseInt(quantite),
        prix_unitaire: parseFloat(prixUnitaire),
        date_commande: dateCommande,
        date_livraison: dateLivraison || null,
        statut,
        description
      });

      toast(response.data.message || 'Achat créé avec succès');
      setFournisseurId("");
      setTypeService("");
      setQuantite("");
      setPrixUnitaire("")
      setDateCommande("");
      setDateLivraison("");
      setStatut("");
      setDescription("");

      setDialogOpen(false)
      getAchats();
      fecthAchats();
    } catch (error: any) {
      console.error('Erreur création achat:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de l'ajout de l'achat";
      toast.error(message);
    }
  }

  const handleEdit = (upAchat: any) => {
    setSelectAchat(upAchat);
    setFournisseurId(upAchat.fournisseur_id?.toString() || "");
    setTypeService(upAchat.nom_service || "");
    setQuantite(upAchat.quantite?.toString() || "");
    setPrixUnitaire(upAchat.prix_unitaire?.toString() || "");
    setDateCommande(upAchat.date_commande || "");
    setDateLivraison(upAchat.date_livraison || "");
    setStatut(upAchat.statut || "");
    setDescription(upAchat.description || "");
    setEditDialogOpen(true);
  };


  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectAchat) return;
    if (!fournisseurId || !typeService || !quantite || !prixUnitaire || !dateCommande || !statut) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const response = await api.put(`/achat/${selectAchat.id}`, {
        fournisseur_id: fournisseurId,
        nom_service: typeService,
        quantite: parseInt(quantite),
        prix_unitaire: parseFloat(prixUnitaire),
        date_commande: dateCommande,
        date_livraison: dateLivraison || null,
        statut,
        description
      });
      toast.success(response.data.message || 'Achat mis à jour');
      setSelectAchat(null)
      setEditDialogOpen(false);
      getAchats();
      fecthAchats();
    } catch (error: any) {
      console.error(error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de mise à jour de l'achat";
      toast.error(message);
    }
  }

  const handleDelete = async (achatId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet achat ?')) {
      return;
    }
    try {
      const response = await api.delete(`/achat/${achatId}`);
      toast.success(response.data.message || 'Achat supprimé avec succès');
      getAchats();
      fecthAchats();
    } catch (error: any) {
      console.error('Erreur suppression achat:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de la suppression de l'achat";
      toast.error(message);
    }
  }
  useEffect(() => {
    fecthAchats();
    getAchats();
  }, []);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "en attente":
        return "secondary";
      case "reçu":
        return "default";
      case "annule":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case "en  attente":
        return "En attente";
      case "confirme":
        return "Confirmé";
      case "recu":
        return "Reçu";
      case "annule":
        return "Annulé";
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
            <p className="text-muted-foreground">Chargement des achats...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Achats</h1>
          <p className="text-muted-foreground">Gérez vos commandes et achats de services</p>
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
                Nouvelle Commande
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle commande</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fournisseur">Fournisseur *</Label>
                    {fournisseur && fournisseur.length > 0 ? (
                      <Select value={fournisseurId} onValueChange={setFournisseurId} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un fournisseur" />
                        </SelectTrigger>
                        <SelectContent>
                          {fournisseur?.map((f: any) => (
                            <SelectItem key={f.id} value={f.id.toString()}>
                              {f.nom_fournisseurs}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Aucun fournisseur disponible" />
                        </SelectTrigger>
                      </Select>
                    )}
                    {fournisseur.length === 0 && (
                      <p className='text-sm text-red-500'>
                        Aucun fournisseur trouvé. Veuillez en créer un d'abord
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service">Service *</Label>
                    {fournisseur && fournisseur.length > 0 ? (
                      <Select value={typeService} onValueChange={setTypeService} required>
                        <SelectTrigger>
                          <SelectValue placeholder="nom du service" />
                        </SelectTrigger>
                        <SelectContent>
                          {fournisseur.map((f: any) => (
                            <SelectItem key={f.id} value={f.description}>
                              {f.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Aucun fournisseur disponible" />
                        </SelectTrigger>
                      </Select>
                    )}
                    {fournisseur.length === 0 && (
                      <p className="text-sm text-red-500">
                        Aucun fournisseur trouvé. Veuillez en créer un d'abord.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantite">Quantité *</Label>
                    <Input id="quantite"
                      value={quantite} onChange={(e) => setQuantite(e.target.value)}
                      type="number" min="1" placeholder="1" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prix">Prix unitaire (FCFA)</Label>
                    <Input id="prix"
                      value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)}
                      type="number" min="100" placeholder="1000" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prix">Prix total (FCFA)</Label>
                    <Input id="prix"
                      value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)}
                      type="number" min="100" placeholder="1000" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="livraison">Date de commande *</Label>
                    <Input id="livraison"
                      value={dateCommande} onChange={(e) => setDateCommande(e.target.value)}
                      type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="livraison">Date de livraison</Label>
                    <Input id="livraison"
                      value={dateLivraison} onChange={(e) => setDateLivraison(e.target.value)}
                      type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statut">Statut *</Label>
                    <Select value={statut} onValueChange={setStatut} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commande">Commande</SelectItem>
                        <SelectItem value="paye">Payé</SelectItem>
                        <SelectItem value="reçu">Reçu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description détaillée du service" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type='button' variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                  <Button type='submit'>Créer la commande</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* edit */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Modifier</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleUpdate}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="fournisseur">Fournisseur *</Label>
                    {fournisseur && fournisseur.length > 0 ? (
                      <Select value={fournisseurId} onValueChange={setFournisseurId} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un fournisseur" />
                        </SelectTrigger>
                        <SelectContent>
                          {fournisseur?.map((f: any) => (
                            <SelectItem key={f.id} value={f.id.toString()}>
                              {f.nom_fournisseurs}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Aucun fournisseur disponible" />
                        </SelectTrigger>
                      </Select>
                    )}
                    {fournisseur.length === 0 && (
                      <p className='text-sm text-red-500'>
                        Aucun fournisseur trouvé. Veuillez en créer un d'abord
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service">Service *</Label>
                    {fournisseur && fournisseur.length > 0 ? (
                      <Select value={typeService} onValueChange={setTypeService} required>
                        <SelectTrigger>
                          <SelectValue placeholder="nom du service" />
                        </SelectTrigger>
                        <SelectContent>
                          {fournisseur.map((f: any) => (
                            <SelectItem key={f.id} value={f.description}>
                              {f.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Aucun fournisseur disponible" />
                        </SelectTrigger>
                      </Select>
                    )}
                    {fournisseur.length === 0 && (
                      <p className="text-sm text-red-500">
                        Aucun fournisseur trouvé. Veuillez en créer un d'abord.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantite">Quantité *</Label>
                    <Input id="quantite"
                      value={quantite} onChange={(e) => setQuantite(e.target.value)}
                      type="number" min="1" placeholder="1" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prix">Prix unitaire (FCFA)</Label>
                    <Input id="prix"
                      value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)}
                      type="number" min="100" placeholder="1000" />
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="prix">Prix total (FCFA)</Label>
                    <Input id="prix"
                      value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)}
                      type="number" min="100" placeholder="1000" disabled />
                  </div> */}
                  <div className="space-y-2">
                    <Label htmlFor="livraison">Date de commande *</Label>
                    <Input id="livraison"
                      value={dateCommande} onChange={(e) => setDateCommande(e.target.value)}
                      type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="livraison">Date de livraison</Label>
                    <Input id="livraison"
                      value={dateLivraison} onChange={(e) => setDateLivraison(e.target.value)}
                      type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="statut">Statut *</Label>
                    <Select value={statut} onValueChange={setStatut} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commande">Commande</SelectItem>
                        <SelectItem value="paye">Payé</SelectItem>
                        <SelectItem value="reçu">Reçu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description détaillée du service" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type='button' variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                  <Button type='submit'>Modifier la commande</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Total Commandes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(selectCount?.total_achat_commande ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Total Achat */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Achat</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {(selectCount?.total_achats ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Reçus */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reçus</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(selectCount?.total_achats_recu ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Montant Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(selectCount?.total_prix_achats ?? 0).toLocaleString()} Fcfa
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des achats</CardTitle>
          <CardDescription>Suivez vos commandes et leur statut</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par numéro, fournisseur ou service..."
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
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="confirme">Confirmé</SelectItem>
                <SelectItem value="recu">Reçu</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ce_mois">Ce mois</SelectItem>
                <SelectItem value="mois_dernier">Mois dernier</SelectItem>
                <SelectItem value="trimestre">Ce trimestre</SelectItem>
                <SelectItem value="annee">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Prix unitaire</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Livraison</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {achat.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{a.numero_achat}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(a.created_at).toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{a.fournisseur?.nom_fournisseurs}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{a.nom_service}</div>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {a.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{a.quantite}</TableCell>
                  <TableCell>{a.prix_unitaire} Fcfa</TableCell>
                  <TableCell className="font-medium">{a.prix_total} Fcfa</TableCell>
                  <TableCell>
                    <Badge variant={getStatutColor(a.statut)}>
                      {getStatutLabel(a.statut)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {a.date_livraison ?
                      new Date(a.date_livraison).toLocaleDateString('fr-FR') :
                      <span className="text-muted-foreground">Non définie</span>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary hover:text-primary-foreground"
                        title='Générer la facture fournisseur'
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleEdit(a)}
                        variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(a.id)}
                        variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}