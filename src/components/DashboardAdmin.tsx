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
  UserCheck,
  Building,
  RefreshCw,
  ClipboardList,
  Wallet,
  PackagePlus,
  PackageMinus
} from "lucide-react";
import { toast } from 'sonner';


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
  total_entrees_stock: number;
  total_sorties_stock: number;
};

export const DashboardAdmin = () => {
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true)


  const fecthDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error('Pas de token trouvé');
        return;
      }
      console.log(token)
      const response = await api.get('/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Erreur de récupération du dashboard', error);

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

  if (!stats) {
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
              onClick={fecthDashboard}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser les données
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord Administrateur</h1>
        <p className="text-muted-foreground">Vue d'ensemble complète de votre activité commerciale</p>
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


      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Revenus totaux
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats?.chiffres_affaire_total?.toLocaleString() || 0} Fcfa</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Nombre de clients
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats?.total_client || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Ventes ce mois
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats?.total_ventes || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Commissions dues
            </CardTitle>
            <Wallet className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.total_commissions_dues?.toLocaleString() || 0} Fcfa</div>
            <p className="text-xs text-muted-foreground">
              À reverser
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats stock et commissions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Entrées Stock
            </CardTitle>
            <PackagePlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.total_entrees_stock || 0}</div>
            <p className="text-xs text-muted-foreground">
              Articles ajoutés
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Sorties Stock
            </CardTitle>
            <PackageMinus className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.total_sorties_stock || 0}</div>
            <p className="text-xs text-muted-foreground">
              Articles vendus
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Commissions reversées
            </CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.total_commissions_reversees?.toLocaleString() || 0} Fcfa</div>
            <p className="text-xs text-muted-foreground">
              Déjà payées
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Stock faible
            </CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.total_stock_faible || 0}</div>
            <p className="text-xs text-muted-foreground">
              Nécessite réapprovisionnement
            </p>
          </CardContent>
        </Card>
      </div>

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
            {/* <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">En congé</span>
              <Badge variant="outline">3</Badge>
            </div> */}
          </CardContent>
        </Card>

        {/* <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <UserCheck className="h-5 w-5 text-primary" />
              Intermédiaires
            </CardTitle>
            <CardDescription>
              Gestion des commissions et performances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Intermédiaires actifs</span>
              <Badge variant="secondary">156</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Commission moyenne</span>
              <Badge variant="outline">4.2%</Badge>
            </div>
          </CardContent>
        </Card> */}

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
            {/* <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Commandes en cours</span>
              <Badge variant="outline">18</Badge>
            </div> */}
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