import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  Plus,
  Eye,
  CreditCard
} from "lucide-react";

const commissionsData = [
  {
    id: 1,
    nom: "Marie Dubois",
    type: "Intermédiaire",
    ventesTotales: 45000,
    tauxCommission: 8,
    commissionDue: 3600,
    commissionPayee: 2800,
    statut: "En attente",
    dernierPaiement: "2024-01-15"
  },
  {
    id: 2,
    nom: "Pierre Martin",
    type: "Employé",
    ventesTotales: 32000,
    tauxCommission: 5,
    commissionDue: 1600,
    commissionPayee: 1600,
    statut: "Payé",
    dernierPaiement: "2024-01-20"
  },
  {
    id: 3,
    nom: "Sophie Bernard",
    type: "Intermédiaire",
    ventesTotales: 28000,
    tauxCommission: 7,
    commissionDue: 1960,
    commissionPayee: 980,
    statut: "Partiel",
    dernierPaiement: "2024-01-10"
  },
  {
    id: 4,
    nom: "Lucas Petit",
    type: "Employé",
    ventesTotales: 38000,
    tauxCommission: 6,
    commissionDue: 2280,
    commissionPayee: 0,
    statut: "En attente",
    dernierPaiement: "-"
  }
];

export function CommissionsSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const filteredCommissions = commissionsData.filter(commission =>
    commission.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCommissionsDues = commissionsData.reduce((sum, c) => sum + c.commissionDue, 0);
  const totalCommissionsPayees = commissionsData.reduce((sum, c) => sum + c.commissionPayee, 0);
  const commissionsEnAttente = commissionsData.filter(c => c.statut === "En attente").length;

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "Payé": return "bg-green-100 text-green-800";
      case "En attente": return "bg-yellow-100 text-yellow-800";
      case "Partiel": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Commissions</h1>
          <p className="text-muted-foreground">
            Suivez et gérez les commissions de vos intermédiaires et employés
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle commission
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total à payer</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalCommissionsDues - totalCommissionsPayees).toLocaleString()} €</div>
            <p className="text-xs text-muted-foreground">
              Sur {totalCommissionsDues.toLocaleString()} € dus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions payées</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCommissionsPayees.toLocaleString()} €</div>
            <p className="text-xs text-muted-foreground">
              {((totalCommissionsPayees / totalCommissionsDues) * 100).toFixed(1)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commissionsEnAttente}</div>
            <p className="text-xs text-muted-foreground">
              Paiements en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux moyen</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(commissionsData.reduce((sum, c) => sum + c.tauxCommission, 0) / commissionsData.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Commission moyenne
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
            <Button>
              <CreditCard className="mr-2 h-4 w-4" />
              Payer sélectionnées
            </Button>
          </div>

          {/* Liste des commissions */}
          <div className="space-y-4">
            {filteredCommissions.map((commission) => (
              <Card key={commission.id}>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div className="md:col-span-2">
                      <h3 className="font-semibold">{commission.nom}</h3>
                      <p className="text-sm text-muted-foreground">{commission.type}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Ventes</p>
                      <p className="font-semibold">{commission.ventesTotales.toLocaleString()} €</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Taux</p>
                      <p className="font-semibold">{commission.tauxCommission}%</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Commission</p>
                      <p className="font-semibold">{commission.commissionDue.toLocaleString()} €</p>
                      <p className="text-xs text-muted-foreground">
                        Payé: {commission.commissionPayee.toLocaleString()} €
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={getStatutColor(commission.statut)}>
                        {commission.statut}
                      </Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                          Payer
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paiements en cours</CardTitle>
              <CardDescription>
                Gérez les paiements de commissions en attente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Interface de paiement en cours de développement...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements</CardTitle>
              <CardDescription>
                Consultez l'historique complet des commissions payées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Historique en cours de développement...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}