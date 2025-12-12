import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PackagePlus, PackageMinus, Package, Calendar, User, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StockHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historique: any;
}

export default function StockHistoryDialog({ open, onOpenChange, historique }: StockHistoryDialogProps) {
  if (!historique) return null;

  const { stock, statistiques, historique: history } = historique;

  // Filtrer les doublons dans l'historique en utilisant l'ID unique
  const uniqueHistory = history?.reduce((acc: any[], mouvement: any) => {
    // Vérifier si ce mouvement existe déjà dans l'accumulateur
    const exists = acc.find((m: any) => m.id === mouvement.id);
    if (!exists) {
      acc.push(mouvement);
    }
    return acc;
  }, []) || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'creation':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'renouvellement':
      case 'entree':
        return <PackagePlus className="h-4 w-4 text-green-500" />;
      case 'sortie':
        return <PackageMinus className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      creation: "Création initiale",
      renouvellement: "Renouvellement",
      entree: "Entrée",
      sortie: "Sortie (vente)"
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Historique détaillé du stock</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Informations de l'article */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Article</p>
                    <p className="font-semibold">{stock?.achat?.items && stock.achat.items.length > 0 ? stock.achat.items[0].nom_service : "Non défini"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Code produit</p>
                    <p className="font-semibold">{stock?.code_produit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Catégorie</p>
                    <p className="font-semibold">{stock?.categorie}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantité actuelle</p>
                    <p className="font-bold text-xl">{statistiques?.quantite_actuelle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prix de vente</p>
                    <p className="font-semibold">{stock?.prix_vente} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <Badge variant={stock?.statut === 'disponible' ? 'default' : 'destructive'}>
                      {stock?.statut}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <PackagePlus className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total entrées</p>
                      <p className="text-2xl font-bold text-green-600">{statistiques?.total_entrees}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <PackageMinus className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total sorties</p>
                      <p className="text-2xl font-bold text-red-600">{statistiques?.total_sorties}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <PackagePlus className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Renouvellements</p>
                      <p className="text-2xl font-bold text-blue-600">{statistiques?.nombre_renouvellements}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historique des mouvements */}
            <div>
              <h3 className="font-semibold mb-3">Historique des mouvements</h3>
              <div className="space-y-3">
                {uniqueHistory && uniqueHistory.length > 0 ? (
                  uniqueHistory.map((mouvement: any, index: number) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getTypeIcon(mouvement.type)}</div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{getTypeLabel(mouvement.type)}</Badge>
                                {mouvement.type === 'renouvellement' || mouvement.type === 'entree' ? (
                                  <span className="font-bold text-green-600">+{mouvement.quantite}</span>
                                ) : mouvement.type === 'sortie' ? (
                                  <span className="font-bold text-red-600">-{mouvement.quantite}</span>
                                ) : (
                                  <span className="font-bold">{mouvement.quantite}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(mouvement.created_at)}
                              </div>
                            </div>

                            {mouvement.achat && (
                              <div className="text-sm bg-muted/50 p-2 rounded">
                                <p className="font-medium">Achat: {mouvement.achat.numero_achat}</p>
                                <p className="text-muted-foreground">
                                  {mouvement.achat.quantite} unités à {mouvement.achat.prix_unitaire} FCFA
                                  {mouvement.achat.fournisseur && (
                                    <> - {mouvement.achat.fournisseur.nom_fournisseurs}</>
                                  )}
                                </p>
                              </div>
                            )}

                            {mouvement.commentaire && (
                              <div className="flex items-start gap-1 text-sm text-muted-foreground">
                                <FileText className="h-3 w-3 mt-0.5" />
                                <p>{mouvement.commentaire}</p>
                              </div>
                            )}

                            {mouvement.cree_par && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                Par: {mouvement.cree_par.fullname}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Aucun mouvement enregistré</p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}