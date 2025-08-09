import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Calendar,
  User,
  Package,
  Euro,
  TrendingUp,
  ShoppingCart
} from "lucide-react";

const ventes = [
  {
    id: "V001",
    date: "2024-01-15",
    client: "ABC Entreprise",
    intermediaire: "Marie Dubois",
    articles: [
      { nom: "Service Web Pro", quantite: 2, prix: 1200 },
      { nom: "Maintenance", quantite: 1, prix: 250 }
    ],
    total: 2650,
    statut: "Payé",
    commission: 145.75
  },
  {
    id: "V002", 
    date: "2024-01-16",
    client: "Tech Solutions",
    intermediaire: "Jean Martin",
    articles: [
      { nom: "Formation équipe", quantite: 1, prix: 1890 }
    ],
    total: 1890,
    statut: "En attente",
    commission: 56.70
  },
  {
    id: "V003",
    date: "2024-01-17",
    client: "Global Corp",
    intermediaire: "-",
    articles: [
      { nom: "Audit sécurité", quantite: 1, prix: 3200 },
      { nom: "Rapport détaillé", quantite: 1, prix: 800 }
    ],
    total: 4000,
    statut: "Payé",
    commission: 0
  },
  {
    id: "V004",
    date: "2024-01-18",
    client: "Start-up XYZ",
    intermediaire: "Sophie Leroy",
    articles: [
      { nom: "Consultation", quantite: 2, prix: 450 }
    ],
    total: 900,
    statut: "Facturé",
    commission: 54.00
  }
];

export function VentesSection() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ventes</h1>
          <p className="text-muted-foreground">
            Gérez vos ventes et facturations
          </p>
        </div>
        <Button className="bg-[var(--gradient-primary)] shadow-[var(--shadow-primary)]">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle vente
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ventes</CardTitle>
            <Euro className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">9,440 €</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">256 €</div>
            <p className="text-xs text-muted-foreground">À verser</p>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nb commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">4</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,360 €</div>
            <p className="text-xs text-muted-foreground">Moyenne</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher une vente..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtres</Button>
            <Button variant="outline">Exporter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales list */}
      <div className="grid gap-6">
        {ventes.map((vente) => (
          <Card key={vente.id} className="shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Vente {vente.id}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(vente.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {vente.client}
                      </div>
                    </div>
                  </div>
                </div>
                <Badge 
                  variant={
                    vente.statut === "Payé" ? "default" : 
                    vente.statut === "En attente" ? "secondary" : 
                    "outline"
                  }
                  className={
                    vente.statut === "Payé" ? "bg-success text-success-foreground" :
                    vente.statut === "En attente" ? "bg-warning text-warning-foreground" : ""
                  }
                >
                  {vente.statut}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Articles */}
                <div>
                  <h4 className="font-medium mb-2">Articles vendus:</h4>
                  <div className="space-y-2">
                    {vente.articles.map((article, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                        <span className="text-sm">{article.nom} (x{article.quantite})</span>
                        <span className="text-sm font-medium">{article.prix} €</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Intermédiaire</p>
                    <p className="font-medium">{vente.intermediaire}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Commission</p>
                    <p className="font-medium text-warning">{vente.commission} €</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-success">{vente.total} €</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">Modifier</Button>
                  <Button size="sm" variant="outline">Facture PDF</Button>
                  <Button size="sm" variant="outline">Dupliquer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}