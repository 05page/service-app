import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Edit, Trash2, Phone, Mail, User, Calendar } from "lucide-react";

interface Employe {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  departement: string;
  statut: "actif" | "inactif" | "conge";
  dateEmbauche: string;
  salaire: number;
  ventesRealisees: number;
  objectifMensuel: number;
}

export function PersonnelSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartement, setSelectedDepartement] = useState<string>("tous");

  const employes: Employe[] = [
    {
      id: "1",
      nom: "Martin",
      prenom: "Jean",
      email: "jean.martin@entreprise.com",
      telephone: "+33 1 23 45 67 89",
      poste: "Commercial Senior",
      departement: "Ventes",
      statut: "actif",
      dateEmbauche: "2023-03-15",
      salaire: 3500,
      ventesRealisees: 15,
      objectifMensuel: 20
    },
    {
      id: "2",
      nom: "Dubois",
      prenom: "Marie",
      email: "marie.dubois@entreprise.com",
      telephone: "+33 1 98 76 54 32",
      poste: "Responsable Marketing",
      departement: "Marketing",
      statut: "actif",
      dateEmbauche: "2022-11-20",
      salaire: 4200,
      ventesRealisees: 22,
      objectifMensuel: 25
    },
    {
      id: "3",
      nom: "Bernard",
      prenom: "Pierre",
      email: "pierre.bernard@entreprise.com",
      telephone: "+33 4 56 78 90 12",
      poste: "Technicien Support",
      departement: "Technique",
      statut: "conge",
      dateEmbauche: "2023-07-10",
      salaire: 2800,
      ventesRealisees: 8,
      objectifMensuel: 12
    }
  ];

  const filteredEmployes = employes.filter(employe => {
    const matchesSearch = `${employe.prenom} ${employe.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employe.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employe.poste.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartement = selectedDepartement === "tous" || employe.departement === selectedDepartement;
    return matchesSearch && matchesDepartement;
  });

  const totalEmployes = employes.length;
  const employesActifs = employes.filter(e => e.statut === "actif").length;
  const moyenneSalaire = Math.round(employes.reduce((sum, e) => sum + e.salaire, 0) / employes.length);
  const totalVentes = employes.reduce((sum, e) => sum + e.ventesRealisees, 0);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "actif":
        return "default";
      case "conge":
        return "secondary";
      case "inactif":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personnel</h1>
          <p className="text-muted-foreground">Gérez votre équipe et leurs performances</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Employé
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel employé</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" placeholder="Prénom" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" placeholder="Nom" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@entreprise.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" placeholder="+33 1 23 45 67 89" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poste">Poste</Label>
                <Input id="poste" placeholder="Ex: Commercial Senior" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departement">Département</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ventes">Ventes</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="technique">Technique</SelectItem>
                    <SelectItem value="administration">Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaire">Salaire (€)</Label>
                <Input id="salaire" type="number" placeholder="3000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="objectif">Objectif mensuel</Label>
                <Input id="objectif" type="number" placeholder="20" />
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
            <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employés Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{employesActifs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salaire Moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moyenneSalaire.toLocaleString()} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes ce mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVentes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des employés</CardTitle>
          <CardDescription>Gérez votre équipe et suivez leurs performances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom, email ou poste..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedDepartement} onValueChange={setSelectedDepartement}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les départements</SelectItem>
                <SelectItem value="Ventes">Ventes</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Technique">Technique</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employé</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Salaire</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployes.map((employe) => (
                <TableRow key={employe.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>{getInitials(employe.prenom, employe.nom)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employe.prenom} {employe.nom}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Depuis {new Date(employe.dateEmbauche).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        {employe.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1" />
                        {employe.telephone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{employe.poste}</div>
                      <div className="text-sm text-muted-foreground">{employe.departement}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatutColor(employe.statut)}>
                      {employe.statut}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{employe.ventesRealisees} / {employe.objectifMensuel} ventes</div>
                      <div className="text-muted-foreground">
                        {Math.round((employe.ventesRealisees / employe.objectifMensuel) * 100)}% de l'objectif
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employe.salaire.toLocaleString()} €</TableCell>
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