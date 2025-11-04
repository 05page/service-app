import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RefreshCw, PackagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RenewStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: any;
  availableAchats: any[];
  onRenew: (stockId: number, achatId: number, commentaire: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function RenewStockDialog({
  open,
  onOpenChange,
  stock,
  availableAchats,
  onRenew,
  isSubmitting
}: RenewStockDialogProps) {
  const [selectedAchat, setSelectedAchat] = useState("");
  const [commentaire, setCommentaire] = useState("");

  const achatSelectionne = availableAchats.find(a => a.id === parseInt(selectedAchat));

  useEffect(() => {
    if (!open) {
      setSelectedAchat("");
      setCommentaire("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAchat || !stock) return;

    await onRenew(stock.id, parseInt(selectedAchat), commentaire);
    onOpenChange(false);
  };

  // Filtrer les achats du même article
  const achatsCompatibles = availableAchats.filter(
    (achat) => achat.nom_service === stock?.achat?.nom_service
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" />
            Renouveler le stock
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de l'article actuel */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-sm">Article à renouveler</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Nom:</span>
                <p className="font-medium">{stock?.achat?.nom_service}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Code:</span>
                <p className="font-medium">{stock?.code_produit}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Quantité actuelle:</span>
                <p className="font-bold text-lg">{stock?.quantite}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Statut:</span>
                <Badge variant={stock?.statut === 'rupture' ? 'destructive' : 'secondary'}>
                  {stock?.statut}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Prix de vente:</span>
                <p className="font-medium">{stock?.prix_vente} FCFA</p>
              </div>
              <div>
                <span className="text-muted-foreground">Catégorie:</span>
                <p className="font-medium">{stock?.categorie}</p>
              </div>
            </div>
          </div>

          {/* Sélection du nouvel achat */}
          <div className="space-y-2">
            <Label htmlFor="achat">Nouvel achat *</Label>
            {achatsCompatibles.length > 0 ? (
              <Select value={selectedAchat} onValueChange={setSelectedAchat} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'achat pour renouveler" />
                </SelectTrigger>
                <SelectContent>
                  {achatsCompatibles.map((achat) => (
                    <SelectItem key={achat.id} value={achat.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {achat.numero_achat} - {achat.nom_service}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Qté: {achat.quantite} | Prix: {achat.prix_unitaire} FCFA | 
                          {achat.fournisseur?.nom_fournisseurs}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun achat compatible disponible" />
                  </SelectTrigger>
                </Select>
                <p className="text-sm text-destructive">
                  Aucun achat trouvé pour l'article "{stock?.achat?.nom_service}". 
                  Veuillez d'abord créer un achat avec le même article.
                </p>
              </>
            )}
          </div>

          {/* Informations du nouvel achat sélectionné */}
          {achatSelectionne && (
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg space-y-3 border border-green-200 dark:border-green-900">
              <h3 className="font-semibold text-sm text-green-800 dark:text-green-300">
                Nouvelle quantité à ajouter
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Quantité:</span>
                  <p className="font-bold text-lg text-green-600 dark:text-green-400">
                    +{achatSelectionne.quantite}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Prix unitaire:</span>
                  <p className="font-medium">{achatSelectionne.prix_unitaire} FCFA</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fournisseur:</span>
                  <p className="font-medium">{achatSelectionne.fournisseur?.nom_fournisseurs}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total après renouvellement:</span>
                  <p className="font-bold text-lg">
                    {(stock?.quantite || 0) + achatSelectionne.quantite}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Commentaire */}
          <div className="space-y-2">
            <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
            <Textarea
              id="commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Ajoutez un commentaire sur ce renouvellement..."
              rows={3}
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedAchat || achatsCompatibles.length === 0}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Renouvellement...
                </span>
              ) : (
                <>
                  <PackagePlus className="h-4 w-4 mr-2" />
                  Renouveler le stock
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
