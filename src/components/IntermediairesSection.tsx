import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Mail, 
  Phone,
  Percent,
  Wallet,
  TrendingUp,
  UserCheck
} from "lucide-react";

const intermediaires = [
  {
    id: 1,
    nom: "Marie Dubois",
    email: "marie.dubois@email.fr",
    telephone: "06 12 34 56 78",
    type: "Externe",
    commission: 5.5,
    commissionDue: "890 €",
    commissionPayee: "2,340 €",
    clients: 12,
    ca: "28,450 €"
  },
  {
    id: 2,
    nom: "Jean Martin",
    email: "jean.martin@entreprise.fr",
    telephone: "06 98 76 54 32",
    type: "Employé",
    commission: 3.0,
    commissionDue: "420 €",
    commissionPayee: "1,890 €",
    clients: 8,
    ca: "18,790 €"
  },
  {
    id: 3,
    nom: "Sophie Leroy",
    email: "sophie.leroy@gmail.com",
    telephone: "06 11 22 33 44",
    type: "Externe",
    commission: 6.0,
    commissionDue: "1,240 €",
    commissionPayee: "3,120 €",
    clients: 15,
    ca: "35,200 €"
  },
  {
    id: 4,
    nom: "Pierre Moreau",
    email: "p.moreau@contact.fr",
    telephone: "06 55 66 77 88",
    type: "Externe",
    commission: 4.5,
    commissionDue: "0 €",
    commissionPayee: "980 €",
    clients: 5,
    ca: "12,980 €"
  }
];

export function IntermediairesSection() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Intermédiaires</h1>
          <p className="text-muted-foreground">
            Gérez vos intermédiaires et leurs commissions
          </p>
        </div>
        <Button className="bg-[var(--gradient-primary)] shadow-[var(--shadow-primary)]">
          <Plus className="mr-2 h-4 w-4" />
          Nouvel intermédiaire
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions dues</CardTitle>
            <Wallet className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">2,550 €</div>
            <p className="text-xs text-muted-foreground">4 intermédiaires</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions payées</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">8,330 €</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux moyen</CardTitle>
            <Percent className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">4.75%</div>
            <p className="text-xs text-muted-foreground">Commission moyenne</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un intermédiaire..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline">Payer commissions</Button>
          </div>
        </CardContent>
      </Card>

      {/* Intermediaires grid */}
      <div className="grid gap-6">
        {intermediaires.map((inter) => (
          <Card key={inter.id} className="shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{inter.nom}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {inter.clients} clients • {inter.commission}% commission
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={inter.type === "Employé" ? "default" : "secondary"}
                  className={inter.type === "Employé" ? "bg-primary text-primary-foreground" : ""}
                >
                  {inter.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{inter.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{inter.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span>Taux: {inter.commission}%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">CA généré</span>
                    <span className="font-semibold text-success">{inter.ca}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Commission due</span>
                    <span className="font-semibold text-warning">{inter.commissionDue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Commission payée</span>
                    <span className="font-semibold text-muted-foreground">{inter.commissionPayee}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">Modifier taux</Button>
                    <Button 
                      size="sm" 
                      className="bg-warning text-warning-foreground"
                      disabled={inter.commissionDue === "0 €"}
                    >
                      <Wallet className="h-4 w-4 mr-1" />
                      Payer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}