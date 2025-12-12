import api from '../api/api';
import { useState, useEffect, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Search, Edit, Package, Calendar, TrendingUp, DollarSign,
  RefreshCw, FileText, ShieldAlert, Image as ImageIcon, Eye, X,
  ChevronLeft, ChevronRight, Upload, Download, Ban, Loader2
} from "lucide-react";
import { toast } from 'sonner';
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "../components/Pagination";
import FormAchat from "./Form/FormAchat";

type Achats = {
  achats_non_recu: number;
  achats_annule: number;
  total_achat_commande: number,
  total_achats: number,
  bon_commande: string,
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
  const [activeTab, setActiveTab] = useState("total");

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [achat, setchAchat] = useState([]);
  const [fournisseur, setFournisseur] = useState<any[]>([]);
  const [selectCount, setSelectCount] = useState<Achats | null>(null);
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

  // Upload states
  const [uploadingAchatId, setUploadingAchatId] = useState<number | null>(null);
  const [uploadType, setUploadType] = useState<'commande' | 'reception' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // États pour le modal de bon de réception
  const [bonReceptionDialogOpen, setBonReceptionDialogOpen] = useState(false);
  const [achatForBonReception, setAchatForBonReception] = useState<any>(null);
  const [bonReceptionItems, setBonReceptionItems] = useState<Array<{
    id: number;
    nom_service: string;
    quantite: number;
    quantite_recu: string;
    numero_bon_reception: string;
    date_reception: string;
    bon_reception_file: File | null;
    statut_item?: string;
    motif_partiel?: string;
  }>>([]);
  const [isSubmittingBonReception, setIsSubmittingBonReception] = useState(false);

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

  // Fonction pour gérer la soumission
  const handleFormSubmit = async (formData: FormData) => {
    try {
      // Debug: Log les données envoyées
      console.log('=== DONNÉES ENVOYÉES AU BACKEND ===');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      console.log('=====================================');

      const response = await api.post('/achat/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(response.data.message || 'Achat créé avec succès');
      setDialogOpen(false);
      await Promise.all([getAchats(), fecthAchats()]);
    } catch (error: any) {
      console.error('Erreur création achat:', error.response?.data);
      console.error('Status code:', error.response?.status);
      console.error('Headers:', error.response?.headers);

      const message = error.response?.data?.message || "Erreur lors de l'ajout de l'achat";
      toast.error(message);
      throw error; // Important pour que le formulaire sache que ça a échoué
    }
  };

  // Fonction pour gérer la mise à jour
  const handleFormUpdate = async (formData: FormData) => {
    if (!selectAchat) return;

    try {
      // Debug: Log les données envoyées
      console.log('=== DONNÉES MISE À JOUR ENVOYÉES ===');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      console.log('=====================================');

      const response = await api.post(`/achat/${selectAchat.id}?_method=PUT`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(response.data.message || "Achat mis à jour");
      setEditDialogOpen(false);
      await Promise.all([getAchats(), fecthAchats()]);
    } catch (error: any) {
      console.error('Erreur mise à jour achat:', error.response?.data);
      console.error('Status code:', error.response?.status);
      console.error('Headers:', error.response?.headers);

      const message = error?.response?.data?.message || "Erreur survenue lors de la mise à jour de l'achat";
      toast.error(message);
      throw error;
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

  const handleDownloadBonReception = async (achatItemId: string) => {
    try {
      toast.info('Génération du bon de réception en cours...');
      const response = await api.get(`factures/bonReception/${achatItemId}/pdf`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      //permet de generer un url temporaire pour le blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bon-reception-${achatItemId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Bon de réception téléchargé avec succès");
    } catch (error: any) {
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const errorData = JSON.parse(text);
          toast.error(errorData.message || "Erreur lors de la génération du bon de réception");
        } catch {
          toast.error("Erreur lors de la génération du bon de réception");
        }
      } else {
        toast.error(error.response?.data?.message || "Erreur lors du téléchargement du bin de réception");
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

  const handleFileSelect = (achatId: number, type: 'commande' | 'reception') => {
    if (type === 'commande') {
      // Ouvrir le modal pour le bon de réception depuis l'onglet "Bon de Commande"
      const selectedAchat = achat.find((a: any) => a.id === achatId);
      if (selectedAchat && selectedAchat.items) {
        setAchatForBonReception(selectedAchat);
        // Initialiser les items avec les données existantes
        const itemsData = selectedAchat.items
          // Filtrer les articles déjà reçus (ceux qui ont un numero_bon_reception)
          .filter((item: any) => {
            const hasNumeroBon = item.numero_bon_reception &&
              item.numero_bon_reception.toString().trim() !== '';
            return !hasNumeroBon;
          })
          .map((item: any) => ({
            id: item.id,
            nom_service: item.nom_service || '',
            quantite: item.quantite || 0,
            quantite_recu: item.quantite_recu?.toString() || '',
            numero_bon_reception: item.numero_bon_reception || '',
            date_reception: item.date_reception || "",
            bon_reception_file: null,
            statut_item: item.statut_item || 'commande',
            motif_partiel: item.motif_partiel || ''
          }));
        setBonReceptionItems(itemsData);
        setBonReceptionDialogOpen(true);
      }
    } else {
      // Pour le bon de réception, garder l'ancien comportement (si nécessaire)
      setUploadingAchatId(achatId);
      setUploadType(type);
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadingAchatId || !uploadType) return;

    const formData = new FormData();
    const key = uploadType === 'commande' ? 'bon_commande' : 'bon_reception';
    formData.append(key, file);

    try {
      toast.info("Envoi du document en cours...");
      const response = await api.post(`/achat/${uploadingAchatId}?_method=PUT`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(response.data.message || "Document ajouté avec succès");
      await Promise.all([getAchats(), fecthAchats()]);
    } catch (error: any) {
      console.error("Erreur upload:", error);
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout du document");
    } finally {
      setUploadingAchatId(null);
      setUploadType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Gérer le changement de quantité reçue pour un item
  const handleQuantiteRecuChange = (itemId: number, value: string) => {
    setBonReceptionItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantite_recu: value }
          : item
      )
    );
  };

  const handleNumeroBonReceptionChange = (itemId: number, value: string) => {
    setBonReceptionItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, numero_bon_reception: value }
          : item
      )
    );
  };
  // Gérer le changement de la date de réception
  const handleDateReceptionChange = (itemId: number, value: string) => {
    setBonReceptionItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, date_reception: value }
          : item
      )
    );
  };

  // Gérer le changement du motif partiel
  const handleMotifPartielChange = (itemId: number, value: string) => {
    setBonReceptionItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, motif_partiel: value }
          : item
      )
    );
  };

  // Vérifier si la quantité reçue est partielle
  const isPartialReception = (item: { quantite: number; quantite_recu: string }) => {
    const qteRecu = parseInt(item.quantite_recu) || 0;
    return qteRecu > 0 && qteRecu < item.quantite;
  };

  // Soumettre le bon de réception
  const handleSubmitBonReception = async () => {
    if (!achatForBonReception) return;

    const itemsSubmit = bonReceptionItems.filter(item => {
      const hasQuantite = item.quantite_recu && parseInt(item.quantite_recu) > 0;
      const hasNumero = item.numero_bon_reception && item.numero_bon_reception.trim() !== '';
      const hasDate = item.date_reception && item.date_reception.trim() !== '';

      return hasQuantite && hasNumero && hasDate;
    });

    if (itemsSubmit.length === 0) {
      toast.error('Veuillez remplir au moins un article avec tous les champs requis');
      return;
    }

    const errors: string[] = [];
    itemsSubmit.forEach((item) => {
      if (parseInt(item.quantite_recu, 10) > item.quantite) {
        errors.push(
          `${item.nom_service}: La quantité reçue (${item.quantite_recu}) dépasse la quantité commandée (${item.quantite})`
        );
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmittingBonReception(true);

    try {
      const formData = new FormData();

      // envoyer en tant que items[0][...], items[1][...] — Laravel reconstitue bien le tableau
      itemsSubmit.forEach((item, index) => {
        console.log(`Item ${index}:`, item); // Debug: voir les données des items
        const itemId = parseInt(String(item.id), 10);
        const quantiteRecu = parseInt(item.quantite_recu, 10);

        if (isNaN(itemId) || itemId <= 0) {
          throw new Error(`ID d'article invalide: ${item.id}`);
        }

        if (isNaN(quantiteRecu) || quantiteRecu < 1) {
          throw new Error(`Quantité reçue invalide pour ${item.nom_service}: ${item.quantite_recu}`);
        }

        formData.append(`items[${index}][id]`, String(itemId));
        formData.append(`items[${index}][quantite_recu]`, String(quantiteRecu));
        formData.append(`items[${index}][numero_bon_reception]`, item.numero_bon_reception?.trim() || '');
        formData.append(`items[${index}][date_reception]`, item.date_reception?.trim() || '');
        
        // Ajouter le motif partiel si réception partielle
        if (quantiteRecu < item.quantite && item.motif_partiel) {
          formData.append(`items[${index}][motif_partiel]`, item.motif_partiel.trim());
        }
      });

      // debug (optionnel)
      console.log("=== DONNÉES ENVOYÉES (FormData) ===");
      for (const [key, value] of (formData as any).entries()) {
        console.log(key, value);
      }

      // Vérifier que tous les items ont des données valides
      const invalidItems = itemsSubmit.filter(item =>
        !item.id ||
        !item.quantite_recu ||
        parseInt(item.quantite_recu, 10) < 1 ||
        !item.numero_bon_reception ||
        !item.date_reception
      );

      if (invalidItems.length > 0) {
        console.error("Items invalides:", invalidItems);
        toast.error("Certains articles ont des données invalides");
        return;
      }

      // Debug: vérifier les données avant envoi
      console.log("=== DEBUG AVANT ENVOI ===");
      console.log("Achat ID:", achatForBonReception.id);
      console.log("Items à soumettre:", itemsSubmit);
      console.log("Premier item:", itemsSubmit[0]);
      console.log("ID du premier item:", itemsSubmit[0]?.id);
      console.log("Type de l'ID:", typeof itemsSubmit[0]?.id);

      toast.info("Envoi du bon de réception en cours...");

      const response = await api.post(
        `/achat/${achatForBonReception.id}/addBonReception`,
        formData,
        // IMPORTANT : ne PAS définir Content-Type manuellement ici.
        // Le navigateur ajoutera le header multipart/form-data avec le boundary.
        {}
      );

      toast.success(response.data.message || "Bon de réception ajouté avec succès");
      setBonReceptionDialogOpen(false);
      setAchatForBonReception(null);
      setBonReceptionItems([]);
      await Promise.all([getAchats(), fecthAchats()]);
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du bon de réception:", error);
      console.error("Status:", error.response?.status);
      console.error("Response data:", error.response?.data);

      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage || "Erreur lors de la soumission");

      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, messages]: [string, any]) => {
          toast.error(`${field}: ${messages[0]}`);
        });
      }
    } finally {
      setIsSubmittingBonReception(false);
    }
  }; 

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

  const getStatutColor = (statut_item: string) => {
    switch (statut_item) {
      case "commande": return "secondary";
      case "partiellement_recu": return "default";
      case "recu": return "default";
      case "annule": return "destructive";
      default: return "secondary";
    }
  };

  const getStatutLabel = (statut_item: string) => {
    switch (statut_item) {
      case "commande": return "Commande";
      case "partiellement_recu": return "Partiellement Reçu";
      case "recu": return "Reçu";
      case "annule": return "Annulé";
      default: return statut_item;
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

  const getTabFilteredData = () => {
    switch (activeTab) {
      case "commande":
        return filteredAchats.filter((a: any) =>
          a.statut === 'commande' || a.statut === 'partiellement_recu'
        );
      case "reception":
        // Filtrer les achats qui ont au moins un item avec statut_item reçu ou partiellement_recu ET bon_reception non null
        return filteredAchats.filter((a: any) => {
          if (!a.items || a.items.length === 0) return false;
          return a.items.some((item: any) =>
            (item.statut_item === 'recu' || item.statut_item === 'partiellement_recu') &&
            item.numero_bon_reception !== null &&
            item.numero_bon_reception !== undefined
          );
        });
      default:
        return filteredAchats;
    }
  };

  const tabData = getTabFilteredData();

  const { currentPage, totalPages, currentData: currentAchats, setCurrentPage } =
    usePagination({ data: tabData, itemsPerPage: 6 });

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const renderAchatsTable = () => {
    if (activeTab === 'total') {
      const achatItemRows = currentAchats.flatMap((achat: any) => {
        if (achat.items && achat.items.length > 0) {
          return achat.items.map((item: any) => ({ achat, item }));
        }
        return [{ achat, item: null }];
      });

      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Commande</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Photos</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Quantité Reçue</TableHead>
              <TableHead>Prix unitaire</TableHead>
              <TableHead>Prix Total</TableHead>
              <TableHead>Prix reel</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {achatItemRows.length > 0 ? (
              achatItemRows.map(({ achat: a, item }, index) => (
                <TableRow key={`${a.id}-${item?.id ?? `no-item-${index}`}`}>
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
                        {item?.nom_service ?? 'Non défini'}
                      </div>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">{a.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.photos && item.photos.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <img
                          src={item.photos[0].path}
                          alt={item.nom_service}
                          className='h-10 w-10 object-cover rounded border'
                        />
                        {item.photos.length > 1 && (
                          <span className="text-xs text-muted-foreground">
                            +{item.photos.length - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{item?.quantite ?? "Non defini"}</TableCell>
                  <TableCell>{item?.quantite_recu ?? "Non defini"}</TableCell>
                  <TableCell>{item?.prix_unitaire ?? '000'} Fcfa</TableCell>
                  <TableCell className="font-medium">{item?.prix_total ?? "000"} Fcfa</TableCell>
                  <TableCell className="font-medium">{item?.prix_reel ?? "000"} Fcfa</TableCell>
                  <TableCell>
                    <Badge variant={getStatutColor(item.statut_item)}>{getStatutLabel(item.statut_item)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button onClick={() => openDetailDialog(a)} variant="outline" size="sm" title='Détails'>
                        <Eye className='h-4 w-4' />
                      </Button>
                      {userRole === "admin" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectAchat(a);
                              setEditDialogOpen(true);
                            }}
                            title="Modifier"
                          >
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
      );
    } else {
      const isCommandeTab = activeTab === 'commande';
      const dateHeader = isCommandeTab ? "Date Commande" : "Date Réception";
      // Pour l'onglet "Bon de Commande", afficher par achat (un seul par achat)
      // Pour l'onglet "Bon de Réception", afficher par items avec bon_reception non null
      const achatItemRows = isCommandeTab
        ? currentAchats.map((achat: any) => ({ achat, item: null }))
        : currentAchats.flatMap((achat: any) => {
          if (achat.items && achat.items.length > 0) {
            // Filtrer uniquement les items avec bon_reception non null
            return achat.items
              .filter((item: any) => item.numero_bon_reception !== null && item.numero_bon_reception !== undefined)
              .map((item: any) => ({ achat, item }));
          }
          return [];
        });

      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Commande</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>{dateHeader}</TableHead>
              {isCommandeTab && <TableHead>Bon de commande</TableHead>}
              {!isCommandeTab && <TableHead>Numéro BR</TableHead>}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {achatItemRows.length > 0 ? (
              achatItemRows.map(({ achat: a, item }, index) => (
                <TableRow key={`${a.id}-${item?.id ?? `no-item-${index}`}`}>
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
                        {isCommandeTab
                          ? (a.items && a.items.length > 0
                            ? `${a.items.length} service${a.items.length > 1 ? 's' : ''}`
                            : 'Non défini')
                          : (item?.nom_service ?? 'Non défini')
                        }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isCommandeTab ? (
                      a.items && a.items.length > 0 && a.items[0]?.date_commande
                        ? new Date(a.items[0].date_commande).toLocaleDateString('fr-FR')
                        : <span className="text-muted-foreground">Non définie</span>
                    ) : (
                      item?.date_reception ? new Date(item.date_reception).toLocaleDateString('fr-FR') : <span className="text-muted-foreground">Non définie</span>
                    )}
                  </TableCell>
                  {/* ✅ Colonne conditionnelle : Bon de commande OU Numéro BR */}
                  {isCommandeTab && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Télécharger Bon de Commande"
                        onClick={() => window.open(a?.bon_commande)}
                      >
                        <FileText className="h-4 w-4 text-primary mr-2" />
                        <span className="text-xs">Bon de commande</span>
                      </Button>
                    </TableCell>
                  )}

                  {!isCommandeTab && (
                    <TableCell>
                      <span className="font-mono text-sm">{item?.numero_bon_reception || '-'}</span>
                    </TableCell>
                  )}
                  <TableCell>
                    {isCommandeTab ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFileSelect(a.id, 'commande')}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Enregistrer la réception
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadBonReception(item.id)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Telecharger le bon de reception
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-[400px]">
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
      );
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
          {/* Bouton Refresh */}
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>

          {/* Dialog création */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Commande
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle commande</DialogTitle>
              </DialogHeader>

              <FormAchat
                fournisseurs={fournisseur}
                onSubmit={handleFormSubmit}
                onCancel={() => setDialogOpen(false)}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>

          {/* Dialog d'édition */}
          <Dialog open={editDialogOpen} onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setSelectAchat(null);
            }
          }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Modifier la commande</DialogTitle>
              </DialogHeader>

              <FormAchat
                isEdit
                fournisseurs={fournisseur}
                initialData={
                  selectAchat
                    ? {
                      fournisseur_id: selectAchat.fournisseur_id?.toString(),
                      statut: selectAchat.statut,
                      description: selectAchat.description,
                      items: selectAchat.items
                    }
                    : undefined
                }
                onSubmit={handleFormUpdate}
                onCancel={() => setEditDialogOpen(false)}
                isSubmitting={isSubmitting}
              />
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="total">Liste Total</TabsTrigger>
              <TabsTrigger value="commande">Bon de Commande</TabsTrigger>
              <TabsTrigger value="reception">Bon de Reception</TabsTrigger>
            </TabsList>

            <TabsContent value="total">
              {renderAchatsTable()}
            </TabsContent>
            <TabsContent value="commande">
              {renderAchatsTable()}
            </TabsContent>
            <TabsContent value="reception">
              {renderAchatsTable()}
            </TabsContent>
          </Tabs>

          {currentAchats.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={tabData.length}
              itemsPerPage={6}
              onPageChange={setCurrentPage}
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>

      {/* Dialog Détails avec Galerie */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'achat {detail?.numero_achat}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="grid gap-6">
              {/* Informations générales */}
              <div className="grid gap-3 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Fournisseur</p>
                  <p className="font-medium">{detail.fournisseur?.nom_fournisseurs}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description générale</p>
                  <p className="text-sm">{detail.description || 'Aucune description'}</p>
                </div>
              </div>

              {/* Liste des items avec leurs photos */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Articles commandés ({detail.items?.length || 0})</h3>

                {detail.items && detail.items.map((item: any, idx: number) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex gap-6">
                      {/* Galerie de photos de l'item */}
                      <div className="flex-shrink-0">
                        {item.photos && item.photos.length > 0 ? (
                          <div className="relative">
                            <img
                              src={item.photos[currentPhotoIndex]?.path || item.photos[0].path}
                              alt={item.nom_service}
                              className="h-64 w-64 object-cover rounded-lg border-2 border-border"
                            />

                            {/* Navigation photos - seulement si plus d'une photo */}
                            {item.photos.length > 1 && (
                              <>
                                <button
                                  onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
                                  disabled={currentPhotoIndex === 0}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/70 transition-all"
                                >
                                  <ChevronLeft className="h-5 w-5" />
                                </button>

                                <button
                                  onClick={() => setCurrentPhotoIndex(Math.min(item.photos.length - 1, currentPhotoIndex + 1))}
                                  disabled={currentPhotoIndex >= item.photos.length - 1}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/70 transition-all"
                                >
                                  <ChevronRight className="h-5 w-5" />
                                </button>
                              </>
                            )}

                            {/* Miniatures */}
                            {item.photos.length > 1 && (
                              <div className="flex gap-2 mt-2 overflow-x-auto">
                                {item.photos.map((photo: any, photoIndex: number) => (
                                  <button
                                    key={photo.id}
                                    onClick={() => setCurrentPhotoIndex(photoIndex)}
                                    className={`relative h-16 w-16 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${currentPhotoIndex === photoIndex
                                      ? 'border-primary ring-2 ring-primary'
                                      : 'border-transparent hover:border-muted-foreground'
                                      }`}
                                  >
                                    <img
                                      src={photo.path}
                                      alt={`Miniature ${photoIndex + 1}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Indicateur de photos */}
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                              {currentPhotoIndex + 1} / {item.photos.length}
                            </div>
                          </div>
                        ) : (
                          <div className="h-64 w-64 bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20">
                            <ImageIcon className="h-16 w-16 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Aucune photo</p>
                          </div>
                        )}
                      </div>

                      {/* Détails de l'item */}
                      <div className="flex-1 grid gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Service</p>
                          <p className="font-semibold text-lg">{item.nom_service}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Quantité</p>
                            <p className="font-medium">{item.quantite}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Prix unitaire</p>
                            <p className="font-medium">{parseFloat(item.prix_unitaire).toLocaleString('fr-FR')} Fcfa</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">Prix total</p>
                          <p className="text-2xl font-bold text-green-600">{parseFloat(item.prix_reel).toLocaleString('fr-FR')} Fcfa</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Date de commande</p>
                            <p className="font-medium">
                              {item.date_commande
                                ? new Date(item.date_commande).toLocaleDateString('fr-FR')
                                : "Non définie"
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Date de livraison</p>
                            <p className="font-medium">
                              {item.date_livraison
                                ? new Date(item.date_livraison).toLocaleDateString('fr-FR')
                                : "Non définie"
                              }
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">Statut</p>
                          <Badge variant={item.statut_item === 'recu' ? 'default' : 'secondary'}>
                            {item.statut_item === 'recu' ? 'Reçu' :
                              item.statut_item === 'en_attente' ? 'En attente' :
                                item.statut_item === 'partiellement_recu' ? 'Partiellement reçu' :
                                  item.statut_item}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

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

      {/* Dialog Bon de Réception */}
      <Dialog open={bonReceptionDialogOpen} onOpenChange={setBonReceptionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter le bon de réception</DialogTitle>
          </DialogHeader>

          {achatForBonReception && (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Commande</p>
                  <p className="font-medium">{achatForBonReception.numero_achat}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Fournisseur</p>
                  <p className="font-medium">{achatForBonReception.fournisseur?.nom_fournisseurs}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Articles</Label>
                  <p className="text-sm text-muted-foreground">
                    Remplissez les articles que vous souhaitez réceptionner
                  </p>
                </div>

                {bonReceptionItems.map((item, index) => {
                  // ✅ Calculer si l'item est complet
                  const isItemComplete =
                    item.quantite_recu &&
                    parseInt(item.quantite_recu) > 0 &&
                    item.numero_bon_reception?.trim() &&
                    item.date_reception;

                  // Vérifier si réception partielle
                  const isPartial = isPartialReception(item);

                  return (
                    <Card
                      key={item.id}
                      className={`p-4 ${isItemComplete ? 'border-green-500' : ''}`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium">{item.nom_service}</Label>
                            <p className="text-sm text-muted-foreground">
                              Quantité commandée: {item.quantite}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isPartial && (
                              <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                                Partiel
                              </Badge>
                            )}
                            {isItemComplete && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                ✓ Complet
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`quantite_recu_${item.id}`}>
                              Quantité reçue *
                            </Label>
                            <Input
                              id={`quantite_recu_${item.id}`}
                              type="number" required
                              min="0"
                              max={item.quantite}
                              value={item.quantite_recu}
                              onChange={(e) => handleQuantiteRecuChange(item.id, e.target.value)}
                              placeholder="0"
                            />
                            {item.quantite_recu && parseInt(item.quantite_recu) > item.quantite && (
                              <p className="text-sm text-destructive mt-1">
                                Max: {item.quantite}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label>Numéro bon de réception *</Label>
                            <Input
                              type="text" required
                              maxLength={25}
                              value={item.numero_bon_reception}
                              onChange={(e) => handleNumeroBonReceptionChange(item.id, e.target.value)}
                              placeholder="Ex: BR-2025-001"
                            />
                          </div>

                          <div>
                            <Label>Date de réception *</Label>
                            <Input
                              type="date"
                              value={item.date_reception} required
                              onChange={(e) => handleDateReceptionChange(item.id, e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Champ motif partiel affiché uniquement si réception partielle */}
                        {isPartial && (
                          <div className="pt-2 border-t">
                            <Label htmlFor={`motif_partiel_${item.id}`}>
                              Motif de réception partielle *
                            </Label>
                            <Input
                              id={`motif_partiel_${item.id}`}
                              type="text"
                              value={item.motif_partiel || ''}
                              onChange={(e) => handleMotifPartielChange(item.id, e.target.value)}
                              placeholder="Ex: Rupture de stock fournisseur, livraison en 2 temps..."
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Quantité restante: {item.quantite - (parseInt(item.quantite_recu) || 0)}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}

                {/* ✅ Afficher le nombre d'items complétés */}
                <p className="text-sm text-muted-foreground">
                  {bonReceptionItems.filter(item =>
                    item.quantite_recu &&
                    parseInt(item.quantite_recu) > 0 &&
                    item.numero_bon_reception?.trim() &&
                    item.date_reception
                  ).length} / {bonReceptionItems.length} article(s) prêt(s) à être envoyé(s)
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setBonReceptionDialogOpen(false);
                    setAchatForBonReception(null);
                    setBonReceptionItems([]);
                  }}
                  disabled={isSubmittingBonReception}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmitBonReception}
                  disabled={isSubmittingBonReception}
                >
                  {isSubmittingBonReception ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="application/pdf"
        onChange={handleFileChange}
      />
    </div>
  );
}