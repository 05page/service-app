import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, DollarSign, User, Package, CreditCard, History, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface VenteHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vente: any;
  historique: any;
}

export function VenteHistoryDialog({ open, onOpenChange, vente, historique }: VenteHistoryDialogProps) {
  if (!vente) return null;

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return date;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique de la vente {vente.reference}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Informations générales */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Informations générales
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{vente.nom_client}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Référence</p>
                    <p className="font-medium">{vente.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">{vente.numero}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de création</p>
                    <p className="font-medium">{formatDate(vente.created_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Résumé financier */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Résumé financier
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Montant total</span>
                    <span className="font-bold text-lg">{formatCurrency(vente.prix_total)} Fcfa</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <span className="text-sm text-green-700 dark:text-green-400">Montant payé</span>
                    <span className="font-bold text-green-700 dark:text-green-400">
                      {formatCurrency(historique?.resume?.total_paye || vente.montant_verse || 0)} Fcfa
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <span className="text-sm text-orange-700 dark:text-orange-400">Reste à payer</span>
                    <span className="font-bold text-orange-700 dark:text-orange-400">
                      {formatCurrency(historique?.resume?.reste_a_payer || (vente.prix_total - (vente.montant_verse || 0)))} Fcfa
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium">Statut</span>
                    <Badge variant={vente.est_soldee ? "default" : "secondary"}>
                      {vente.est_soldee ? "Réglée" : "En attente"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Articles vendus */}
            {vente.items && vente.items.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Articles vendus
                  </h3>
                  <div className="space-y-2">
                    {vente.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{item.nom_produit || 'Article'}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantité: {item.quantite} × {formatCurrency(item.prix_unitaire)} Fcfa
                          </p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.sous_total)} Fcfa</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historique des paiements */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Historique des paiements
                </h3>
                {historique?.paiements && historique.paiements.length > 0 ? (
                  <div className="space-y-3">
                    {historique.paiements.map((paiement: any, index: number) => (
                      <div key={index} className="border-l-4 border-primary pl-4 py-2">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="font-medium text-green-600">
                              +{formatCurrency(paiement.montant_verse)} Fcfa
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(paiement.date_paiement)}
                            </p>
                          </div>  
                        </div>
                        {paiement.commentaire && (
                          <p className="text-sm text-muted-foreground mt-1">{paiement.commentaire}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun paiement enregistré</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Commission */}
            {vente.commissionaire && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Commission
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Commissionnaire</span>
                      <span className="font-medium">{vente.commissionaire_info?.fullname}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Taux</span>
                      <span className="font-medium">{vente.commissionaire_info?.taux_commission}%</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <span className="text-sm font-medium">Commission calculée</span>
                      <span className="font-bold text-blue-700 dark:text-blue-400">
                        {formatCurrency((vente.prix_total * (vente.commissionaire_info?.taux_commission || 0)) / 100)} Fcfa
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
