import api from "../api/api"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  ClipboardList,
  Phone,
  RefreshCw,
  Plus,
  UserPlus
} from "lucide-react";

import { toast } from 'sonner';

// Définition du type VentesStats pour typer les statistiques de ventes
type VentesStats = {
  total_ventes: number,       // Total des ventes effectuées
  vente_en_attente: number,   // Ventes en attente de paiement
  ventes_paye: number,        // Ventes payées
  ventes_annule: number,      // Ventes annulées
  mes_clients: number         // Nombre de clients
}

// Composant principal DashboardEmployee
export const DashboardEmployee = () => {

  // Hook useNavigate pour pouvoir rediriger l'utilisateur
  const navigate = useNavigate();

  // States pour gérer les données et l'état du composant
  const [myStats, setMyStats] = useState<VentesStats | null>(null); // Statistiques de l'employé
  const [lastStat, setLastStat] = useState([]);                     // Derniers clients ou ventes
  const [loading, setLoading] = useState(true);                     // État de chargement initial
  const [refreshing, setRefreshing] = useState(false);              // État pour le rafraîchissement manuel

  // Fonction pour récupérer les statistiques et ventes depuis l'API
  const getMyStats = async () => {
    try {
      // On récupère le token dans le localStorage
      const token = localStorage.getItem("token");
      
      // Si pas de token, on redirige vers la page de connexion
      if (!token) {
        console.error('Pas de token trouvé');
        navigate('/auth');
        return;
      }

      // Requête API pour récupérer les statistiques de l'utilisateur
      const response = await api.get('/ventes/myStats');
      setMyStats(response.data.data); // On stocke les stats dans le state

      // Requête API pour récupérer toutes les ventes
      const responses = await api.get('/ventes');
      if (responses.data.success && responses.data.data) {
        console.log('Nombre de ventes récupérés:', responses.data.data.length);
        setLastStat(responses.data.data); // On stocke les ventes dans le state
      } else {
        console.warn('Aucunes ventes récupérées');
        setLastStat([]); // Si aucune vente, on met un tableau vide
      }

    } catch (error: any) {
      // Gestion des erreurs
      console.error('Erreur de récupération', error);
      if (error.response?.status === 401) {
        toast.error('Token invalide ou expiré. Veuillez vous reconnecter');
        window.location.href = '/auth';
      }

      // On vide la liste des ventes en cas d'erreur
      setLastStat([]);
    } finally {
      // Fin du chargement
      setLoading(false);
    }
  }

  // Fonction pour rafraîchir manuellement les données
  const handleRefresh = async () => {
    setRefreshing(true); // On active l'état de rafraîchissement
    try {
      await getMyStats(); // On appelle la fonction pour récupérer les stats
      toast.success('Données actualisées'); // Notification succès
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation'); // Notification erreur
    } finally {
      setRefreshing(false); // Fin du rafraîchissement
    }
  };

  // useEffect qui se déclenche au montage du composant pour charger les stats
  useEffect(() => {
    getMyStats();
  }, []);

  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement de votre tableau de bord...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Retour du JSX principal du dashboard
  return (
    <div className="space-y-8">

      {/* Entête du dashboard avec titre et bouton refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord Employé</h1>
          <p className="text-muted-foreground">Gérez vos clients et suivez vos performances</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}  // Rafraîchissement manuel
          disabled={refreshing}    // Bouton désactivé pendant le refresh
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques principales de l'employé */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Carte : Mes ventes ce mois */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Mes ventes ce mois
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {myStats?.total_ventes || 0} {/* Affiche 0 si aucune vente */}
            </div>
            <p className="text-xs text-muted-foreground">
              Total des ventes effectuées
            </p>
          </CardContent>
        </Card>

        {/* Carte : Mes clients */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Mes clients
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {myStats?.mes_clients || 0} {/* Affiche 0 si aucun client */}
            </div>
            <p className="text-xs text-muted-foreground">
              Clients dans mon portefeuille
            </p>
          </CardContent>
        </Card>

        {/* Carte : Ventes payées */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Ventes payées
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {myStats?.ventes_paye || 0} {/* Affiche 0 si aucune vente payée */}
            </div>
            <p className="text-xs text-muted-foreground">
              Ventes confirmées et payées
            </p>
          </CardContent>
        </Card>

        {/* Carte : Ventes en attente */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              En attente
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {myStats?.vente_en_attente || 0} {/* Affiche 0 si aucune vente en attente */}
            </div>
            <p className="text-xs text-muted-foreground">
              Ventes en attente de paiement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sections récentes : clients et ventes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Carte : Clients récents */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Users className="h-5 w-5 text-primary" />
              Mes clients récents
            </CardTitle>
            <CardDescription>
              Derniers clients créés ou modifiés
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Vérifie s’il y a des clients */}
            {lastStat && lastStat.length > 0 ? (
              <div className="space-y-3">
                {lastStat.slice(0, 5).map((lastClient: any) => (
                  <div 
                    key={lastClient.id} 
                    className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">
                          {lastClient?.nom_client || "Client"} {/* Affiche nom ou Client */}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lastClient?.numero || "Aucun numéro"} {/* Affiche numéro ou message */}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {new Date(lastClient.created_at).toLocaleDateString('fr-FR')} {/* Date format FR */}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              // Si pas de client, message de vide
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  Aucun client pour le moment
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Vous n'avez pas encore de client dans votre portefeuille
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Carte : Ventes récentes */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Ventes récentes
            </CardTitle>
            <CardDescription>
              Dernières commandes traitées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastStat && lastStat.length > 0 ? (
              <div className="space-y-3">
                {lastStat.slice(0, 5).map((last: any) => (
                  <div 
                    key={last.id} 
                    className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">
                          {last?.reference || "Référence inconnue"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {last?.nom_client || "Client inconnu"} • {last?.prix_total || 0} FCFA
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        last?.statut === "Payé" ? "default" :
                        last?.statut === "En attente" ? "secondary" :
                        "outline"
                      }
                      className={
                        last?.statut === "Payé" ? "bg-green-600 text-white" :
                        last?.statut === "En attente" ? "bg-orange-600 text-white" :
                        ""
                      }
                    >
                      {last?.statut || "Inconnu"} {/* Affiche statut vente */}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  Aucune vente pour le moment
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Vous n'avez pas encore effectué de vente
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Résumé rapide si l’employé a des ventes ou clients */}
      {myStats && (myStats.total_ventes > 0 || myStats.mes_clients > 0) && (
        <Card className="border-border bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Résumé de performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total ventes */}
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {myStats.total_ventes}
                </p>
                <p className="text-xs text-muted-foreground">Total ventes</p>
              </div>
              {/* Ventes payées */}
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {myStats.ventes_paye}
                </p>
                <p className="text-xs text-muted-foreground">Payées</p>
              </div>
              {/* Ventes en attente */}
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {myStats.vente_en_attente || 0}
                </p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
              {/* Clients */}
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {myStats.mes_clients}
                </p>
                <p className="text-xs text-muted-foreground">Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
