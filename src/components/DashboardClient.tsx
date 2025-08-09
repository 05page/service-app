import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Package, 
  CreditCard,
  Clock,
  FileText,
  History
} from "lucide-react";

export const DashboardClient = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mon espace client</h1>
        <p className="text-muted-foreground">Consultez vos commandes et factures</p>
      </div>

      {/* Stats client */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Commandes totales
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">47</div>
            <p className="text-xs text-muted-foreground">
              Depuis votre inscription
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Commandes en cours
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">3</div>
            <p className="text-xs text-muted-foreground">
              En préparation ou expédition
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total dépensé
            </CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">18,450 €</div>
            <p className="text-xs text-muted-foreground">
              Cette année
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Factures impayées
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">1</div>
            <p className="text-xs text-muted-foreground">
              850 € à régler
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sections client */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Package className="h-5 w-5 text-primary" />
              Commandes récentes
            </CardTitle>
            <CardDescription>
              Vos dernières commandes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Commande #CMD-2024-001</p>
                <p className="text-sm text-muted-foreground">15 Mars 2024 - 1,250 €</p>
              </div>
              <Badge variant="secondary">Livrée</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Commande #CMD-2024-002</p>
                <p className="text-sm text-muted-foreground">20 Mars 2024 - 850 €</p>
              </div>
              <Badge variant="outline">Expédiée</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Commande #CMD-2024-003</p>
                <p className="text-sm text-muted-foreground">25 Mars 2024 - 2,100 €</p>
              </div>
              <Badge variant="destructive">En préparation</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Factures récentes
            </CardTitle>
            <CardDescription>
              Vos dernières factures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Facture #FAC-2024-067</p>
                <p className="text-sm text-muted-foreground">15 Mars 2024 - 1,250 €</p>
              </div>
              <Badge variant="secondary">Payée</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Facture #FAC-2024-068</p>
                <p className="text-sm text-muted-foreground">20 Mars 2024 - 850 €</p>
              </div>
              <Badge variant="destructive">En attente</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium text-card-foreground">Facture #FAC-2024-069</p>
                <p className="text-sm text-muted-foreground">25 Mars 2024 - 2,100 €</p>
              </div>
              <Badge variant="outline">Brouillon</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <History className="h-5 w-5 text-primary" />
              Historique des services
            </CardTitle>
            <CardDescription>
              Services que vous avez commandés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-card-foreground mb-2">Service Web</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Développement site vitrine
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">12 commandes</span>
                    <Badge variant="secondary">Actif</Badge>
                  </div>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-card-foreground mb-2">Service Marketing</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Campagnes publicitaires
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">8 commandes</span>
                    <Badge variant="outline">En pause</Badge>
                  </div>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-card-foreground mb-2">Service IT</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Maintenance informatique
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">15 commandes</span>
                    <Badge variant="secondary">Actif</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};