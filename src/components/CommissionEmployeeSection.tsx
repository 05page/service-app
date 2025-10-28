import { useState, useEffect } from "react";
import api from "../api/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Clock, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function CommissionEmployeeSection() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommissions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token non trouvé");
        return;
      }

      // Récupérer les commissions de l'employé
      const response = await api.get('/commissions/mesCommissions');
      
      if (response.data.success) {
        setCommissions(response.data.liste || []);
        setStats(response.data.resume || {});
      } else {
        toast.error(response.data.message || 'Erreur lors du chargement des commissions');
        setCommissions([]);
        setStats({
          total_commission: 0,
          commission_payee: 0,
          commission_en_attente: 0
        });
      }

    } catch (error: any) {
      console.error('Erreur lors de la récupération des commissions', error);
      if (error.response?.status === 401) {
        toast.error('Token invalide ou expiré. Veuillez vous reconnecter');
        window.location.href = '/auth';
      } else if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'Accès refusé');
      } else {
        toast.error('Erreur lors du chargement des commissions');
      }
      setCommissions([]);
      setStats({
        total_commission: 0,
        commission_payee: 0,
        commission_en_attente: 0
      });
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchCommissions();
  }, []);

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
          <h1 className="text-3xl font-bold tracking-tight">Mes Commissions</h1>
          <p className="text-muted-foreground">Suivez vos commissions et leur statut de paiement</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {(stats?.total_commission || 0).toLocaleString('fr-FR')} Fcfa
            </div>
            <p className="text-xs text-muted-foreground">
              Toutes vos commissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(stats?.commission_payee || 0).toLocaleString('fr-FR')} Fcfa
            </div>
            <p className="text-xs text-muted-foreground">
              Commissions versées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {(stats?.commission_en_attente || 0).toLocaleString('fr-FR')} Fcfa
            </div>
            <p className="text-xs text-muted-foreground">
              À recevoir
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table des commissions */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Commissions</CardTitle>
          <CardDescription>Détails de vos commissions par vente</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence Vente</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant Commission</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date Versement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions && commissions.length > 0 ? (
                commissions.map((commission: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {commission.reference_vente || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {commission.nom_client || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-primary">
                        {parseFloat(commission.montant_commission || 0).toLocaleString('fr-FR')} Fcfa
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={commission.etat_commission === 'Payée' ? "default" : "secondary"}>
                        {commission.etat_commission}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {commission.date_versement 
                        ? new Date(commission.date_versement).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <DollarSign className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      Aucune commission disponible
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Vous n'avez pas encore de commission enregistrée
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}