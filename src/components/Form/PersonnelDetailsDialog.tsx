import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, ShoppingCart, CheckCircle2, Clock, Loader2, User, Mail, Phone, Briefcase } from "lucide-react";

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

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader className="pb-0">
          <DialogTitle className="sr-only">Détails de {personnel.fullname}</DialogTitle>
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
          <ScrollArea className="max-h-[calc(85vh-4rem)]">
            <div className="space-y-4 pr-4">
              {/* Section Photo et Infos */}
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarImage src={personnel.photo || personnel.avatar} alt={personnel.fullname} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {getInitials(personnel.fullname)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold">{personnel.fullname}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{personnel.email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{personnel.telephone || personnel.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{personnel.poste || personnel.role || 'Employé'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>Taux: {personnel.taux_commission || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques compactes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ventes</p>
                      <p className="text-lg font-bold">{stats?.stats?.nombre_ventes || 0}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Ventes</p>
                      <p className="text-lg font-bold">{formatCurrency(stats?.stats?.total_ventes || 0)}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dues</p>
                      <p className="text-lg font-bold text-orange-600">{formatCurrency(stats?.stats?.total_commissions_dues || 0)}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Payées</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(stats?.stats?.total_commissions_payees || 0)}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Tabs pour les listes */}
              <Tabs defaultValue="ventes" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ventes" className="text-xs sm:text-sm">
                    Ventes ({stats?.ventes?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="dues" className="text-xs sm:text-sm">
                    Dues ({stats?.commissions_dues?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="payees" className="text-xs sm:text-sm">
                    Payées ({stats?.commissions_payees?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ventes" className="mt-3">
                  {stats?.ventes && stats.ventes.length > 0 ? (
                    <div className="max-h-[200px] overflow-y-auto border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Référence</TableHead>
                            <TableHead className="text-xs">Montant</TableHead>
                            <TableHead className="text-xs">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.ventes.map((vente: any) => (
                            <TableRow key={vente.reference ?? vente.id}>
                              <TableCell className="text-xs font-medium">{vente.reference}</TableCell>
                              <TableCell className="text-xs">{formatCurrency(vente.montant ?? vente.prix_total ?? 0)}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {formatDate(vente.date ?? vente.created_at)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune vente</p>
                  )}
                </TabsContent>

                <TabsContent value="dues" className="mt-3">
                  {Array.isArray(stats?.commissions_dues) && stats.commissions_dues.length > 0 ? (
                    <div className="max-h-[200px] overflow-y-auto border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Référence</TableHead>
                            <TableHead className="text-xs">Montant</TableHead>
                            <TableHead className="text-xs">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.commissions_dues.map((commission: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell className="text-xs font-medium">{commission.reference_vente || '-'}</TableCell>
                              <TableCell className="text-xs">{formatCurrency(commission.montant ?? commission.commission_due ?? 0)}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {formatDate(commission.date ?? commission.created_at)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune commission due</p>
                  )}
                </TabsContent>

                <TabsContent value="payees" className="mt-3">
                  {Array.isArray(stats?.commissions_payees) && stats.commissions_payees.length > 0 ? (
                    <div className="max-h-[200px] overflow-y-auto border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Référence</TableHead>
                            <TableHead className="text-xs">Montant</TableHead>
                            <TableHead className="text-xs">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.commissions_payees.map((commission: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell className="text-xs font-medium">{commission.reference_vente || '-'}</TableCell>
                              <TableCell className="text-xs">{formatCurrency(commission.montant ?? commission.commission_due ?? 0)}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {formatDate(commission.date ?? commission.created_at)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune commission payée</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
