import { useState, useEffect } from "react";
import api from '../api/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  Package,
  DollarSign,
  Building,
  RefreshCw,
  ClipboardList,
  Wallet,
  PackagePlus,
  PackageMinus,
  BarChart3,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { set } from "date-fns";


type Stats = {
  total_client: number;
  nouveau_cient: number;
  total_employe: number;
  total_employe_inactifs: number;
  total_personnels: number;
  total_fournisseurs: number;
  total_produits_stock: number;
  chiffres_affaire_total: number;
  total_ventes: number;
  total_stock_faible: number;
  total_commissions_dues: number;
  total_commissions_reversees: number;
  total_entrees_stock: string;
  total_sorties_stock: string;
};

type AllStats = {
  benefices_total: number;
  benefice_mois: number;
  chiffres_affaire_mois: number;
  total_ventes: number;
  ventes_en_attente: number;
  ventes_regles: number;
  total_achats: number;
  total_prix_achats: number;
};

type MonthlyData = {
  mois: string;
  mois_complet: string;
  ventes: number;
  achats: number;
  commissions: number;
  benefices: number;
};

const COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#a855f7',
  cyan: '#06b6d4',
  pink: '#ec4899',
  indigo: '#6366f1'
};

export const DashboardAdmin = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null);
  const [allStats, setAllStats] = useState<AllStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true)
  const [showGraphs, setShowGraphs] = useState(false);

  const [showMontant, setShowMontant] = useState(false);
  const formartMontant = (montant: number | string) => {
    if(!showMontant){
      return '****'}
     const montantNumber = typeof montant === 'string' ? parseFloat(montant) : montant;
     return montantNumber.toLocaleString(); 
  }

  const handleToggleMontant = () => {
    if(showMontant){
      setShowMontant(false)
    }else{
      setShowMontant(true)
    }
  }

  const fecthDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error('Pas de token trouvé');
        return;
      }
      
      const response = await api.get('/dashboard');
      const responsesStats = await api.get('/allStats');
      const monthlyResponse = await api.get('/monthlyStats');
      
      setStats(response.data.data);
      setAllStats(responsesStats.data.data);
      setMonthlyData(monthlyResponse.data.data || []);
      
      // console.log('Dashboard:', response.data.data);
      // console.log('All Stats:', responsesStats.data.data);
      // console.log('Monthly Data:', monthlyResponse.data.data);
    } catch (error) {
      console.error('Erreur de récupération du dashboard', error);
      toast.error('Erreur lors du chargement des données');

      if (error.response?.status === 401) {
        console.error('token invalide ou expiré');
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fecthDashboard();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fecthDashboard();
      toast.success('Données actualisées')
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  }

  // Préparer les données pour les graphiques
  const getStockData = () => {
    if (!stats) return [];
    return [
      { name: 'Entrées Stock', value: parseInt(stats.total_entrees_stock) || 0, color: COLORS.success },
      { name: 'Sorties Stock', value: parseInt(stats.total_sorties_stock) || 0, color: COLORS.danger }
    ];
  };

  const getClientsData = () => {
    if (!stats) return [];
    const ancienClients = stats.total_client - stats.nouveau_cient;
    return [
      { name: 'Nouveaux clients', value: stats.nouveau_cient || 0, color: COLORS.primary },
      { name: 'Clients existants', value: ancienClients > 0 ? ancienClients : 0, color: COLORS.cyan }
    ];
  };

  const getPersonnelData = () => {
    if (!stats) return [];
    return [
      { name: 'Employés actifs', value: stats.total_employe || 0, color: COLORS.success },
      { name: 'Employés inactifs', value: stats.total_employe_inactifs || 0, color: COLORS.warning },
      { name: 'Fournisseurs', value: stats.total_fournisseurs || 0, color: COLORS.purple }
    ];
  };

  const getCommissionsData = () => {
    if (!stats) return [];
    return [
      { name: 'Commissions reversées', value: stats.total_commissions_reversees || 0, color: COLORS.success },
      { name: 'Commissions dues', value: stats.total_commissions_dues || 0, color: COLORS.warning }
    ];
  };

  const getStockStatusData = () => {
    if (!stats) return [];
    const stockNormal = stats.total_produits_stock - stats.total_stock_faible;
    return [
      { name: 'Stock normal', value: stockNormal > 0 ? stockNormal : 0, color: COLORS.success },
      { name: 'Stock faible', value: stats.total_stock_faible || 0, color: COLORS.danger }
    ];
  };

  const getVentesData = () => {
    if (!allStats) return [];
    return [
      { name: 'Payées', value: allStats.total_ventes || 0, color: COLORS.success },
      { name: 'En attente', value: allStats.ventes_en_attente || 0, color: COLORS.warning },
      { name: 'Réglées', value: allStats.ventes_regles || 0, color: COLORS.primary }
    ];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Valeur: <span className="font-bold text-foreground">{data.value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement des statistiques...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats || !allStats) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-muted rounded-full p-4 mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl mb-2 text-foreground">
              Aucune statistique disponible
            </CardTitle>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Les données du tableau de bord ne sont pas disponibles pour le moment.
              Vérifiez votre connexion et réessayez.
            </p>
            <Button
              onClick={handleRefresh}
              className="flex items-center gap-2"
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser les données
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const benefice = allStats?.benefices_total || 0;
  const isBeneficePositif = benefice >= 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord Administrateur</h1>
          <p className="text-muted-foreground">Vue d'ensemble complète de votre activité commerciale</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button
          variant={showMontant ? "default" : "outline"} size="sm" onClick={handleToggleMontant}
          >
            {showMontant ? (
              <>
              <EyeOff className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Masquer le montant</span>
              <span className="hidden sm:hidden">Masquer</span>
              </>
            ): (
              <>
              <Eye className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Voir le montant</span>
              <span className="hidden sm:hidden">Voir</span>
              </>
            )}
          </Button>
          <Button
            variant={showGraphs ? "default" : "outline"}
            onClick={() => setShowGraphs(!showGraphs)}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            {showGraphs ? "Masquer graphiques" : "Voir graphiques"}
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Card Bénéfices - Pleine largeur */}
      <Card className={`border-2 ${isBeneficePositif ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${isBeneficePositif ? 'bg-green-500' : 'bg-red-500'}`}>
              {isBeneficePositif ? (
                <TrendingUp className="h-6 w-6 text-white" />
              ) : (
                <TrendingDown className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-medium">Bénéfices Total</CardTitle>
              <CardDescription>Revenus - Achats - Commissions</CardDescription>
            </div>
          </div>
          <Badge variant={isBeneficePositif ? "default" : "destructive"} className="text-sm px-3 py-1">
            {isBeneficePositif ? (
              <ArrowUpRight className="h-4 w-4 mr-1 inline" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-1 inline" />
            )}
            {isBeneficePositif ? "Positif" : "Négatif"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className={`text-4xl font-bold ${isBeneficePositif ? 'text-green-600' : 'text-red-600'}`}>
            {showMontant ? 
            <>
            {isBeneficePositif ? '+' : ''}{benefice.toLocaleString()} Fcfa
            </>
            : '****'
            }
          </div>
          <div className="flex gap-6 mt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Revenus totaux</p>
              <p className="font-semibold text-green-600">
                {showMontant ?
                <>
                +{stats?.chiffres_affaire_total?.toLocaleString() || 0} Fcfa
                </>
                : '****'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Achats totaux</p>
              <p className="font-semibold text-red-600">
                {showMontant ?
                <>
                -{allStats?.total_prix_achats?.toLocaleString() || 0} Fcfa
                </>
                : '****'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Commissions payées</p>
              <p className="font-semibold text-orange-600">
                {showMontant ?
                <>
                -{stats?.total_commissions_reversees?.toLocaleString() || 0} Fcfa
                </>
                : '****'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats principales - 4 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Revenus totaux
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {showMontant ?
              <>
              {stats?.chiffres_affaire_total?.toLocaleString() || 0} Fcfa
              </>
              : '****'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Chiffre d'affaires total
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Nombre de clients
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats?.total_client || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-semibold">+{stats?.nouveau_cient || 0}</span> ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Ventes ce mois
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats?.total_ventes || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Transactions réalisées
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Commissions dues
            </CardTitle>
            <Wallet className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {showMontant ?
              <>
              {stats?.total_commissions_dues?.toLocaleString() || 0} Fcfa
              </>
              : '****'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              À reverser
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats stock et commissions - 4 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Entrées Stock
            </CardTitle>
            <PackagePlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stats?.total_entrees_stock || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Articles ajoutés
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Sorties Stock
            </CardTitle>
            <PackageMinus className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{stats?.total_sorties_stock || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Articles vendus
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Commissions reversées
            </CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {showMontant ? 
              <>
                {stats?.total_commissions_reversees?.toLocaleString() || 0} Fcfa
              </> 
              : '****' 
            }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Déjà payées
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Stock faible
            </CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.total_stock_faible || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nécessite réapprovisionnement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Graphiques */}
      {showGraphs && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Analyse graphique</h2>
          
          {/* Graphique unique avec tabs */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                Analyses des données
              </CardTitle>
              <CardDescription>
                Sélectionnez une catégorie pour visualiser les statistiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="evolution" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="evolution">Évolution</TabsTrigger>
                  <TabsTrigger value="stock">Stock</TabsTrigger>
                  <TabsTrigger value="ventes">Ventes</TabsTrigger>
                  <TabsTrigger value="clients">Clients</TabsTrigger>
                  <TabsTrigger value="personnel">Personnel</TabsTrigger>
                </TabsList>

                <TabsContent value="evolution">
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2">Évolution mensuelle</h3>
                    <p className="text-sm text-muted-foreground mb-4">Ventes, Achats et Bénéfices</p>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mois" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${Number(value).toLocaleString()} Fcfa`} />
                        <Legend />
                        <Line type="monotone" dataKey="ventes" stroke={COLORS.success} strokeWidth={2} name="Ventes" />
                        <Line type="monotone" dataKey="achats" stroke={COLORS.danger} strokeWidth={2} name="Achats" />
                        <Line type="monotone" dataKey="benefices" stroke={COLORS.primary} strokeWidth={2} name="Bénéfices" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="stock">
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2">Mouvements de Stock</h3>
                    <p className="text-sm text-muted-foreground mb-4">Entrées vs Sorties</p>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={getStockData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="#3b82f6">
                          {getStockData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="ventes">
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2">Répartition des Ventes</h3>
                    <p className="text-sm text-muted-foreground mb-4">Par statut</p>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={getVentesData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getVentesData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="clients">
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2">Répartition des Clients</h3>
                    <p className="text-sm text-muted-foreground mb-4">Nouveaux vs Existants</p>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={getClientsData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getClientsData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="personnel">
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2">Personnel & Fournisseurs</h3>
                    <p className="text-sm text-muted-foreground mb-4">Répartition des acteurs</p>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={getPersonnelData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent, value }) => `${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getPersonnelData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sections de gestion */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Users className="h-5 w-5 text-primary" />
              Gestion du personnel
            </CardTitle>
            <CardDescription>
              Gérez vos employés et leurs accès
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Employés actifs</span>
              <Badge variant="secondary">{stats?.total_employe}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Building className="h-5 w-5 text-primary" />
              Fournisseurs
            </CardTitle>
            <CardDescription>
              Gestion des relations fournisseurs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Fournisseurs actifs</span>
              <Badge variant="secondary">{stats?.total_fournisseurs}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Package className="h-5 w-5 text-primary" />
              Gestion du stock
            </CardTitle>
            <CardDescription>
              Articles en stock et mouvements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Articles en stock</span>
              <Badge variant="secondary">{stats?.total_produits_stock}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Stock faible</span>
              <Badge variant="destructive">{stats?.total_stock_faible}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};