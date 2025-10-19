import { useState, useEffect } from "react";
import api from "../api/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PackagePlus, 
  PackageMinus, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Package 
} from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "./Pagination";

export function MouvementsStockSection() {
  const [mouvements, setMouvements] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("tous");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMouvements = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token non trouvé");
        return;
      }

      // Récupérer les mouvements de stock
      const response = await api.get('/stock/mouvements');
      setMouvements(response.data.data || []);

    } catch (error: any) {
      console.error('Erreur lors de la récupération des mouvements', error);
      if (error.response?.status === 401) {
        toast.error('Token invalide ou expiré. Veuillez vous reconnecter');
        window.location.href = '/auth';
      } else {
        toast.error('Erreur lors du chargement des mouvements');
      }
      setMouvements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchMouvements();
      toast.success('Données actualisées');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMouvements();
  }, []);

  // Filtrage
  const filteredMouvements = mouvements.filter((m: any) => {
    const matchSearch = searchTerm === "" ||
      m.stock?.achat?.nom_service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.stock?.code_produit?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === "tous" || m.type_mouvement === selectedType;
    return matchSearch && matchType;
  });

  const { currentPage, totalPages, currentData: currentMouvements, setCurrentPage } =
    usePagination({ data: filteredMouvements, itemsPerPage: 10 });

  // Calculer les stats
  const totalEntrees = mouvements.filter((m: any) => 
    m.type_mouvement === 'achat' || m.type_mouvement === 'renouvellement'
  ).reduce((acc: number, m: any) => acc + parseInt(m.quantite || 0), 0);

  const totalSorties = mouvements.filter((m: any) => 
    m.type_mouvement === 'vente'
  ).reduce((acc: number, m: any) => acc + parseInt(m.quantite || 0), 0);

  const getTypeBadge = (type: string) => {
    const types = {
      achat: { label: "Achat", variant: "default" as const, icon: PackagePlus, color: "text-blue-600" },
      vente: { label: "Vente", variant: "destructive" as const, icon: PackageMinus, color: "text-red-600" },
      renouvellement: { label: "Renouvellement", variant: "secondary" as const, icon: RefreshCw, color: "text-green-600" }
    };
    return types[type] || { label: type, variant: "outline" as const, icon: Package, color: "text-gray-600" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement des mouvements...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mouvements de Stock</h1>
          <p className="text-muted-foreground">Suivi des entrées et sorties d'inventaire</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entrées</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalEntrees}
            </div>
            <p className="text-xs text-muted-foreground">
              Articles ajoutés au stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sorties</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalSorties}
            </div>
            <p className="text-xs text-muted-foreground">
              Articles vendus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mouvements Totaux</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mouvements.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Toutes opérations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Mouvements</CardTitle>
          <CardDescription>Détails des entrées et sorties de stock</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Rechercher un article..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-10" 
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="achat">Achat</SelectItem>
                <SelectItem value="vente">Vente</SelectItem>
                <SelectItem value="renouvellement">Renouvellement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Article</TableHead>
                <TableHead>Code Produit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentMouvements && currentMouvements.length > 0 ? (
                currentMouvements.map((mouvement: any) => {
                  const typeInfo = getTypeBadge(mouvement.type_mouvement);
                  const Icon = typeInfo.icon;
                  
                  return (
                    <TableRow key={mouvement.id}>
                      <TableCell>
                        {new Date(mouvement.created_at).toLocaleDateString('fr-FR')}
                        <div className="text-xs text-muted-foreground">
                          {new Date(mouvement.created_at).toLocaleTimeString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {mouvement.stock?.achat?.nom_service || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {mouvement.stock?.code_produit || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeInfo.variant} className="flex items-center gap-1 w-fit">
                          <Icon className="h-3 w-3" />
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${typeInfo.color}`}>
                          {mouvement.type_mouvement === 'vente' ? '-' : '+'}{mouvement.quantite}
                        </span>
                      </TableCell>
                      <TableCell>
                        {mouvement.reference || '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {mouvement.notes || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Package className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      Aucun mouvement disponible
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Aucun mouvement de stock enregistré
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
