import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  DollarSign, 
  UserCheck,
  Building,
  ClipboardList
} from "lucide-react";

export const DashboardAdmin = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord Administrateur</h1>
        <p className="text-muted-foreground">Vue d'ensemble complète de votre activité commerciale</p>
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
            <div className="text-2xl font-bold text-card-foreground">145 320 €</div>
            <p className="text-xs text-muted-foreground">
              +12.5% par rapport au mois dernier
            </p>
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
            <div className="text-2xl font-bold text-card-foreground">2,847</div>
            <p className="text-xs text-muted-foreground">
              +8.2% par rapport au mois dernier
            </p>
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
            <div className="text-2xl font-bold text-card-foreground">1,234</div>
            <p className="text-xs text-muted-foreground">
              +15.3% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Commissions à payer
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">8,450 €</div>
            <p className="text-xs text-muted-foreground">
              Pour ce mois
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
              <Badge variant="secondary">24</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">En congé</span>
              <Badge variant="outline">3</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
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
              <Badge variant="secondary">42</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Commandes en cours</span>
              <Badge variant="outline">18</Badge>
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
              <Badge variant="secondary">1,847</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Stock faible</span>
              <Badge variant="destructive">7</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <ClipboardList className="h-5 w-5 text-primary" />
              Rapports & Analytics
            </CardTitle>
            <CardDescription>
              Analyses détaillées et rapports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Rapports générés</span>
              <Badge variant="secondary">45</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Alertes actives</span>
              <Badge variant="outline">2</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <DollarSign className="h-5 w-5 text-primary" />
              Finances
            </CardTitle>
            <CardDescription>
              Vue financière globale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Marge brute</span>
              <Badge variant="secondary">32.5%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-card-foreground">Impayés</span>
              <Badge variant="destructive">2,340 €</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};