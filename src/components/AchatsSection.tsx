import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Package, Calendar, TrendingUp, DollarSign } from "lucide-react";

interface Achat {
  id: string;
  numeroCommande: string;
  fournisseur: string;
  service: string;
  quantite: number;
  prixUnitaire: number;
  montantTotal: number;
  statut: "en_attente" | "confirme" | "recu" | "annule";
  dateCommande: string;
  dateLivraison?: string;
  description: string;
}

export function AchatsSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState<string>("tous");
  const [selectedPeriode, setSelectedPeriode] = useState<string>("ce_mois");

  const achats: Achat[] = [
    {
      id: "1",
      numeroCommande: "ACH-2024-001",
      fournisseur: "TechServices Pro",
      service: "Développement Application Mobile",
      quantite: 1,
      prixUnitaire: 5000,
      montantTotal: 5000,
      statut: "confirme",
      dateCommande: "2024-01-15",
      dateLivraison: "2024-02-15",
      description: "Développement d'une application mobile pour iOS et Android"
    },
    {
      id: "2",
      numeroCommande: "ACH-2024-002",
      fournisseur: "Marketing Solutions",
      service: "Campagne Publicitaire Facebook",
      quantite: 3,
      prixUnitaire: 800,
      montantTotal: 2400,
      statut: "recu",
      dateCommande: "2024-01-20",
      dateLivraison: "2024-01-25",
      description: "Création et gestion de 3 campagnes publicitaires sur Facebook"
    },
    {
      id: "3",
      numeroCommande: "ACH-2024-003",
      fournisseur: "Design Studio",
      service: "Refonte Logo et Identité Visuelle",
      quantite: 1,
      prixUnitaire: 1200,
      montantTotal: 1200,
      statut: "en_attente",
      dateCommande: "2024-01-25",
      description: "Refonte complète du logo et création de l'identité visuelle"
    }
  ];

  const filteredAchats = achats.filter(achat => {
    const matchesSearch = achat.numeroCommande.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achat.fournisseur.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achat.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = selectedStatut === "tous" || achat.statut === selectedStatut;
    return matchesSearch && matchesStatut;
  });

  const totalAchats = achats.length;
  const montantTotalAchats = achats.reduce((sum, achat) => sum + achat.montantTotal, 0);
  const achatsEnCours = achats.filter(a => a.statut === "confirme" || a.statut === "en_attente").length;
  const achatsRecus = achats.filter(a => a.statut === "recu").length;

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "en_attente":
        return "secondary";
      case "confirme":
        return "default";
      case "recu":
        return "default";
      case "annule":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case "en_attente":
        return "En attente";
      case "confirme":
        return "Confirmé";
      case "recu":
        return "Reçu";
      case "annule":
        return "Annulé";
      default:
        return statut;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Achats</h1>
          <p className="text-muted-foreground">Gérez vos commandes et achats de services</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Commande
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle commande</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fournisseur">Fournisseur</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="techservices">TechServices Pro</SelectItem>
                    <SelectItem value="marketing">Marketing Solutions</SelectItem>
                    <SelectItem value="design">Design Studio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Input id="service" placeholder="Nom du service" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantite">Quantité</Label>
                <Input id="quantite" type="number" placeholder="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prix">Prix unitaire (€)</Label>
                <Input id="prix" type="number" placeholder="1000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="livraison">Date de livraison souhaitée</Label>
                <Input id="livraison" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="confirme">Confirmé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Description détaillée du service" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Annuler</Button>
              <Button>Créer la commande</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAchats}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Cours</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{achatsEnCours}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reçus</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{achatsRecus}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{montantTotalAchats.toLocaleString()} €</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des achats</CardTitle>
          <CardDescription>Suivez vos commandes et leur statut</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par numéro, fournisseur ou service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatut} onValueChange={setSelectedStatut}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="confirme">Confirmé</SelectItem>
                <SelectItem value="recu">Reçu</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ce_mois">Ce mois</SelectItem>
                <SelectItem value="mois_dernier">Mois dernier</SelectItem>
                <SelectItem value="trimestre">Ce trimestre</SelectItem>
                <SelectItem value="annee">Cette année</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Prix unitaire</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Livraison</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAchats.map((achat) => (
                <TableRow key={achat.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{achat.numeroCommande}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(achat.dateCommande).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{achat.fournisseur}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{achat.service}</div>
                      <div className="text-sm text-muted-foreground max-w-xs truncate">
                        {achat.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{achat.quantite}</TableCell>
                  <TableCell>{achat.prixUnitaire.toLocaleString()} €</TableCell>
                  <TableCell className="font-medium">{achat.montantTotal.toLocaleString()} €</TableCell>
                  <TableCell>
                    <Badge variant={getStatutColor(achat.statut)}>
                      {getStatutLabel(achat.statut)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {achat.dateLivraison ? 
                      new Date(achat.dateLivraison).toLocaleDateString('fr-FR') : 
                      <span className="text-muted-foreground">Non définie</span>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}