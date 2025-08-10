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
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react";

interface Fournisseur {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  statut: "actif" | "inactif";
  typeServices: string;
  dateCreation: string;
  totalCommandes: number;
  montantTotal: number;
}

export function FournisseursSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState<string>("tous");

  const fournisseurs: Fournisseur[] = [
    {
      id: "1",
      nom: "TechServices Pro",
      email: "contact@techservices.com",
      telephone: "+33 1 23 45 67 89",
      adresse: "15 rue de la Tech, 75001 Paris",
      statut: "actif",
      typeServices: "Services Informatiques",
      dateCreation: "2024-01-15",
      totalCommandes: 25,
      montantTotal: 45000
    },
    {
      id: "2",
      nom: "Marketing Solutions",
      email: "info@marketingsol.com",
      telephone: "+33 1 98 76 54 32",
      adresse: "8 avenue Marketing, 69000 Lyon",
      statut: "actif",
      typeServices: "Marketing Digital",
      dateCreation: "2024-02-10",
      totalCommandes: 18,
      montantTotal: 32000
    },
    {
      id: "3",
      nom: "Design Studio",
      email: "hello@designstudio.com",
      telephone: "+33 4 56 78 90 12",
      adresse: "22 boulevard Design, 13000 Marseille",
      statut: "inactif",
      typeServices: "Design Graphique",
      dateCreation: "2023-11-20",
      totalCommandes: 12,
      montantTotal: 18000
    }
  ];

  const filteredFournisseurs = fournisseurs.filter(fournisseur => {
    const matchesSearch = fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fournisseur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fournisseur.typeServices.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = selectedStatut === "tous" || fournisseur.statut === selectedStatut;
    return matchesSearch && matchesStatut;
  });

  const totalFournisseurs = fournisseurs.length;
  const fournisseursActifs = fournisseurs.filter(f => f.statut === "actif").length;
  const montantTotalAchats = fournisseurs.reduce((sum, f) => sum + f.montantTotal, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fournisseurs</h1>
          <p className="text-muted-foreground">Gérez vos fournisseurs de services</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Fournisseur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau fournisseur</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de l'entreprise</Label>
                <Input id="nom" placeholder="Nom du fournisseur" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="contact@fournisseur.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" placeholder="+33 1 23 45 67 89" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="typeServices">Type de services</Label>
                <Input id="typeServices" placeholder="Ex: Services Informatiques" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Textarea id="adresse" placeholder="Adresse complète" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Annuler</Button>
              <Button>Ajouter</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fournisseurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFournisseurs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fournisseursActifs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Achats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{montantTotalAchats.toLocaleString()} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes ce mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des fournisseurs</CardTitle>
          <CardDescription>Recherchez et filtrez vos fournisseurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, email ou type de service..."
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
                <SelectItem value="actif">Actifs</SelectItem>
                <SelectItem value="inactif">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Type de services</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>Montant total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFournisseurs.map((fournisseur) => (
                <TableRow key={fournisseur.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{fournisseur.nom}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {fournisseur.adresse}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        {fournisseur.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1" />
                        {fournisseur.telephone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{fournisseur.typeServices}</TableCell>
                  <TableCell>
                    <Badge variant={fournisseur.statut === "actif" ? "default" : "secondary"}>
                      {fournisseur.statut}
                    </Badge>
                  </TableCell>
                  <TableCell>{fournisseur.totalCommandes}</TableCell>
                  <TableCell>{fournisseur.montantTotal.toLocaleString()} €</TableCell>
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