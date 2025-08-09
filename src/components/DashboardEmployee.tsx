import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  UserCheck,
  ClipboardList,
  Phone
} from "lucide-react";

export const DashboardEmployee = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord Employé</h1>
        <p className="text-muted-foreground">Gérez vos clients et suivez vos performances</p>
      </div>

      {/* Stats employé */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Mes ventes ce mois
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">87</div>
            <p className="text-xs text-muted-foreground">
              +23% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Mes clients
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">247</div>
            <p className="text-xs text-muted-foreground">
              +12 nouveaux ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              CA généré
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">24,580 €</div>
            <p className="text-xs text-muted-foreground">
              Objectif: 30,000 € (82%)
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Tâches en cours
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">12</div>
            <p className="text-xs text-muted-foreground">
              3 urgentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sections employé */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Société ABC</p>
                <p className="text-sm text-muted-foreground">contact@abc.com</p>
              </div>
              <Badge variant="secondary">Nouveau</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Tech Solutions</p>
                <p className="text-sm text-muted-foreground">info@tech.com</p>
              </div>
              <Badge variant="outline">Modifié</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Innovation Corp</p>
                <p className="text-sm text-muted-foreground">hello@innov.com</p>
              </div>
              <Badge variant="secondary">Nouveau</Badge>
            </div>
          </CardContent>
        </Card>

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
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Commande #1234</p>
                <p className="text-sm text-muted-foreground">Société ABC - 1,250 €</p>
              </div>
              <Badge variant="secondary">Validée</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Commande #1235</p>
                <p className="text-sm text-muted-foreground">Tech Solutions - 850 €</p>
              </div>
              <Badge variant="outline">En cours</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Commande #1236</p>
                <p className="text-sm text-muted-foreground">Innovation Corp - 2,100 €</p>
              </div>
              <Badge variant="secondary">Expédiée</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <UserCheck className="h-5 w-5 text-primary" />
              Mes intermédiaires
            </CardTitle>
            <CardDescription>
              Personnes qui m'apportent des clients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Marie Dubois</p>
                <p className="text-sm text-muted-foreground">5 clients apportés</p>
              </div>
              <Badge variant="secondary">5% comm.</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Pierre Martin</p>
                <p className="text-sm text-muted-foreground">3 clients apportés</p>
              </div>
              <Badge variant="outline">3% comm.</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Phone className="h-5 w-5 text-primary" />
              Actions rapides
            </CardTitle>
            <CardDescription>
              Raccourcis pour les tâches courantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Nouveaux prospects</span>
              <Badge variant="destructive">5</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Relances à faire</span>
              <Badge variant="secondary">12</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Devis en attente</span>
              <Badge variant="outline">8</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};