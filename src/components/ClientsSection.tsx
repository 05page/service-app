import { useState, useEffect } from "react";
import api from '../api/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  User,
  RefreshCw,
  Edit,
  Trash2,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";

// Import du hook et composant de pagination
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "../components/Pagination";

export function ClientsSection() {
  const [refreshing, setRefreshing] = useState(false);
  const [client, setClient] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  // États du formulaire
  const [nomClient, setNomClient] = useState("");
  const [numeroClient, setNumeroClient] = useState("");
  const [adresseClient, setAdresseClient] = useState("");
  const [emailClient, setEmailClient] = useState("");

  const getClient = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token non trouvé');
        return;
      }
      
      const response = await api.get('/ventes/client');
      setClient(response.data.data || []);

    } catch (error: any) {
      console.log('Erreur de récupération', error);
      if (error.response?.status === 401) {
        toast.error('Token invalide ou expiré. Veuillez vous reconnecter');
      } else {
        toast.error('Erreur lors du chargement des clients');
      }
      setClient([]);
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await getClient();
      toast.success('Données actualisées');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  }

  const handleEdit = (clientItem: any) => {
    setSelectedClient(clientItem);
    setNomClient(clientItem.nom_client || "");
    setNumeroClient(clientItem.numero || "");
    setAdresseClient(clientItem.adresse || "");
    setEmailClient(clientItem.email || "");
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) return;
    
    if (!nomClient || !numeroClient || !adresseClient) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const response = await api.put(`/clients/${selectedClient.id}`, {
        nom: nomClient,
        numero: numeroClient,
        adresse: adresseClient,
        email: emailClient || null
      });

      toast.success(response.data.message || 'Client mis à jour avec succès');
      resetForm();
      setSelectedClient(null);
      setEditDialogOpen(false);
      getClient();
      
    } catch (error: any) {
      console.error('Erreur mise à jour client:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de la mise à jour du client";
      toast.error(message);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      return;
    }

    try {
      const response = await api.delete(`/clients/${clientId}`);
      toast.success(response.data.message || 'Client supprimé avec succès');
      getClient();
    } catch (error: any) {
      console.error('Erreur suppression client:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de la suppression du client";
      toast.error(message);
    }
  };

  const resetForm = () => {
    setNomClient("");
    setNumeroClient("");
    setAdresseClient("");
    setEmailClient("");
  };

  useEffect(() => {
    getClient();
  }, []);

  // Filtrer les clients selon le terme de recherche
  const filteredClients = client.filter((c: any) => 
    c.nom_client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.numero?.includes(searchTerm) ||
    c.adresse?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Utilisation du hook de pagination sur les clients filtrés
  const {
    currentPage,
    totalPages,
    currentData: currentClients,
    setCurrentPage
  } = usePagination({ data: filteredClients, itemsPerPage: 4 });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement des clients...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Clients</h1>
          <p className="text-muted-foreground">
            Gérez votre portefeuille client
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtres</Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients list */}
      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Liste des clients ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredClients && filteredClients.length > 0 ? (
              <>
                {currentClients.map((c: any) => (
                  <div 
                    key={c.id} 
                    className="border rounded-lg p-4 hover:shadow-md hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Avatar et infos principales */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center ring-2 ring-primary/10">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                            {c?.nom_client}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Client depuis {new Date(c.created_at || Date.now()).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Stats rapides */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Chiffre d'affaires</p>
                          <p className="font-bold text-success text-sm">{c.montant_verse || 0} Fcfa</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Achats</p>
                          <p className="font-bold text-sm">{c.nombre_ventes || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Coordonnées */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-3 border-t">
                      {c.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <span className="truncate">{c.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span>{c.numero}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="truncate">{c.adresse}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Composant de pagination réutilisable */}
                <div className="pt-2">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredClients.length}
                    itemsPerPage={4}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  {searchTerm ? 'Aucun client trouvé' : 'Aucun client disponible'}
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {searchTerm 
                    ? `Aucun client ne correspond à votre recherche "${searchTerm}"`
                    : 'Vous n\'avez pas encore de client.'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}