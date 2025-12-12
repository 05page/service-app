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

  // Debug log
  if (stats) {
    console.log('Stats reçues:', stats);
    console.log('commissions_dues:', stats.commissions_dues);
    console.log('commissions_payees:', stats.commissions_payees);
  }

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(num || 0);
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    // If backend already returns a formatted date like 'dd/mm/YYYY HH:ii', keep it as-is
    if (typeof date === 'string' && date.includes('/')) return date;
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        ) : !stats ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Chargement des statistiques...</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[calc(90vh-8rem)]">
            <div className="space-y-6 pr-4">
              {/* Statistiques générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nombre de Ventes</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.stats?.nombre_ventes || 0}</div>
                    <p className="text-xs text-muted-foreground">ventes réalisées</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Ventes</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.stats?.total_ventes || 0)}</div>
                    <p className="text-xs text-muted-foreground">montant généré</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Commissions Dues</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.stats?.total_commissions_dues || 0)}</div>
                    <p className="text-xs text-muted-foreground">{stats?.stats?.nombre_commissions_dues || 0} en attente</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Commissions Payées</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.stats?.total_commissions_payees || 0)}</div>
                    <p className="text-xs text-muted-foreground">{stats?.stats?.nombre_commissions_payees || 0} versées</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.stats?.total_commissions || 0)}</div>
                    <p className="text-xs text-muted-foreground">commissions totales</p>
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
                        <TableHead>Montant</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.ventes.map((vente: any) => (
                        <TableRow key={vente.reference ?? vente.id}>
                          <TableCell className="font-medium">{vente.reference}</TableCell>
                          <TableCell>{formatCurrency(vente.montant ?? vente.prix_total ?? 0)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(vente.date ?? vente.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Liste des commissions dues */}
            {Array.isArray(stats?.commissions_dues) && stats.commissions_dues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Commissions Dues (Non Payées)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                          <TableHead>Référence Vente</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.commissions_dues.map((commission: any) => (
                        <TableRow key={(commission.reference_vente ?? '') + '_' + (commission.date ?? commission.created_at ?? '')}>
                          <TableCell className="font-medium">{commission.reference_vente || '-'}</TableCell>
                          <TableCell>{formatCurrency(commission.montant ?? commission.commission_due ?? 0)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">En attente</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(commission.date ?? commission.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Liste des commissions payées */}
            {Array.isArray(stats?.commissions_payees) && stats.commissions_payees.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Commissions Payées</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                          <TableHead>Référence Vente</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.commissions_payees.map((commission: any) => (
                        <TableRow key={(commission.reference_vente ?? '') + '_' + (commission.date ?? commission.created_at ?? '')}>
                          <TableCell className="font-medium">{commission.reference_vente || '-'}</TableCell>
                          <TableCell>{formatCurrency(commission.montant ?? commission.commission_due ?? 0)}</TableCell>
                          <TableCell>
                            <Badge variant="default">Payée</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(commission.date ?? commission.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Historique des commissions (ancienne version) */}
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
              (!stats?.commissions_dues || stats.commissions_dues.length === 0) &&
              (!stats?.commissions_payees || stats.commissions_payees.length === 0) && (
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
