import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  ShoppingCart,
  Wallet,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const stats = [
  {
    title: "Chiffre d'affaires",
    value: "124 580 €",
    change: "+12.5%",
    trend: "up",
    icon: TrendingUp,
    description: "Ce mois"
  },
  {
    title: "Bénéfice net",
    value: "28 340 €",
    change: "+8.2%",
    trend: "up",
    icon: Wallet,
    description: "Marge: 22.8%"
  },
  {
    title: "Clients actifs",
    value: "1,247",
    change: "+23",
    trend: "up",
    icon: Users,
    description: "Nouveaux ce mois"
  },
  {
    title: "Commandes",
    value: "342",
    change: "-2.1%",
    trend: "down",
    icon: ShoppingCart,
    description: "En cours: 28"
  },
  {
    title: "Articles en stock",
    value: "2,891",
    change: "Stable",
    trend: "neutral",
    icon: Package,
    description: "Valeur: 45 230 €"
  },
  {
    title: "Commissions dues",
    value: "5,680 €",
    change: "8 intermédiaires",
    trend: "neutral",
    icon: AlertCircle,
    description: "À régler"
  }
];

const recentSales = [
  { client: "ABC Entreprise", montant: "2,450 €", statut: "Payé", intermediaire: "Marie Dubois" },
  { client: "Tech Solutions", montant: "1,890 €", statut: "En attente", intermediaire: "Jean Martin" },
  { client: "Global Corp", montant: "5,200 €", statut: "Payé", intermediaire: "-" },
  { client: "Start-up XYZ", montant: "980 €", statut: "Payé", intermediaire: "Sophie Leroy" },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre activité commerciale
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 shadow-[var(--shadow-card)] border-border/50"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-success' : 
                    stat.trend === 'down' ? 'text-destructive' : 
                    'text-muted-foreground'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Sales */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Ventes récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSales.map((sale, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{sale.client}</p>
                  <p className="text-sm text-muted-foreground">
                    Intermédiaire: {sale.intermediaire}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-foreground">{sale.montant}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    sale.statut === 'Payé' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {sale.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}