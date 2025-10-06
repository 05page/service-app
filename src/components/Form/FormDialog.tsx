import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type Props = {
  isEdit?: boolean;
  achatId: any[];
  achat: string;
  setAchat: (value: string) => void;
  categorie: string;
  setCategorie: (value: string) => void;
  quantiMin: string;
  setQuantiteMin: (value: string) => void;
  prixVente: string;
  setPrixVente: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  isSubmitting: boolean;
  handleUpdate: (e: React.FormEvent) => void;
  handleSubmit: (e: React.FormEvent) => void;
  setEditDialogOpen: (open: boolean) => void;
  setDialogOpen: (open: boolean) => void;
  resetForm: () => void;
};

export default function FormDialog({
  isEdit = false,
  achatId,
  achat,
  setAchat,
  categorie,
  setCategorie,
  quantiMin,
  setQuantiteMin,
  prixVente,
  setPrixVente,
  description,
  setDescription,
  isSubmitting,
  handleUpdate,
  handleSubmit,
  setEditDialogOpen,
  setDialogOpen,
  resetForm,
}: Props) {
  const achatSelectionne = achatId.find(a => a.id === parseInt(achat));

  return (
    <form onSubmit={isEdit ? handleUpdate : handleSubmit}>
      <div className="grid grid-cols-2 gap-4 py-4">
        {/* Achat */}
        <div className="space-y-2">
          <Label htmlFor="achat">Achat *</Label>
          {achatId.length > 0 ? (
            <Select value={achat} onValueChange={setAchat} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner l'achat à ajouter au stock" />
              </SelectTrigger>
              <SelectContent>
                {achatId.map((a: any) => (
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
            <p className="text-sm text-red-500">Aucun achat trouvé. Veuillez effectuer un achat</p>
          )}
        </div>

        {/* Catégorie */}
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

        {/* Quantité initiale */}
        <div className="space-y-2">
          <Label htmlFor="quantite">Quantité initiale *</Label>
          <Input
            id="quantite"
            type="number"
            value={achatSelectionne?.quantite || ""}
            placeholder="Quantité récupérée de l'achat"
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Cette quantité sera automatiquement remplie selon l'achat sélectionné
          </p>
        </div>

        {/* Quantité minimale */}
        <div className="space-y-2">
          <Label htmlFor="quantiteMin">Quantité minimale *</Label>
          <Input
            id="quantiteMin"
            value={quantiMin}
            onChange={(e) => setQuantiteMin(e.target.value)}
            type="number"
            placeholder="1"
            min="1"
            required
          />
        </div>

        {/* Prix d'achat */}
        <div className="space-y-2">
          <Label htmlFor="prixAchat">Prix d'achat (FCFA)</Label>
          <Input
            id="prixAchat"
            type="number"
            value={achatSelectionne?.prix_unitaire || ""}
            placeholder="Prix d'achat automatique"
            disabled
          />
        </div>

        {/* Prix de vente */}
        <div className="space-y-2">
          <Label htmlFor="prixVente">Prix de vente (FCFA) *</Label>
          <Input
            id="prixVente"
            value={prixVente}
            onChange={(e) => setPrixVente(e.target.value)}
            type="number"
            placeholder="1000"
            min="1000"
            required
          />
        </div>

        {/* Description */}
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

      {/* Boutons */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            isEdit ? setEditDialogOpen(false) : setDialogOpen(false);
            resetForm();
          }}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center">
              <RefreshCw className="animate-spin h-4 w-4 mr-2" />
              {isEdit ? "Mise à jour..." : "Ajout..."}
            </span>
          ) : (
            isEdit ? "Mettre à jour l'inventaire" : "Ajouter à l'inventaire"
          )}
        </Button>
      </div>
    </form>
  );
}
