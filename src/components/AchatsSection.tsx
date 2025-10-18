import api from '../api/api';
import DeleteDialog from './Form/DeleteDialog';
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Package, Calendar, TrendingUp, DollarSign, RefreshCw, FileText, ShieldAlert, Image as ImageIcon, Eye } from "lucide-react";
import { toast } from 'sonner';
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "../components/Pagination";

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
  const [accessDenied, setAccessDenied] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false)
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
  const [prixTotal, setPrixTotal] = useState("")
  const [dateCommande, setDateCommande] = useState("");
  const [dateLivraison, setDateLivraison] = useState("");
  const [statut, setStatut] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [achatDelete, setAchatDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);

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
        if (error.response.status === 401) {
          console.error('Token invalide ou expiré. Veuillez vous reconnecter');
          window.location.href = '/auth';
        } else {
          console.error('Erreur API:', error.response.data.message || 'Erreur inconnue');
        }
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
    } catch (error: any) {
      console.error('Erreur survenue lors de la récupération des achats', error);
      if (error.response?.status === 403) {
        setAccessDenied(true); // Active l'affichage d'accès refusé
        toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires');
      } else {
        console.error('Erreur lors du chargement des données');
      }
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
    setIsSubmitting(true)
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
      setPhoto("");
      setDialogOpen(false);
      getAchats();
      fecthAchats();
    } catch (error: any) {
      console.error('Erreur création achat:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de l'ajout de l'achat";
      toast.error(message);
    } finally {
      setIsSubmitting(false)
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
    setPhoto(upAchat.photo || "");
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectAchat) return;
    if (!fournisseurId || !typeService || !quantite || !prixUnitaire || !dateCommande || !statut) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsSubmitting(true)
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClick = (achat: any) => {
    setAchatDelete(achat);
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (achatDelete) {
      try {
        await api.delete(`/achat/${achatDelete.id}`);
        await Promise.all([fecthAchats(), getAchats()]);
        toast.success(`Achat ${achatDelete?.numero_achat} supprimé avec succès`);
        setDeleteDialogOpen(false);
        setAchatDelete(null);
      } catch (error: any) {
        toast.error("Erreur lors de la suppression");
        console.error(error.response?.data || error);
      } finally {
        setIsDeleting(false);
      }
    }
  }

  const handleDownloadFacture = async (achatId: string) => {
    try {
      toast.info('Génération de facture en cours...');
      const response = await api.get(`factures/achat/${achatId}/pdf`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      document.body.appendChild(link);
      link.href = url;
      link.download = `facture-${achatId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url)
      toast.success("Facture téléchargée avec succès")
    } catch (error: any) {
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        console.error("Réponse brute:", text);
        try {
          const errorData = JSON.parse(text);
          toast.error(errorData.message || 'Erreur lors de la génération de la facture');
        } catch {
          toast.error("Erreur lors de la génération de la facture");
        }
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors du téléchargement de la facture')
      }
    }
  }
  // Ajoutez ce useEffect après les autres useEffect
  useEffect(() => {
    if (fournisseurId) {
      const fournisseurSelectionne = fournisseur.find(f => f.id === parseInt(fournisseurId));
      if (fournisseurSelectionne && fournisseurSelectionne.description) {
        setTypeService(fournisseurSelectionne.description);
      }
    }
  }, [fournisseurId, fournisseur]);

  useEffect(() => {
    fecthAchats();
    getAchats();
  }, []);

  useEffect(() => {
    const q = parseInt(quantite) || 0;
    const pU = parseFloat(prixUnitaire) || 0;
    setPrixTotal((q * pU).toFixed(2))
  }, [quantite, prixUnitaire])

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "commande": return "secondary";
      case "paye": return "default";
      case "reçu": return "default";
      case "annule": return "destructive";
      default: return "secondary";
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case "commande": return "Commande";
      case "paye": return "Payé";
      case "reçu": return "Reçu";
      case "annule": return "Annulé";
      default: return statut;
    }
  };

  const filteredAchats = achat.filter((a: any) => {
    const matchSearch = searchTerm === "" ||
      a.numero_achat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.fournisseur?.nom_fournisseurs?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.nom_service?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = selectedStatut === "tous" || a.statut === selectedStatut;
    let matchPeriode = true;
    if (selectedPeriode !== "tous") {
      const achatDate = new Date(a.created_at);
      const now = new Date();
      switch (selectedPeriode) {
        case "ce_mois":
          matchPeriode = achatDate.getMonth() === now.getMonth() &&
            achatDate.getFullYear() === now.getFullYear();
          break;
        case "mois_dernier":
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          matchPeriode = achatDate.getMonth() === lastMonth.getMonth() &&
            achatDate.getFullYear() === lastMonth.getFullYear();
          break;
        case "trimestre":
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          matchPeriode = achatDate >= threeMonthsAgo;
          break;
        case "annee":
          matchPeriode = achatDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    return matchSearch && matchStatut && matchPeriode;
  });

  // Utilisation du hook de pagination sur les clients filtrés
  const { currentPage, totalPages, currentData: currentAchats, setCurrentPage } =
    usePagination({ data: filteredAchats, itemsPerPage: 6 });

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
  // Affichage en cas d'accès refusé (erreur 403)
  if (accessDenied) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">
              Vous n'avez pas la permission d'accéder à la gestion des achats.
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
          <h1 className="text-3xl font-bold tracking-tight">Achats</h1>
          <p className="text-muted-foreground">Gérez vos commandes et achats de services</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
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
                    <Label>Fournisseur *</Label>
                    {fournisseur.length > 0 ? (
                      <Select value={fournisseurId} onValueChange={setFournisseurId} required>
                        <SelectTrigger><SelectValue placeholder="Sélectionner un fournisseur" /></SelectTrigger>
                        <SelectContent>
                          {fournisseur.map((f: any) => (
                            <SelectItem key={f.id} value={f.id.toString()}>{f.nom_fournisseurs}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select disabled><SelectTrigger><SelectValue placeholder="Aucun fournisseur" /></SelectTrigger></Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Service *</Label>
                    <Input value={typeService} onChange={(e) => setTypeService(e.target.value)}
                      placeholder="Service" disabled className="bg-muted"/>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantité *</Label>
                    <Input value={quantite} onChange={(e) => setQuantite(e.target.value)}
                      type="number" min="1" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Prix unitaire *</Label>
                    <Input value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)}
                      type="number" min="100" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Prix total</Label>
                    <Input value={prixTotal} type="number" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de commande *</Label>
                    <Input value={dateCommande} onChange={(e) => setDateCommande(e.target.value)} type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de livraison</Label>
                    <Input value={dateLivraison} onChange={(e) => setDateLivraison(e.target.value)} type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Statut *</Label>
                    <Select value={statut} onValueChange={setStatut} required>
                      <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commande">Commande</SelectItem>
                        <SelectItem value="paye">Payé</SelectItem>
                        <SelectItem value="reçu">Reçu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type='button' variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                  <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? <><RefreshCw className="animate-spin h-4 w-4 mr-2" />Création...</> : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Modifier</DialogTitle></DialogHeader>
              <form onSubmit={handleUpdate}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Fournisseur *</Label>
                    <Select value={fournisseurId} onValueChange={setFournisseurId} required>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {fournisseur.map((f: any) => (
                          <SelectItem key={f.id} value={f.id.toString()}>{f.nom_fournisseurs}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Service *</Label>
                    <Input value={typeService} onChange={(e) => setTypeService(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantité *</Label>
                    <Input value={quantite} onChange={(e) => setQuantite(e.target.value)} type="number" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Prix unitaire *</Label>
                    <Input value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)} type="number" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de commande *</Label>
                    <Input value={dateCommande} onChange={(e) => setDateCommande(e.target.value)} type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de livraison</Label>
                    <Input value={dateLivraison} onChange={(e) => setDateLivraison(e.target.value)} type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Statut *</Label>
                    <Select value={statut} onValueChange={setStatut} required>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commande">Commande</SelectItem>
                        <SelectItem value="paye">Payé</SelectItem>
                        <SelectItem value="reçu">Reçu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type='button' variant="outline" onClick={() => setEditDialogOpen(false)}>Annuler</Button>
                  <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? <><RefreshCw className="animate-spin h-4 w-4 mr-2" />Mise à jour...</> : "Modifier"}
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
            <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(selectCount?.total_achat_commande ?? 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Achat</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{(selectCount?.total_achats ?? 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reçus</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{(selectCount?.total_achats_recu ?? 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(selectCount?.total_prix_achats ?? 0).toLocaleString()} Fcfa</div>
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
                <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Select value={selectedStatut} onValueChange={setSelectedStatut}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous</SelectItem>
                <SelectItem value="commande">Commande</SelectItem>
                <SelectItem value="paye">Payé</SelectItem>
                <SelectItem value="reçu">Reçu</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes</SelectItem>
                <SelectItem value="ce_mois">Ce mois</SelectItem>
                <SelectItem value="mois_dernier">Mois dernier</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="annee">Année</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Photo</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Prix unitaire</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Livraison</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentAchats.length > 0 ? (
                currentAchats.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{a.numero_achat}</div>
                        <div className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>{a.fournisseur?.nom_fournisseurs}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{a.nom_service}</div>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">{a.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{a.quantite}</TableCell>
                    <TableCell>
                      {a.photo ? (
                        <img src={photo} alt='produit' className='h-10 w-10 object-cover rounded'/>
                      ): (
                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{a.prix_unitaire} Fcfa</TableCell>
                    <TableCell className="font-medium">{a.prix_total} Fcfa</TableCell>
                    <TableCell>
                      <Badge variant={getStatutColor(a.statut)}>{getStatutLabel(a.statut)}</Badge>
                    </TableCell>
                    <TableCell>
                      {a.date_livraison ? new Date(a.date_livraison).toLocaleDateString('fr-FR') :
                        <span className="text-muted-foreground">Non définie</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button onClick={() => {setDetail(a); setDetailDialogOpen(true)}} variant="outline" size="sm" title='Détails'>
                          <Eye className='h-4 w-4'/>
                        </Button>
                        <Button onClick={() => handleDownloadFacture(a.id)} variant="outline" size="sm" title='Facture'>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleEdit(a)} variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleClick(a)} variant="outline" size="sm">
                          <Trash2 className= "h-4 w-4" />
                        </Button>
                        <DeleteDialog
                          open={deleteDialogOpen}
                          openChange={setDeleteDialogOpen}
                          onConfirm={handleDelete}
                          itemName={`la commande ${achatDelete?.numero_achat}`}
                          description="Cela supprimera toutes les actions liés à cet achat. Cette action est irréversible."
                          isDeleting={isDeleting}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-[400px]">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">Aucun achat disponible</h3>
                      <p className="text-sm text-muted-foreground text-center mb-6">
                        {searchTerm || selectedStatut !== "tous" || selectedPeriode !== "tous"
                          ? "Aucun achat ne correspond à vos critères de recherche."
                          : "Vous n'avez pas encore effectué d'achat. Créez votre premier achat pour commencer."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {currentAchats.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAchats.length}
              itemsPerPage={6}
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
            <DialogTitle>Détails de l'achat {detail?.numero_achat}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="grid gap-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  {detail.photo ? (
                    <img src={detail.photo} alt="Produit" className="h-48 w-48 object-cover rounded-lg" />
                  ) : (
                    <div className="h-48 w-48 bg-muted rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 grid gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Fournisseur</p>
                    <p className="font-medium">{detail.fournisseur?.nom_fournisseurs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service</p>
                    <p className="font-medium">{detail.nom_service}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantité</p>
                      <p className="font-medium">{detail.quantite}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Prix unitaire</p>
                      <p className="font-medium">{detail.prix_unitaire?.toLocaleString()} Fcfa</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prix total</p>
                    <p className="text-2xl font-bold">{detail.prix_total?.toLocaleString()} Fcfa</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date de commande</p>
                  <p className="font-medium">{new Date(detail.date_commande).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de livraison</p>
                  <p className="font-medium">
                    {detail.date_livraison 
                      ? new Date(detail.date_livraison).toLocaleDateString('fr-FR') 
                      : "Non définie"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant={getStatutColor(detail.statut)}>
                    {getStatutLabel(detail.statut)}
                  </Badge>
                </div>
              </div>
              {detail.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{detail.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 