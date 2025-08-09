import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin,
  TrendingUp,
  User
} from "lucide-react";

const clients = [
  {
    id: 1,
    nom: "ABC Entreprise",
    email: "contact@abc-entreprise.fr",
    telephone: "01 23 45 67 89",
    adresse: "Paris, France",
    statut: "Actif",
    ca: "12,450 €",
    commandes: 8,
    intermediaire: "Marie Dubois"
  },
  {
    id: 2,
    nom: "Tech Solutions",
    email: "info@techsol.com",
    telephone: "01 98 76 54 32",
    adresse: "Lyon, France", 
    statut: "Actif",
    ca: "8,790 €",
    commandes: 5,
    intermediaire: "Jean Martin"
  },
  {
    id: 3,
    nom: "Global Corp",
    email: "admin@globalcorp.fr",
    telephone: "01 11 22 33 44",
    adresse: "Marseille, France",
    statut: "Inactif",
    ca: "15,200 €",
    commandes: 12,
    intermediaire: "-"
  },
  {
    id: 4,
    nom: "Start-up XYZ",
    email: "hello@startupxyz.io",
    telephone: "01 55 66 77 88",
    adresse: "Toulouse, France",
    statut: "Actif",
    ca: "4,980 €",
    commandes: 3,
    intermediaire: "Sophie Leroy"
  }
];

export function ClientsSection() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Clients</h1>
          <p className="text-muted-foreground">
            Gérez votre portefeuille client
          </p>
        </div>
        <Button className="bg-[var(--gradient-primary)] shadow-[var(--shadow-primary)]">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau client
        </Button>
      </div>

      {/* Search and filters */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un client..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtres</Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients grid */}
      <div className="grid gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{client.nom}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Intermédiaire: {client.intermediaire}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={client.statut === "Actif" ? "default" : "secondary"}
                  className={client.statut === "Actif" ? "bg-success text-success-foreground" : ""}
                >
                  {client.statut}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{client.adresse}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Chiffre d'affaires</span>
                    <span className="font-semibold text-success">{client.ca}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Commandes</span>
                    <span className="font-semibold">{client.commandes}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">Modifier</Button>
                    <Button size="sm" variant="outline">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Historique
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