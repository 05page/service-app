import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, DollarSign, Truck, Package, History, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AchatHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achat: any;
  historique: any;
}

export function AchatHistoryDialog({ open, onOpenChange, achat, historique }: AchatHistoryDialogProps) {
  if (!achat) return null;

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
      case "commande": return "Commandé";
      case "paye": return "Payé";
      case "reçu": return "Reçu";
      case "annule": return "Annulé";
      default: return statut;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique de l'achat {achat.numero_achat}
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
                    <p className="text-sm text-muted-foreground">Fournisseur</p>
                    <p className="font-medium">{achat.fournisseur?.nom_fournisseurs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">N° Achat</p>
                    <p className="font-medium">{achat.numero_achat}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Article/Service</p>
                    <p className="font-medium">{achat.nom_service}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantité</p>
                    <p className="font-medium">{achat.quantite} unités</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de création</p>
                    <p className="font-medium">{formatDate(achat.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut actuel</p>
                    <Badge variant={getStatutColor(achat.statut)}>
                      {getStatutLabel(achat.statut)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Détails financiers */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Détails financiers
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Prix unitaire</span>
                    <span className="font-medium">{formatCurrency(achat.prix_unitaire)} Fcfa</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Quantité</span>
                    <span className="font-medium">{achat.quantite}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                    <span className="font-semibold">Prix total</span>
                    <span className="font-bold text-lg">{formatCurrency(achat.prix_total)} Fcfa</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates importantes */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Dates importantes
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Date de commande</p>
                      <p className="text-sm text-muted-foreground">{formatDate(achat.date_commande)}</p>
                    </div>
                  </div>
                  {achat.date_livraison && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Date de livraison</p>
                        <p className="text-sm text-muted-foreground">{formatDate(achat.date_livraison)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Historique des changements de statut */}
            {historique?.changements && historique.changements.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Historique des changements
                  </h3>
                  <div className="space-y-3">
                    {historique.changements.map((change: any, index: number) => (
                      <div key={index} className="border-l-4 border-primary pl-4 py-2">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="font-medium">
                              Changement de statut: <Badge variant={getStatutColor(change.nouveau_statut)} className="ml-2">
                                {getStatutLabel(change.nouveau_statut)}
                              </Badge>
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(change.date)}
                            </p>
                          </div>
                        </div>
                        {change.commentaire && (
                          <p className="text-sm text-muted-foreground mt-1">{change.commentaire}</p>
                        )}
                        {change.modifie_par && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Par: {change.modifie_par.fullname}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {achat.description && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {achat.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Utilisation dans le stock */}
            {historique?.stock && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Utilisation dans le stock
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Code produit</span>
                      <span className="font-medium">{historique.stock.code_produit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Quantité en stock</span>
                      <span className="font-medium">{historique.stock.quantite} unités</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Statut stock</span>
                      <Badge variant={historique.stock.statut === 'disponible' ? 'default' : 'secondary'}>
                        {historique.stock.statut}
                      </Badge>
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
