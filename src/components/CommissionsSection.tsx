
import { useState, useEffect } from "react";
import api from "../api/api";
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Pagination } from "@/components/Pagination";
import { usePagination } from "@/hooks/usePagination";
import {
  Search,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  RefreshCw,
  Eye,
  CreditCard,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Layers
} from "lucide-react";

interface CommissionResume {
  total_commission: number;
  commission_payee: number;
  commission_en_attente: number;
  nombre_commissions_payees: number;
  nombre_commissions_en_attente: number;
  nombre_total_commissions: number;
}

interface CommissionGroupee {
  commissionnaire: {
    id: number;
    fullname: string;
    email: string;
    taux_commission: number;
  };
  nombre_commissions: number;
  total_du: number;
  commissions: Array<{
    id: number;
    vente_reference: string;
    montant: number;
    created_at: string;
  }>;
}

export function CommissionSection() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [commissionsGroupees, setCommissionsGroupees] = useState<CommissionGroupee[]>([]);
  const [resume, setResume] = useState<CommissionResume>({
    total_commission: 0,
    commission_payee: 0,
    commission_en_attente: 0,
    nombre_commissions_payees: 0,
    nombre_commissions_en_attente: 0,
    nombre_total_commissions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCommission, setSelectedCommission] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [montantVerse, setMontantVerse] = useState("");

  // États pour paiement groupé
  const [selectedCommissions, setSelectedCommissions] = useState<number[]>([]);
  const [payGroupDialogOpen, setPayGroupDialogOpen] = useState(false);
  const [selectedCommissionnaire, setSelectedCommissionnaire] = useState<CommissionGroupee | null>(null);

  // Récupérer les commissions individuelles
  const fetchCommissions = async () => {
    try {
      const response = await api.get('commissions/');

      if (!response.data?.success) {
        toast.error(response.data?.message || 'Erreur lors du chargement');
        return;
      }

      setCommissions(response.data.data || []);
      setResume(response.data.resume || {
        total_commission: 0,
        commission_payee: 0,
        commission_en_attente: 0,
        nombre_commissions_payees: 0,
        nombre_commissions_en_attente: 0,
        nombre_total_commissions: 0,
      });
    } catch (error: any) {
      console.error('Erreur récupération commissions:', error);
      if (error.response?.status === 403) {
        toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires');
      } else {
        toast.error('Erreur lors du chargement des commissions');
      }
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les commissions groupées
  const fetchCommissionsGroupees = async () => {
    try {
      const response = await api.get('/commissions/groupees');

      if (response.data?.success) {
        setCommissionsGroupees(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Erreur récupération commissions groupées:', error);
      if (error.response?.status !== 404) {
        toast.error('Erreur lors du chargement des commissions groupées');
      }
    }
  };

  // Actualiser les données
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchCommissions(), fetchCommissionsGroupees()]);
      toast.success('Données actualisées');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  // Paiement individuel
  const handleOpenPayDialog = (commission: any) => {
    setSelectedCommission(commission);
    setMontantVerse(commission.commission_due?.toString() || "");
    setPayDialogOpen(true);
  };

  const handlePayCommission = async () => {
    if (!selectedCommission || !montantVerse) {
      toast.error('Veuillez renseigner le montant');
      return;
    }

    setIsPaying(true);
    try {
      const response = await api.post(`commissions/${selectedCommission.id}`, {
        montant_verse: parseFloat(montantVerse)
      });

      toast.success(response.data.message || 'Commission payée avec succès');
      setPayDialogOpen(false);
      setSelectedCommission(null);
      setMontantVerse("");
      await handleRefresh();
    } catch (error: any) {
      console.error('Erreur paiement:', error);
      const message = error.response?.data?.message || "Erreur lors du paiement";
      toast.error(message);
    } finally {
      setIsPaying(false);
    }
  };

  // Paiement groupé
  const handleOpenPayGroupDialog = (commissionnaire: CommissionGroupee) => {
    setSelectedCommissionnaire(commissionnaire);
    setSelectedCommissions(commissionnaire.commissions.map(c => c.id));
    setPayGroupDialogOpen(true);
  };

  const handleToggleCommission = (commissionId: number) => {
    setSelectedCommissions(prev =>
      prev.includes(commissionId)
        ? prev.filter(id => id !== commissionId)
        : [...prev, commissionId]
    );
  };

  const handlePayGrouped = async () => {
    if (selectedCommissions.length === 0) {
      toast.error('Veuillez sélectionner au moins une commission');
      return;
    }

    setIsPaying(true);
    try {
      const response = await api.post('/commissions/payegroupees', {
        commission_ids: selectedCommissions
      });

      toast.success(response.data.message || 'Paiement groupé effectué avec succès');
      setPayGroupDialogOpen(false);
      setSelectedCommissionnaire(null);
      setSelectedCommissions([]);
      await handleRefresh();
    } catch (error: any) {
      console.error('Erreur paiement groupé:', error);
      const message = error.response?.data?.message || "Erreur lors du paiement groupé";
      toast.error(message);
    } finally {
      setIsPaying(false);
    }
  };

  // Voir les détails
  const handleViewDetails = (commission: any) => {
    setSelectedCommission(commission);
    setDetailDialogOpen(true);
  };

  const totalSelectionne = selectedCommissionnaire?.commissions
    .filter(c => selectedCommissions.includes(c.id))
    .reduce((sum, c) => sum + parseFloat(c.montant.toString()), 0) || 0;

  useEffect(() => {
    fetchCommissions();
    fetchCommissionsGroupees();
  }, []);

  // Filtres
  const filteredCommissions = commissions.filter(c =>
    c.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFilteredByTab = () => {
    if (activeTab === "paye") {
      return filteredCommissions.filter(c => 
        c.etat_commission === 1 || 
        c.etat_commission === true || 
        c.etat_commission === "1" || 
        c.etat_commission === "true"
      );
    }
    if (activeTab === "non_paye") {
      return filteredCommissions.filter(c => 
        c.etat_commission === 0 || 
        c.etat_commission === false || 
        c.etat_commission === "0" || 
        c.etat_commission === "false" ||
        c.etat_commission === null ||
        c.etat_commission === undefined
      );
    }
    return filteredCommissions;
  };

  const displayedCommissions = getFilteredByTab();

  // Pagination
  const {
    currentPage,
    totalPages,
    currentData: paginatedCommissions,
    goToPage
  } = usePagination({
    data: displayedCommissions,
    itemsPerPage: 10
  });

  const getStatutColor = (etat: boolean | number | string) => {
    return (etat === true || etat === 1 || etat === "1" || etat === "true") ? "default" : "destructive";
  };

  const getStatutLabel = (etat: boolean | number | string) => {
    return (etat === true || etat === 1 || etat === "1" || etat === "true") ? "Payée" : "Non payée";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement des commissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Commissions</h1>
          <p className="text-muted-foreground">
            Suivez et gérez les commissions de vos intermédiaires et employés
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resume.total_commission.toLocaleString('fr-FR')} Fcfa
            </div>
            <p className="text-xs text-muted-foreground">Toutes les commissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions payées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {resume.commission_payee.toLocaleString('fr-FR')} Fcfa
            </div>
            <p className="text-xs text-muted-foreground">
              {resume.total_commission > 0
                ? ((resume.commission_payee / resume.total_commission) * 100).toFixed(1)
                : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {resume.commission_en_attente.toLocaleString('fr-FR')} Fcfa
            </div>
            <p className="text-xs text-muted-foreground">
              {resume.nombre_commissions_en_attente} paiement(s) en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissionnaires</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commissionsGroupees.length}</div>
            <p className="text-xs text-muted-foreground">Avec commissions en attente</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overview">
            Toutes ({commissions.length})
          </TabsTrigger>
          <TabsTrigger value="paye">
            Payées ({resume.nombre_commissions_payees})
          </TabsTrigger>
          <TabsTrigger value="non_paye">
            Non payées ({resume.nombre_commissions_en_attente})
          </TabsTrigger>
          <TabsTrigger value="groupees">
            <Layers className="h-4 w-4 mr-2" />
            Groupées
          </TabsTrigger>
        </TabsList>

        {/* Vue groupée */}
        <TabsContent value="groupees" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Commissions par commissionnaire</CardTitle>
              <CardDescription>
                Gérez les paiements groupés par personne
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {commissionsGroupees.length > 0 ? (
                commissionsGroupees.map((group) => (
                  <Card key={group.commissionnaire.id} className="bg-muted/30">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {group.commissionnaire.fullname}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Taux: {group.commissionnaire.taux_commission}% • {group.nombre_commissions} commission(s)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-600">
                            {parseFloat(group.total_du.toString()).toLocaleString('fr-FR')} Fcfa
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleOpenPayGroupDialog(group)}
                            className="mt-2"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Payer tout
                          </Button>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-2">
                        {group.commissions.map((commission) => (
                          <div
                            key={commission.id}
                            className="flex items-center justify-between p-3 bg-background rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">
                                  {commission.vente_reference}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {commission.created_at}
                                </p>
                              </div>
                            </div>
                            <div className="font-semibold">
                              {parseFloat(commission.montant.toString()).toLocaleString('fr-FR')} Fcfa
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucune commission en attente de paiement
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Autres onglets */}
        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {activeTab !== "groupees" && (
            <>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <div className="space-y-4">
                {paginatedCommissions.length > 0 ? (
                  paginatedCommissions.map((commission) => (
                    <Card key={commission.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {commission.user?.fullname || 'N/A'}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Vente: {commission.vente?.reference || 'N/A'}
                              </p>
                            </div>
                            <Badge variant={getStatutColor(commission.etat_commission)}>
                              {getStatutLabel(commission.etat_commission)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">Prix vente</p>
                              <p className="font-semibold text-sm">
                                {parseFloat(commission.vente?.prix_total || 0).toLocaleString('fr-FR')} Fcfa
                              </p>
                            </div>
                            <div className="text-center border-x">
                              <p className="text-xs text-muted-foreground mb-1">Taux</p>
                              <p className="font-semibold text-sm">
                                {commission.user?.taux_commission || 0}%
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">Commission</p>
                              <p className="font-semibold text-sm text-green-600">
                                {parseFloat(commission.commission_due || 0).toLocaleString('fr-FR')} Fcfa
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2 border-t">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(commission)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Détails
                            </Button>
                            {(commission.etat_commission === 0 || 
                              commission.etat_commission === false || 
                              commission.etat_commission === "0" || 
                              commission.etat_commission === "false" ||
                              commission.etat_commission === null ||
                              commission.etat_commission === undefined) && (
                              <Button size="sm" onClick={() => handleOpenPayDialog(commission)}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Payer
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Users className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground">
                        Aucune commission disponible
                      </h3>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Pagination */}
              {displayedCommissions.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={displayedCommissions.length}
                  itemsPerPage={10}
                  onPageChange={goToPage}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog paiement individuel */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payer une commission</DialogTitle>
          </DialogHeader>

          {selectedCommission && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bénéficiaire</span>
                  <span className="font-semibold">{selectedCommission.user?.fullname}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Commission due</span>
                  <span className="font-bold text-green-600">
                    {parseFloat(selectedCommission.commission_due || 0).toLocaleString('fr-FR')} Fcfa
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="montant">Montant à verser (Fcfa) *</Label>
                <Input
                  id="montant"
                  type="number"
                  placeholder="Entrez le montant"
                  value={montantVerse}
                  onChange={(e) => setMontantVerse(e.target.value)}
                  min="1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialogOpen(false)} disabled={isPaying}>
              Annuler
            </Button>
            <Button onClick={handlePayCommission} disabled={isPaying}>
              {isPaying ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Paiement...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog paiement groupé */}
      <Dialog open={payGroupDialogOpen} onOpenChange={setPayGroupDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Paiement groupé de commissions</DialogTitle>
            <DialogDescription>
              Sélectionnez les commissions à payer pour {selectedCommissionnaire?.commissionnaire.fullname}
            </DialogDescription>
          </DialogHeader>

          {selectedCommissionnaire && (
            <div className="space-y-4">
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{selectedCommissionnaire.commissionnaire.fullname}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCommissionnaire.commissionnaire.email}
                      </p>
                    </div>
                    <Badge variant="outline">
                      Taux: {selectedCommissionnaire.commissionnaire.taux_commission}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {selectedCommissionnaire.commissions.map((commission) => (
                  <div
                    key={commission.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedCommissions.includes(commission.id)}
                      onCheckedChange={() => handleToggleCommission(commission.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{commission.vente_reference}</p>
                      <p className="text-xs text-muted-foreground">{commission.created_at}</p>
                    </div>
                    <div className="font-semibold">
                      {parseFloat(commission.montant.toString()).toLocaleString('fr-FR')} Fcfa
                    </div>
                  </div>
                ))}
              </div>

              <Card className="bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {selectedCommissions.length} commission(s) sélectionnée(s)
                      </p>
                      <p className="text-lg font-bold">Total à payer</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {totalSelectionne.toLocaleString('fr-FR')} Fcfa
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPayGroupDialogOpen(false)}
              disabled={isPaying}
            >
              Annuler
            </Button>
            <Button
              onClick={handlePayGrouped}
              disabled={isPaying || selectedCommissions.length === 0}
            >
              {isPaying ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Paiement en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Payer {selectedCommissions.length} commission(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog détails - compact et scrollable */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-lg">Détails de la commission</DialogTitle>
          </DialogHeader>

          {selectedCommission && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {/* Bénéficiaire */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <h4 className="font-semibold text-sm">Bénéficiaire</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nom</span>
                  <span className="font-medium">{selectedCommission.user?.fullname}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taux</span>
                  <span className="font-medium">{selectedCommission.user?.taux_commission}%</span>
                </div>
              </div>

              {/* Vente */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <h4 className="font-semibold text-sm">Vente</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Référence</span>
                  <span className="font-medium">{selectedCommission.vente?.reference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Montant</span>
                  <span className="font-medium">
                    {parseFloat(selectedCommission.vente?.prix_total || 0).toLocaleString('fr-FR')} Fcfa
                  </span>
                </div>
              </div>

              {/* Commission */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <h4 className="font-semibold text-sm">Commission</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Montant dû</span>
                  <span className="font-bold text-green-600">
                    {parseFloat(selectedCommission.commission_due || 0).toLocaleString('fr-FR')} Fcfa
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Statut</span>
                  <Badge variant={getStatutColor(selectedCommission.etat_commission)}>
                    {getStatutLabel(selectedCommission.etat_commission)}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}