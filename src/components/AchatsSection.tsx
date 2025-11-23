import api from '../api/api';
import { useState, useEffect } from "react";
import DeleteDialog from "./Form/DeleteDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Search, Edit, Package, Calendar, TrendingUp, DollarSign,
  RefreshCw, FileText, ShieldAlert, Image as ImageIcon, Eye, X,
  ChevronLeft, ChevronRight, Upload, Download, Ban
} from "lucide-react";
import { toast } from 'sonner';
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "../components/Pagination";

type Achats = {
  total_achat_commande: number,
  total_achats: number,
  total_achats_recu: number,
  total_prix_achats: number
}

type ItemAchat = {
  quantite: string,
  prix_unitaire: string,
  prix_total: string,
  date_commande: string,
  date_livraison: string
}

export function AchatsSection() {
  //Ajout de plusieurs articles:
  const [achatItems, setAchatIems] = useState<ItemAchat[]>([
    { quantite: "", prix_unitaire: "", prix_total: "", date_commande: "", date_livraison: "" }
  ]);

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
  const userRole = localStorage.getItem("userRole");

  const [fournisseurId, setFournisseurId] = useState("");
  const [typeService, setTypeService] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixUnitaire, setPrixUnitaire] = useState("")
  const [prixTotal, setPrixTotal] = useState("")
  const [dateCommande, setDateCommande] = useState("");
  const [dateLivraison, setDateLivraison] = useState("");
  const [statut, setStatut] = useState("");
  const [description, setDescription] = useState("");

  // Gestion des photos
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // États supplémentaires à ajouter
  const [existingPhotos, setExistingPhotos] = useState<any[]>([]); // Photos existantes de la BDD
  const [photosToDelete, setPhotosToDelete] = useState<number[]>([]); // IDs des photos à supprimer

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);

  // Pour la galerie dans les détails
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // États pour l'annulation
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [achatToCancel, setAchatToCancel] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fecthAchats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error('token non trouvé');
      }
      const role = localStorage.getItem("userRole");
      const endpoint = role === "admin" ? "/allStats" : "allStats";
      const response = await api.get(endpoint);
      setSelectCount(response.data.data);

      const res = await api.get('/fournisseurs')
      if (res.data.success && res.data.data) {
        setFournisseur(res.data.data);
        console.log(res.data.data)
      } else {
        setFournisseur([]);
      }
    } catch (error: any) {
      console.error('Erreur de récupération', error);
      if (error.response) {
        if (error.response.status === 401) {
          window.location.href = '/auth';
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
        setAccessDenied(true);
        toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires');
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
      const formData = new FormData();
      formData.append('fournisseur_id', fournisseurId);
      formData.append('nom_service', typeService);
      formData.append('quantite', quantite);
      formData.append('prix_unitaire', prixUnitaire);
      formData.append('date_commande', dateCommande);
      if (dateLivraison) formData.append('date_livraison', dateLivraison);
      formData.append('statut', statut);
      if (description) formData.append('description', description);

      // Ajouter les photos
      photoFiles.forEach((file) => {
        formData.append('photos[]', file);
      });

      const response = await api.post('/achat/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(response.data.message || 'Achat créé avec succès');
      resetForm();
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
  // Gestion des photos existantes et nouvelles
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalPhotos = existingPhotos.length - photosToDelete.length + photoFiles.length + newFiles.length;

    if (totalPhotos > 4) {
      toast.error('Vous ne pouvez avoir que 4 photos maximum');
      return;
    }

    // Vérifier la taille et le type de chaque fichier
    const validFiles = newFiles.filter(file => {
      if (file.size > 2048 * 1024) {
        toast.error(`${file.name} est trop volumineux (max 2MB)`);
        return false;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name} n'est pas un format valide`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setPhotoFiles(prev => [...prev, ...validFiles]);

    // Créer les previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Supprimer une photo existante (marquer pour suppression)
  const removeExistingPhoto = (photoId: number) => {
    setPhotosToDelete(prev => [...prev, photoId]);
  };

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
    // Charger les photos existantes
    const photos = upAchat.photos || [];
    setExistingPhotos(upAchat.photos || []);
    setPhotosToDelete([]);
    setPhotoFiles([]);
    // Construire les previews pour affichage
    const previews = photos.map(photo => photo.path); // utiliser directement le path reçu du backend
    setPhotoPreviews(previews);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectAchat) return;

    if (!fournisseurId || !typeService || !quantite || !prixUnitaire || !dateCommande || !statut) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier le nombre total de photos
    const totalPhotos = existingPhotos.length - photosToDelete.length + photoFiles.length;
    if (totalPhotos > 4) {
      toast.error('Vous ne pouvez avoir que 4 photos maximum');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Ajouter les données de base
      formData.append('fournisseur_id', fournisseurId);
      formData.append('nom_service', typeService);
      formData.append('quantite', quantite);
      formData.append('prix_unitaire', prixUnitaire);
      formData.append('date_commande', dateCommande);
      if (dateLivraison) formData.append('date_livraison', dateLivraison);
      formData.append('statut', statut);
      if (description) formData.append('description', description);

      // Ajouter les nouvelles photos
      photoFiles.forEach((file, index) => {
        formData.append('photos[]', file);
      });

      // Ajouter les IDs des photos à supprimer
      if (photosToDelete.length > 0) {
        formData.append('photos_to_delete', JSON.stringify(photosToDelete));
      }

      const response = await api.post(`/achat/${selectAchat.id}?_method=PUT`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(response.data.message || "Achat mis à jour");
      setEditDialogOpen(false);
      resetForm();
      await fecthAchats();
      await getAchats();
    } catch (error: any) {
      console.error(error.response?.data);
      const message = error?.response?.data?.message || "Erreur survenue lors de la mise à jour de l'achat";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFournisseurId("");
    setTypeService("");
    setQuantite("");
    setPrixUnitaire("");
    setDateCommande("");
    setDateLivraison("");
    setStatut("");
    setDescription("");
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setExistingPhotos([]);
    setPhotosToDelete([]);
    setSelectAchat(null);
  };

  // Navigation dans la galerie
  const nextPhoto = () => {
    if (detail?.photos && currentPhotoIndex < detail.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };


  const handleDownloadFacture = async (achatId: string) => {
    try {
      toast.info('Génération de facture en cours...');
      const response = await api.get(`factures/achat/${achatId}/pdf`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
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

  const openDetailDialog = (achat: any) => {
    setDetail(achat);
    setCurrentPhotoIndex(0);
    setDetailDialogOpen(true);
  };

  const handleCancelClick = (achat: any) => {
    setAchatToCancel(achat);
    setCancelDialogOpen(true);
  }

  const handleCancelAchat = async () => {
    if (!achatToCancel) return;

    setIsCancelling(true);
    try {
      const response = await api.put(`/achat/${achatToCancel.id}/annuler`);
      toast.success(response.data.message || 'Achat annulé avec succès');
      setCancelDialogOpen(false);
      setAchatToCancel(null);
      await Promise.all([fecthAchats(), getAchats()]);
    } catch (error: any) {
      console.error('Erreur lors de l\'annulation:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'annulation de l\'achat');
    } finally {
      setIsCancelling(false);
    }
  }

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
      case "partiellement_recu": return "Partiellement Reçu";
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
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Commande
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      placeholder="Service" disabled className="bg-muted" />
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

                  {/* Section Photos */}
                  <div className="col-span-2 space-y-2">
                    <Label>Photos (Maximum 4)</Label>
                    <div className="border-2 border-dashed rounded-lg p-4">
                      <input
                        type="file"
                        id="photos"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        multiple
                        onChange={handlePhotoChange}
                        className="hidden"
                        disabled={photoFiles.length >= 4}
                      />
                      <label
                        htmlFor="photos"
                        className={`flex flex-col items-center justify-center cursor-pointer ${photoFiles.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Cliquez pour ajouter des photos ({photoFiles.length}/4)
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          JPEG, PNG, JPG, WEBP (max 2MB)
                        </span>
                      </label>
                    </div>

                    {/* Preview des photos */}
                    {photoPreviews.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {photoPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type='button' variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                    Annuler
                  </Button>
                  <Button type='submit' disabled={isSubmitting}>
                    {isSubmitting ? <><RefreshCw className="animate-spin h-4 w-4 mr-2" />Création...</> : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={editDialogOpen} onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Modifier</DialogTitle></DialogHeader>
              <form onSubmit={handleUpdate}>
                {/* Même structure que le formulaire de création */}
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
                  {/* Section Photos */}
                  <div className="col-span-2 space-y-2">
                    <Label>Photos (Maximum 4)</Label>
                    {/* Zone d'ajout de nouvelles photos */}
                    <div className="border-2 border-dashed rounded-lg p-4">
                      <input
                        type="file"
                        id="photos-edit"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        multiple
                        onChange={handlePhotoChange}
                        className="hidden"
                        disabled={
                          existingPhotos.length - photosToDelete.length + photoFiles.length >= 4
                        }
                      />
                      <label
                        htmlFor="photos-edit"
                        className={`flex flex-col items-center justify-center cursor-pointer ${existingPhotos.length - photosToDelete.length + photoFiles.length >= 4
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                          }`}
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Ajouter des photos ({existingPhotos.length - photosToDelete.length + photoFiles.length}/4)
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          JPEG, PNG, JPG, WEBP (max 2MB)
                        </span>
                      </label>
                    </div>

                    {/* Preview des nouvelles photos */}
                    {photoPreviews.length > 0 && (
                      <div>
                        <div className="grid grid-cols-4 gap-2">
                          {photoPreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Nouvelle photo ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type='button' variant="outline" onClick={() => { setEditDialogOpen(false); resetForm(); }}>
                    Annuler
                  </Button>
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
      <div className={`grid gap-4 ${userRole === "admin" ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
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
            <CardTitle className="text-sm font-medium">Non Reçus</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{(selectCount?.achats_non_recu ?? 0).toLocaleString()}</div>
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
            <CardTitle className="text-sm font-medium">Achats Annules</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{(selectCount?.achats_annule ?? 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        {userRole === "admin" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(selectCount?.total_prix_achats ?? 0).toLocaleString('fr-FR')} Fcfa</div>
            </CardContent>
          </Card>
        )}
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
                <SelectItem value="annule">Annulé</SelectItem>
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
                <TableHead>Photos</TableHead>
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
                        <div className="font-medium">
                          {a.items && a.items.length > 0 ? a.items[0].nom_service : 'Non défini'}
                        </div>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">{a.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {a.photos && a.photos.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <img src={a.photos[0].path} alt='produit' className='h-10 w-10 object-cover rounded' />
                          {a.photos.length > 1 && (
                            <span className="text-xs text-muted-foreground">+{a.photos.length - 1}</span>
                          )}
                        </div>
                      ) : (
                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{a.items && a.items.length > 0 ? a.items[0].quantite : "Non defini"}</TableCell>
                    <TableCell>{a.items && a.items.length > 0 ? a.items[0].prix_unitaire : '000'} Fcfa</TableCell>
                    <TableCell className="font-medium">{a.items && a.items.length > 0 ? a.items[0].prix_total : "000"} Fcfa</TableCell>
                    <TableCell>
                      <Badge variant={getStatutColor(a.statut)}>{getStatutLabel(a.statut)}</Badge>
                    </TableCell>
                    <TableCell>
                      {a.items && a.items.length > 0 && a.items[0].date_livraison ? new Date(a.items[0].date_livraison).toLocaleDateString('fr-FR') :
                        <span className="text-muted-foreground">Non définie</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button onClick={() => openDetailDialog(a)} variant="outline" size="sm" title='Détails'>
                          <Eye className='h-4 w-4' />
                        </Button>
                        {userRole === "admin" && (
                          <>
                            <Button onClick={() => handleEdit(a)} variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {a.statut !== 'annule' && (
                              <Button
                                onClick={() => handleCancelClick(a)}
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:border-destructive"
                                title="Annuler"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-[400px]">
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

      {/* Dialog Détails avec Galerie */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de l'achat {detail?.numero_achat}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="grid gap-6">
              {/* Galerie de photos */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  {detail.photos && detail.photos.length > 0 ? (
                    <div className="relative">
                      <img
                        src={detail.photos[currentPhotoIndex]?.path}
                        alt="Produit"
                        className="h-64 w-64 object-cover rounded-lg"
                      />

                      {/* Navigation photos */}
                      {detail.photos.length > 1 && (
                        <>
                          <button
                            onClick={prevPhoto}
                            disabled={currentPhotoIndex === 0}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/70 transition-all"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>

                          <button
                            onClick={nextPhoto}
                            disabled={currentPhotoIndex === detail.photos.length - 1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/70 transition-all"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}

                      {/* Miniatures */}
                      {detail.photos.length > 1 && (
                        <div className="flex gap-2 mt-2">
                          {detail.photos.map((photo: any, index: number) => (
                            <button
                              key={index}
                              onClick={() => setCurrentPhotoIndex(index)}
                              className={`relative h-16 w-16 rounded overflow-hidden border-2 transition-all ${currentPhotoIndex === index
                                ? 'border-primary ring-2 ring-primary'
                                : 'border-transparent hover:border-muted-foreground'
                                }`}
                            >
                              <img
                                src={photo.path}
                                alt={`Miniature ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-64 w-64 bg-muted rounded-lg flex items-center justify-center">
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
                    <p className="font-medium">{detail.items && detail.items.length > 0 ? detail.items[0].nom_service : 'Non défini'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantité</p>
                      <p className="font-medium">{detail.items && detail.items.length > 0 ? detail.items[0].quantite : 'Non défini'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Prix unitaire</p>
                      <p className="font-medium">{detail.items && detail.items.length > 0 ? detail.items[0].prix_unitaire?.toLocaleString() : 'Non défini'} Fcfa</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prix total</p>
                    <p className="text-2xl font-bold">{detail.items && detail.items.length > 0 ? detail.items[0].prix_total?.toLocaleString() : 'Non défini'} Fcfa</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date de commande</p>
                  <p className="font-medium">
                    {detail.items && detail.items.length > 0 && detail.items[0].date_commande
                      ? new Date(detail.items[0].date_commande).toLocaleDateString('fr-FR')
                      : "Non définie"
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de livraison</p>
                  <p className="font-medium">
                    {detail.items && detail.items.length > 0 && detail.items[0].date_livraison
                      ? new Date(detail.items[0].date_livraison).toLocaleDateString('fr-FR')
                      : "Non définie"
                    }
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

              {/* Bouton télécharger facture */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => handleDownloadFacture(detail.id)} variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger la facture
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'annulation */}
      <DeleteDialog
        open={cancelDialogOpen}
        openChange={setCancelDialogOpen}
        onConfirm={handleCancelAchat}
        title="Annuler cet achat ?"
        description="Cette action annulera l'achat. Si cet achat est lié à un stock, il ne pourra pas être annulé."
        itemName={achatToCancel?.numero_achat}
        isDeleting={isCancelling}
        confirmText="Annuler l'achat"
      />
    </div>
  );
}