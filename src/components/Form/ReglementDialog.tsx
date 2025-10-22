import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

type ReglementDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vente: any;
  onSuccess: () => void;
};

export function ReglementDialog({ open, onOpenChange, vente, onSuccess }: ReglementDialogProps) {
  const [montantPaye, setMontantPaye] = useState("");
  const [dateReglement, setDateReglement] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!vente) return null;

  const montantTotal = parseFloat(vente.prix_total);
  const dejaPaye = vente.montant_paye || 0;
  const resteAPayer = montantTotal - dejaPaye;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const montant = parseFloat(montantPaye);
    if (!montant || montant <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }

    if (montant > resteAPayer) {
      toast.error(`Le montant ne peut pas dépasser ${resteAPayer.toLocaleString('fr-FR')} Fcfa`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Appel API pour enregistrer le règlement
      // await api.post(`/ventes/${vente.id}/reglements`, {
      //   montant: montant,
      //   date_reglement: dateReglement
      // });
      
      toast.success('Règlement enregistré avec succès');
      setMontantPaye("");
      setDateReglement(new Date().toISOString().split('T')[0]);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error('Erreur lors de l\'enregistrement du règlement');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Ajouter un règlement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations de la vente */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Référence :</span>
              <span className="font-semibold">{vente.reference}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Client :</span>
              <span className="font-medium">{vente.nom_client}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant total :</span>
              <span className="font-bold">{montantTotal.toLocaleString('fr-FR')} Fcfa</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-success">Déjà payé :</span>
              <span className="font-semibold text-success">{dejaPaye.toLocaleString('fr-FR')} Fcfa</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Reste à payer :</span>
              <span className="font-bold text-destructive">{resteAPayer.toLocaleString('fr-FR')} Fcfa</span>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="montant" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Montant du règlement (Fcfa) *
              </Label>
              <Input
                id="montant"
                type="number"
                placeholder="Entrez le montant"
                value={montantPaye}
                onChange={(e) => setMontantPaye(e.target.value)}
                min="0"
                max={resteAPayer}
                step="0.01"
                required
              />
              <p className="text-xs text-muted-foreground">
                Maximum : {resteAPayer.toLocaleString('fr-FR')} Fcfa
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date du règlement *
              </Label>
              <Input
                id="date"
                type="date"
                value={dateReglement}
                onChange={(e) => setDateReglement(e.target.value)}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
