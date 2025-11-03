import { useState, useEffect } from "react";
import api from "../api/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  CheckCircle
} from "lucide-react";
import { toast } from 'sonner';

interface CommissionResume {
  total_commission: number;
  commission_payee: number;
  commission_en_attente: number;
  nombre_commissions_payees: number;
  nombre_commissions_en_attente: number;
  nombre_total_commissions: number;
}

export function CommissionSection() {
  const [commissions, setCommissions] = useState<any[]>([]);
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

  // Récupérer les commissions
  // Récupérer les commissions
  const fetchCommissions = async () => {
    try {
      const response = await api.get('commissions/');

      console.log('📊 Réponse API complète:', response.data);

      // ✅ Vérifier que les données existent
      if (!response.data) {
        console.error('❌ Pas de données dans la réponse');
        toast.error('Aucune donnée reçue du serveur');
        return;
      }

      if (!response.data.success) {
        console.error('❌ Réponse non réussie:', response.data.message);
        toast.error(response.data.message || 'Erreur lors du chargement');
        return;
      }

      // ✅ Récupérer les données et le résumé
      const commissionsData = response.data.data || [];
      const resumeData = response.data.resume || {
        total_commission: 0,
        commission_payee: 0,
        commission_en_attente: 0,
        nombre_commissions_payees: 0,
        nombre_commissions_en_attente: 0,
        nombre_total_commissions: 0,
      };

      console.log('✅ Commissions récupérées:', commissionsData.length);
      console.log('✅ Résumé:', resumeData);

      setCommissions(commissionsData);
      setResume(resumeData);

    } catch (error: any) {
      console.error('❌ Erreur récupération commissions:', error);
      console.error('❌ Détails erreur:', error.response);

      if (error.response?.status === 403) {
        toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires');
      } else {
        toast.error('Erreur lors du chargement des commissions');
      }
    } finally {
      setLoading(false);
    }
  };

  // Actualiser les données
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCommissions();
      toast.success('Données actualisées');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  // Ouvrir le dialog de paiement
  const handleOpenPayDialog = (commission: any) => {
    setSelectedCommission(commission);
    setMontantVerse(commission.commission_due?.toString() || "");
    setPayDialogOpen(true);
  };

  // Payer une commission
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
      await fetchCommissions();
    } catch (error: any) {
      console.error('Erreur paiement commission:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors du paiement";
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

  useEffect(() => {
    fetchCommissions();
  }, []);

  // Filtrer les commissions
  const filteredCommissions = commissions.filter(c =>
    c.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrer par statut selon l'onglet
  const getFilteredByTab = () => {
    if (activeTab === "paye") {
      return filteredCommissions.filter(c => c.etat_commission === 1 || c.etat_commission === true);
    }
    if (activeTab === "non_paye") {
      return filteredCommissions.filter(c => c.etat_commission === 0 || c.etat_commission === false);
    }
    return filteredCommissions;
  };

  const displayedCommissions = getFilteredByTab();

  // ✅ CORRECTION : Utiliser les données du résumé
  const totalCommissionDues = resume.total_commission;
  const totalCommissionPayees = resume.commission_payee;
  const totalCommissionEnAttente = resume.commission_en_attente;
  const nombreCommissionsPayees = resume.nombre_commissions_payees;
  const nombreCommissionsEnAttente = resume.nombre_commissions_en_attente;

  const tauxMoyen = commissions.length > 0
    ? commissions.reduce((sum, c) => sum + (parseFloat(c.user?.taux_commission) || 0), 0) / commissions.length
    : 0;

  const getStatutColor = (etat: boolean | number) => {
    return (etat === true || etat === 1) ? "default" : "destructive";
  };

  const getStatutLabel = (etat: boolean | number) => {
    return (etat === true || etat === 1) ? "Payée" : "Non payée";
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Commissions</h1>
          <p className="text-muted-foreground">
            Suivez et gérez les commissions de vos intermédiaires et employés
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCommissionDues.toLocaleString('fr-FR')} Fcfa
            </div>
            <p className="text-xs text-muted-foreground">
              Toutes les commissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions payées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalCommissionPayees.toLocaleString('fr-FR')} Fcfa
            </div>
            <p className="text-xs text-muted-foreground">
              {totalCommissionDues > 0 ? ((totalCommissionPayees / totalCommissionDues) * 100).toFixed(1) : 0}% du total
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
              {totalCommissionEnAttente.toLocaleString('fr-FR')} Fcfa
            </div>
            <p className="text-xs text-muted-foreground">
              {nombreCommissionsEnAttente} paiement(s) en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tauxMoyen.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Commission moyenne
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">
            Toutes ({commissions.length})
          </TabsTrigger>
          <TabsTrigger value="paye">
            Payées ({nombreCommissionsPayees})
          </TabsTrigger>
          <TabsTrigger value="non_paye">
            Non payées ({nombreCommissionsEnAttente})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {/* Barre de recherche */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Liste des commissions */}
          <div className="space-y-4">
            {displayedCommissions.length > 0 ? (
              displayedCommissions.map((commission) => (
                <Card key={commission.id}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div className="md:col-span-2">
                        <h3 className="font-semibold">{commission.user?.fullname || 'N/A'}</h3>
                        <p className="text-sm text-muted-foreground">
                          Vente: {commission.vente?.reference || 'N/A'}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Prix vente</p>
                        <p className="font-semibold">
                          {parseFloat(commission.vente?.prix_total || 0).toLocaleString('fr-FR')} Fcfa
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Taux</p>
                        <p className="font-semibold">{commission.user?.taux_commission || 0}%</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Commission</p>
                        <p className="font-semibold text-green-600">
                          {parseFloat(commission.commission_due || 0).toLocaleString('fr-FR')} Fcfa
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={getStatutColor(commission.etat_commission)}>
                          {getStatutLabel(commission.etat_commission)}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(commission)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(commission.etat_commission === 0 || commission.etat_commission === false) && (
                            <Button size="sm" onClick={() => handleOpenPayDialog(commission)}>
                              <CreditCard className="h-4 w-4 mr-1" />
                              Payer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    Aucune commission {activeTab === "paye" ? "payée" : activeTab === "non_paye" ? "en attente" : "disponible"}
                  </h3>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de paiement */}
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
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Taux de commission</span>
                  <span className="font-semibold">{selectedCommission.user?.taux_commission}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Vente associée</span>
                  <span className="font-semibold">
                    {parseFloat(selectedCommission.vente?.prix_total || 0).toLocaleString('fr-FR')} Fcfa
                  </span>
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
                  required
                />
              </div>

              <div className="flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Cette action enregistrera le paiement et marquera la commission comme payée.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPayDialogOpen(false)}
              disabled={isPaying}
            >
              Annuler
            </Button>
            <Button onClick={handlePayCommission} disabled={isPaying}>
              {isPaying ? (
                <span className="flex items-center">
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Paiement...
                </span>
              ) : (
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer le paiement
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de détails */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la commission</DialogTitle>
          </DialogHeader>

          {selectedCommission && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations bénéficiaire</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nom complet</span>
                    <span className="font-medium">{selectedCommission.user?.fullname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taux de commission</span>
                    <span className="font-medium">{selectedCommission.user?.taux_commission}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détails de la vente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Référence de la Vente</span>
                    <span className="font-medium">{selectedCommission.vente?.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Montant de la vente</span>
                    <span className="font-medium">
                      {parseFloat(selectedCommission.vente?.prix_total || 0).toLocaleString('fr-FR')} Fcfa
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations de commission</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commission due</span>
                    <span className="font-bold text-green-600">
                      {parseFloat(selectedCommission.commission_due || 0).toLocaleString('fr-FR')} Fcfa
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge variant={getStatutColor(selectedCommission.etat_commission)}>
                      {getStatutLabel(selectedCommission.etat_commission)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
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