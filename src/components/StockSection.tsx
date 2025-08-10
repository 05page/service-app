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
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, TrendingDown, BarChart3 } from "lucide-react";

interface ArticleStock {
  id: string;
  nom: string;
  reference: string;
  categorie: string;
  quantiteStock: number;
  quantiteMinimale: number;
  quantiteMaximale: number;
  prixAchat: number;
  prixVente: number;
  fournisseur: string;
  emplacement: string;
  description: string;
  dateEntree: string;
  statut: "disponible" | "rupture" | "alerte" | "indisponible";
}

export function StockSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategorie, setSelectedCategorie] = useState<string>("tous");
  const [selectedStatut, setSelectedStatut] = useState<string>("tous");

  const articles: ArticleStock[] = [
    {
      id: "1",
      nom: "Licence Office 365 Business",
      reference: "OFF365-BUS-001",
      categorie: "Logiciels",
      quantiteStock: 25,
      quantiteMinimale: 10,
      quantiteMaximale: 50,
      prixAchat: 120,
      prixVente: 180,
      fournisseur: "Microsoft Partner",
      emplacement: "Stock Numérique",
      description: "Licence Office 365 Business Standard pour 1 utilisateur, 1 an",
      dateEntree: "2024-01-15",
      statut: "disponible"
    },
    {
      id: "2",
      nom: "Serveur Cloud VPS",
      reference: "VPS-CLOUD-002",
      categorie: "Hébergement",
      quantiteStock: 5,
      quantiteMinimale: 3,
      quantiteMaximale: 15,
      prixAchat: 80,
      prixVente: 150,
      fournisseur: "CloudTech Solutions",
      emplacement: "Datacenter France",
      description: "Serveur VPS 4 CPU, 8GB RAM, 100GB SSD",
      dateEntree: "2024-01-20",
      statut: "alerte"
    },
    {
      id: "3",
      nom: "Certificat SSL Wildcard",
      reference: "SSL-WILD-003",
      categorie: "Sécurité",
      quantiteStock: 0,
      quantiteMinimale: 2,
      quantiteMaximale: 10,
      prixAchat: 200,
      prixVente: 350,
      fournisseur: "SecureSSL Pro",
      emplacement: "Stock Numérique",
      description: "Certificat SSL Wildcard valide 1 an",
      dateEntree: "2024-01-10",
      statut: "rupture"
    },
    {
      id: "4",
      nom: "Pack Maintenance Site Web",
      reference: "MAINT-WEB-004",
      categorie: "Services",
      quantiteStock: 12,
      quantiteMinimale: 5,
      quantiteMaximale: 20,
      prixAchat: 300,
      prixVente: 500,
      fournisseur: "WebCare Services",
      emplacement: "Service Externe",
      description: "Pack maintenance mensuelle pour site web",
      dateEntree: "2024-01-25",
      statut: "disponible"
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.fournisseur.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategorie = selectedCategorie === "tous" || article.categorie === selectedCategorie;
    const matchesStatut = selectedStatut === "tous" || article.statut === selectedStatut;
    return matchesSearch && matchesCategorie && matchesStatut;
  });

  const totalArticles = articles.length;
  const articlesDisponibles = articles.filter(a => a.statut === "disponible").length;
  const articlesAlerte = articles.filter(a => a.statut === "alerte" || a.statut === "rupture").length;
  const valeurStock = articles.reduce((sum, article) => sum + (article.quantiteStock * article.prixAchat), 0);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "disponible":
        return "default";
      case "alerte":
        return "secondary";
      case "rupture":
        return "destructive";
      case "indisponible":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case "disponible":
        return "Disponible";
      case "alerte":
        return "Alerte";
      case "rupture":
        return "Rupture";
      case "indisponible":
        return "Indisponible";
      default:
        return statut;
    }
  };

  const getStatutFromQuantite = (quantite: number, min: number) => {
    if (quantite === 0) return "rupture";
    if (quantite <= min) return "alerte";
    return "disponible";
  };

  const getProgressValue = (quantite: number, max: number) => {
    return Math.min((quantite / max) * 100, 100);
  };

  const getProgressColor = (statut: string) => {
    switch (statut) {
      case "disponible":
        return "bg-green-500";
      case "alerte":
        return "bg-orange-500";
      case "rupture":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock</h1>
          <p className="text-muted-foreground">Gérez votre inventaire de services et produits</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel article au stock</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de l'article</Label>
                <Input id="nom" placeholder="Nom du produit/service" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Référence</Label>
                <Input id="reference" placeholder="REF-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categorie">Catégorie</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="logiciels">Logiciels</SelectItem>
                    <SelectItem value="hebergement">Hébergement</SelectItem>
                    <SelectItem value="securite">Sécurité</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="materiel">Matériel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fournisseur">Fournisseur</Label>
                <Input id="fournisseur" placeholder="Nom du fournisseur" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantite">Quantité initiale</Label>
                <Input id="quantite" type="number" placeholder="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantiteMin">Quantité minimale</Label>
                <Input id="quantiteMin" type="number" placeholder="5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prixAchat">Prix d'achat (€)</Label>
                <Input id="prixAchat" type="number" placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prixVente">Prix de vente (€)</Label>
                <Input id="prixVente" type="number" placeholder="150" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Description détaillée de l'article" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Annuler</Button>
              <Button>Ajouter à l'inventaire</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArticles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{articlesDisponibles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{articlesAlerte}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{valeurStock.toLocaleString()} €</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire</CardTitle>
          <CardDescription>Suivez vos stocks et gérez les niveaux d'inventaire</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, référence ou fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategorie} onValueChange={setSelectedCategorie}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes les catégories</SelectItem>
                <SelectItem value="Logiciels">Logiciels</SelectItem>
                <SelectItem value="Hébergement">Hébergement</SelectItem>
                <SelectItem value="Sécurité">Sécurité</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatut} onValueChange={setSelectedStatut}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="alerte">Alerte</SelectItem>
                <SelectItem value="rupture">Rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Prix d'achat</TableHead>
                <TableHead>Prix de vente</TableHead>
                <TableHead>Marge</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => {
                const statut = getStatutFromQuantite(article.quantiteStock, article.quantiteMinimale);
                const marge = ((article.prixVente - article.prixAchat) / article.prixAchat * 100).toFixed(1);
                return (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{article.nom}</div>
                        <div className="text-sm text-muted-foreground">{article.reference}</div>
                        <div className="text-xs text-muted-foreground">{article.fournisseur}</div>
                      </div>
                    </TableCell>
                    <TableCell>{article.categorie}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{article.quantiteStock} unités</div>
                        <div className="text-muted-foreground">
                          Min: {article.quantiteMinimale} | Max: {article.quantiteMaximale}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Progress 
                          value={getProgressValue(article.quantiteStock, article.quantiteMaximale)} 
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground">
                          {Math.round((article.quantiteStock / article.quantiteMaximale) * 100)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{article.prixAchat.toLocaleString()} €</TableCell>
                    <TableCell>{article.prixVente.toLocaleString()} €</TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${parseFloat(marge) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        +{marge}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatutColor(statut)}>
                        {getStatutLabel(statut)}
                      </Badge>
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}