import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface FormFournisseurProps {
  isEdit?: boolean;
  initialData?: {
    nom_fournisseurs?: string;
    email?: string;
    telephone?: string;
    adresse?: string;
    services?: string[];
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function FormFournisseur({
  isEdit = false,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting
}: FormFournisseurProps) {
  const [nomFournisseur, setNomFournisseur] = useState(initialData?.nom_fournisseurs || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [telephone, setTelephone] = useState(initialData?.telephone || "");
  const [adresse, setAdresse] = useState(initialData?.adresse || "");
  const [services, setServices] = useState<string[]>(
    initialData?.services && Array.isArray(initialData.services) 
      ? initialData.services 
      : [""]
  );

  // Charger les données initiales en mode édition
  useEffect(() => {
    if (isEdit && initialData) {
      setNomFournisseur(initialData.nom_fournisseurs || "");
      setEmail(initialData.email || "");
      setTelephone(initialData.telephone || "");
      setAdresse(initialData.adresse || "");
      setServices(
        initialData.services && Array.isArray(initialData.services)
          ? initialData.services
          : [""]
      );
    }
  }, [isEdit, initialData]);

  const addService = () => {
    setServices([...services, ""]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    } else {
      toast.error("Vous devez avoir au moins un service");
    }
  };

  const updateService = (index: number, value: string) => {
    const newServices = [...services];
    newServices[index] = value;
    setServices(newServices);
  };

  const validateForm = () => {
    if (!nomFournisseur.trim()) {
      toast.error("Le nom du fournisseur est obligatoire");
      return false;
    }

    if (!email.trim()) {
      toast.error("L'email est obligatoire");
      return false;
    }

    // Validation simple de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("L'email n'est pas valide");
      return false;
    }

    if (!telephone.trim()) {
      toast.error("Le téléphone est obligatoire");
      return false;
    }

    if (telephone.length !== 10) {
      toast.error("Le téléphone doit contenir 10 chiffres");
      return false;
    }

    if (!adresse.trim()) {
      toast.error("L'adresse est obligatoire");
      return false;
    }

    const validServices = services.filter(s => s.trim() !== "");
    if (validServices.length === 0) {
      toast.error("Veuillez ajouter au moins un service");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Filtrer les services vides et nettoyer les espaces
    const validServices = services
      .map(s => s.trim())
      .filter(s => s !== "");

    const data = {
      nom_fournisseurs: nomFournisseur.trim(),
      email: email.trim(),
      telephone: telephone.trim(),
      adresse: adresse.trim(),
      services: validServices
    };

    try {
      await onSubmit(data);
    } catch (error) {
      // L'erreur est déjà gérée par le parent
      console.error("Erreur lors de la soumission:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations générales */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom du fournisseur *</Label>
          <Input
            id="nom"
            value={nomFournisseur}
            onChange={(e) => setNomFournisseur(e.target.value)}
            placeholder="Nom complet du fournisseur"
            maxLength={300}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemple.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone *</Label>
          <Input
            id="telephone"
            value={telephone}
            onChange={(e) => {
              // N'accepter que les chiffres
              const value = e.target.value.replace(/\D/g, '');
              setTelephone(value);
            }}
            placeholder="0123456789"
            maxLength={10}
            required
          />
          {telephone.length > 0 && telephone.length !== 10 && (
            <p className="text-xs text-destructive">Le téléphone doit contenir 10 chiffres</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="adresse">Adresse *</Label>
          <Input
            id="adresse"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            placeholder="Adresse complète"
            maxLength={300}
            required
          />
        </div>
      </div>

      {/* Services */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <Label className="text-base font-semibold">Services proposés *</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addService}
            disabled={services.length >= 10}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un service
          </Button>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {services.map((service, index) => (
            <Card key={index} className="p-3">
              <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`service-${index}`} className="text-sm text-muted-foreground">
                    Service {index + 1}
                  </Label>
                  <Input
                    id={`service-${index}`}
                    value={service}
                    onChange={(e) => updateService(index, e.target.value)}
                    placeholder={`Ex: Plomberie, Électricité...`}
                    maxLength={255}
                    required
                  />
                </div>
                {services.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeService(index)}
                    className="mt-6"
                    title="Supprimer ce service"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {services.length >= 10 && (
          <p className="text-xs text-muted-foreground">
            Limite de 10 services atteinte
          </p>
        )}
      </div>

      {/* Résumé */}
      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <p className="text-sm font-medium">Résumé</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Fournisseur:</span>
            <p className="font-medium">{nomFournisseur || "Non renseigné"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>
            <p className="font-medium">{email || "Non renseigné"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Téléphone:</span>
            <p className="font-medium">{telephone || "Non renseigné"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Services:</span>
            <p className="font-medium">
              {services.filter(s => s.trim() !== "").length} service(s)
            </p>
          </div>
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <RefreshCw className="animate-spin h-4 w-4 mr-2" />
              {isEdit ? "Mise à jour..." : "Création..."}
            </>
          ) : (
            isEdit ? "Mettre à jour le fournisseur" : "Créer le fournisseur"
          )}
        </Button>
      </div>
    </form>
  );
}