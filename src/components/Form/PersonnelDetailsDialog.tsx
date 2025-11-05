import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, DollarSign, ShoppingCart, CheckCircle2, Clock, Loader2 } from "lucide-react";

interface PersonnelDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnel: any;
  stats: any;
  loading: boolean;
}

export function PersonnelDetailsDialog({
  open,
  onOpenChange,
  personnel,
  stats,
  loading
}: PersonnelDetailsDialogProps) {
  if (!personnel) return null;

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(num || 0);
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatutCommissionColor = (statut: number) => {
    switch (statut) {
      case 1: return "default";
      case 0: return "secondary";
      default: return "secondary";
    }
  };

  const getStatutCommissionLabel = (statut: number) => {
    switch (statut) {
      case 1: return "Payée";
      case 0: return "En attente";
      default: return "Inconnu";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Détails de {personnel.fullname}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="max-h-[calc(90vh-8rem)]">
            <div className="space-y-6 pr-4">
              {/* Statistiques générales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Ventes</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.total_ventes || 0}</div>
                    <p className="text-xs text-muted-foreground">ventes réalisées</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.total_commissions || 0)}</div>
                    <p className="text-xs text-muted-foreground">commission totale</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Commissions Payées</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.commissions_payees || 0)}</div>
                    <p className="text-xs text-muted-foreground">déjà versées</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Commissions En Attente</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.commissions_en_attente || 0)}</div>
                    <p className="text-xs text-muted-foreground">à payer</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.chiffre_affaires || 0)}</div>
                    <p className="text-xs text-muted-foreground">généré</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taux Commission</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.taux_commission || 0}%</div>
                    <p className="text-xs text-muted-foreground">taux appliqué</p>
                  </CardContent>
                </Card>
              </div>

              {/* Liste des ventes */}
              {stats?.ventes && stats.ventes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ventes Réalisées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Référence</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Commission</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.ventes.map((vente: any) => (
                          <TableRow key={vente.id}>
                            <TableCell className="font-medium">{vente.reference}</TableCell>
                            <TableCell>{vente.nom_client}</TableCell>
                            <TableCell>{formatCurrency(vente.montant_total)}</TableCell>
                            <TableCell>{formatCurrency(vente.montant_commission)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(vente.created_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Liste des commissions */}
              {stats?.commissions && stats.commissions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Historique des Commissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Référence Vente</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Date Paiement</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.commissions.map((commission: any) => (
                          <TableRow key={commission.id}>
                            <TableCell className="font-medium">
                              {commission.vente?.reference || '-'}
                            </TableCell>
                            <TableCell>{commission.vente?.nom_client || '-'}</TableCell>
                            <TableCell>{formatCurrency(commission.montant)}</TableCell>
                            <TableCell>
                              <Badge variant={getStatutCommissionColor(commission.statut)}>
                                {getStatutCommissionLabel(commission.statut)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(commission.date_paiement)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Message si aucune donnée */}
              {(!stats?.ventes || stats.ventes.length === 0) && 
               (!stats?.commissions || stats.commissions.length === 0) && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucune vente ou commission enregistrée</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
