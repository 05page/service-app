import { useState, useEffect, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw, Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";

// Interface pour un article
interface AchatItem {
  nom_service: string;
  quantite: string;
  prix_unitaire: string;
  prix_total: string;
  date_commande: string;
  date_livraison: string;
  photos: File[];
  photoPreviews: string[];
}

// Props du composant
interface FormAchatProps {
  isEdit?: boolean;
  fournisseurs: any[];
  initialData?: {
    fournisseur_id?: string;
    statut?: string;
    description?: string;
    items?: any[];
  };
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function FormAchat({
  isEdit = false,
  fournisseurs,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting
}: FormAchatProps) {
  // États pour les champs généraux
  const [fournisseurId, setFournisseurId] = useState(initialData?.fournisseur_id || "");
  const [description, setDescription] = useState(initialData?.description || "");

  // État pour les items
  const [items, setItems] = useState<AchatItem[]>([
    {
      nom_service: "",
      quantite: "",
      prix_unitaire: "",
      prix_total: "",
      date_commande: "",
      date_livraison: "",
      photos: [],
      photoPreviews: []
    }
  ]);

  // Récupérer les services du fournisseur sélectionné
  const availableServices = useMemo(() => {
    if (!fournisseurId) return [];
    const fournisseur = fournisseurs.find(f => f.id.toString() === fournisseurId);
    if (!fournisseur || !fournisseur.description) return [];
    // On suppose que les services sont séparés par des virgules dans la description
    return fournisseur.description.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  }, [fournisseurId, fournisseurs]);

  // Charger les données initiales en mode édition
  useEffect(() => {
    if (isEdit && initialData?.items && initialData.items.length > 0) {
      const formattedItems = initialData.items.map((item: any) => ({
        nom_service: item.nom_service || "",
        quantite: item.quantite?.toString() || "",
        prix_unitaire: item.prix_unitaire?.toString() || "",
        prix_total: item.prix_total?.toString() || "",
        date_commande: item.date_commande || "",
        date_livraison: item.date_livraison || "",
        photos: [],
        photoPreviews: item.photos?.map((p: any) => p.path) || []
      }));
      setItems(formattedItems);
    }
  }, [isEdit, initialData]);

  // Ajouter un nouvel article
  const addItem = () => {
    setItems([...items, {
      nom_service: "",
      quantite: "",
      prix_unitaire: "",
      prix_total: "",
      date_commande: "",
      date_livraison: "",
      photos: [],
      photoPreviews: []
    }]);
  };

  // Supprimer un article
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    } else {
      toast.error("Vous devez avoir au moins un article");
    }
  };

  // Mettre à jour un champ d'un article
  const updateItem = (index: number, field: keyof AchatItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Calculer automatiquement le prix total
    if (field === "quantite" || field === "prix_unitaire") {
      const quantite = parseFloat(newItems[index].quantite) || 0;
      const prixUnitaire = parseFloat(newItems[index].prix_unitaire) || 0;
      newItems[index].prix_total = (quantite * prixUnitaire).toFixed(2);
    }

    setItems(newItems);
  };

  // Gérer les photos d'un article spécifique
  const handleItemPhotoChange = (itemIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const currentItem = items[itemIndex];
    const totalPhotos = currentItem.photos.length + newFiles.length;

    if (totalPhotos > 4) {
      toast.error('Maximum 4 photos par article');
      return;
    }

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

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));

    const newItems = [...items];
    newItems[itemIndex].photos = [...currentItem.photos, ...validFiles];
    newItems[itemIndex].photoPreviews = [...currentItem.photoPreviews, ...newPreviews];
    setItems(newItems);
  };

  // Supprimer une photo d'un article
  const removeItemPhoto = (itemIndex: number, photoIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex].photos = newItems[itemIndex].photos.filter((_, i) => i !== photoIndex);
    newItems[itemIndex].photoPreviews = newItems[itemIndex].photoPreviews.filter((_, i) => i !== photoIndex);
    setItems(newItems);
  };

  // Calculer le total général
  const calculateGrandTotal = () => {
    return items.reduce((total, item) => total + (parseFloat(item.prix_total) || 0), 0).toFixed(2);
  };

  // Valider le formulaire
  const validateForm = () => {
    if (!fournisseurId) {
      toast.error("Veuillez sélectionner un fournisseur");
      return false;
    }

    const itemsValides = items.every(item =>
      item.nom_service &&
      item.quantite &&
      item.prix_unitaire &&
      item.date_commande
    );

    if (!itemsValides) {
      toast.error("Veuillez remplir tous les champs obligatoires pour chaque article");
      return false;
    }

    return true;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('fournisseur_id', fournisseurId);
    // Statut par défaut 'commande' car le champ a été retiré du formulaire
    formData.append('statut', initialData?.statut || 'commande');
    if (description) formData.append('description', description);

    // Ajouter les items
    items.forEach((item, index) => {
      formData.append(`items[${index}][nom_service]`, item.nom_service);
      formData.append(`items[${index}][quantite]`, item.quantite);
      formData.append(`items[${index}][prix_unitaire]`, item.prix_unitaire);
      formData.append(`items[${index}][date_commande]`, item.date_commande);
      if (item.date_livraison) {
        formData.append(`items[${index}][date_livraison]`, item.date_livraison);
      }

      // Ajouter les photos de cet item
      item.photos.forEach((photo) => {
        formData.append(`items[${index}][photos][]`, photo);
      });
    });

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations générales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Informations générales</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fournisseur">Fournisseur *</Label>
            {fournisseurs.length > 0 ? (
              <Select value={fournisseurId} onValueChange={setFournisseurId} required>
                <SelectTrigger id="fournisseur">
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {fournisseurs.map((f: any) => (
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
            {fournisseurs.length === 0 && (
              <p className="text-sm text-destructive">
                Veuillez d'abord créer un fournisseur
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description générale</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la commande..."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold">Articles *</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un article
          </Button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <Card key={index} className="p-4 relative">
              <div className="space-y-4">
                {/* En-tête de l'article */}
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-primary">Article {index + 1}</h4>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  )}
                </div>

                {/* Champs de l'article */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`nom_service_${index}`}>Nom du service *</Label>
                    {availableServices.length > 0 ? (
                      <Select
                        value={item.nom_service}
                        onValueChange={(value) => updateItem(index, "nom_service", value)}
                        required
                      >
                        <SelectTrigger id={`nom_service_${index}`}>
                          <SelectValue placeholder="Sélectionner un service" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableServices.map((service: string, i: number) => (
                            <SelectItem key={i} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={`nom_service_${index}`}
                        value={item.nom_service}
                        onChange={(e) => updateItem(index, "nom_service", e.target.value)}
                        placeholder={fournisseurId ? "Aucun service défini pour ce fournisseur" : "Sélectionnez d'abord un fournisseur"}
                        disabled={!fournisseurId}
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`quantite_${index}`}>Quantité *</Label>
                    <Input
                      id={`quantite_${index}`}
                      type="number"
                      value={item.quantite}
                      onChange={(e) => updateItem(index, "quantite", e.target.value)}
                      min="1"
                      placeholder="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`prix_unitaire_${index}`}>Prix unitaire (Fcfa) *</Label>
                    <Input
                      id={`prix_unitaire_${index}`}
                      type="number"
                      value={item.prix_unitaire}
                      onChange={(e) => updateItem(index, "prix_unitaire", e.target.value)}
                      min="100"
                      step="0.01"
                      placeholder="1000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`prix_total_${index}`}>Prix total (Fcfa)</Label>
                    <Input
                      id={`prix_total_${index}`}
                      type="number"
                      value={item.prix_total}
                      disabled
                      className="font-bold bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`date_commande_${index}`}>Date de commande *</Label>
                    <Input
                      id={`date_commande_${index}`}
                      type="date"
                      value={item.date_commande}
                      onChange={(e) => updateItem(index, "date_commande", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`date_livraison_${index}`}>Date de livraison</Label>
                    <Input
                      id={`date_livraison_${index}`}
                      type="date"
                      value={item.date_livraison}
                      onChange={(e) => updateItem(index, "date_livraison", e.target.value)}
                    />
                  </div>
                </div>

                {/* Photos de l'article */}
                <div className="space-y-2">
                  <Label>Photos (Maximum 4 par article)</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 bg-muted/20">
                    <input
                      type="file"
                      id={`photos-${index}`}
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      multiple
                      onChange={(e) => handleItemPhotoChange(index, e)}
                      className="hidden"
                      disabled={item.photos.length >= 4}
                    />
                    <label
                      htmlFor={`photos-${index}`}
                      className={`flex flex-col items-center justify-center cursor-pointer py-4 ${item.photos.length >= 4 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50 transition-colors'
                        }`}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Cliquez pour ajouter des photos ({item.photos.length}/4)
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, JPG, WEBP (max 2MB par photo)
                      </span>
                    </label>
                  </div>

                  {/* Preview des photos */}
                  {item.photoPreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {item.photoPreviews.map((preview, photoIndex) => (
                        <div key={photoIndex} className="relative group">
                          <img
                            src={preview}
                            alt={`Article ${index + 1} - Photo ${photoIndex + 1}`}
                            className="w-full h-24 object-cover rounded border-2 border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeItemPhoto(index, photoIndex)}
                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            title="Supprimer cette photo"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Total général */}
      <div className="flex justify-end items-center gap-4 border-t pt-4 bg-muted/20 p-4 rounded-lg">
        <Label className="text-lg font-semibold">Total général de la commande:</Label>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={calculateGrandTotal()}
            disabled
            className="w-40 font-bold text-lg text-right bg-background"
          />
          <span className="text-lg font-semibold">Fcfa</span>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || fournisseurs.length === 0}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="animate-spin h-4 w-4 mr-2" />
              {isEdit ? "Mise à jour..." : "Création..."}
            </>
          ) : (
            isEdit ? "Mettre à jour la commande" : "Créer la commande"
          )}
        </Button>
      </div>
    </form>
  );
}