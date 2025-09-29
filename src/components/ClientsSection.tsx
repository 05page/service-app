import { useState, useEffect } from "react";
import api from '../api/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  Trash2
} from "lucide-react";
import { toast } from "sonner";

export function ClientsSection() {
  const [refreshing, setRefreshing] = useState(false);
  const [client, setClient] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      } else if (error.response?.status === 403) {
        toast.error('Accès refusé');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nomClient || !numeroClient || !adresseClient) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const response = await api.post('/clients/', {
        nom: nomClient,
        numero: numeroClient,
        adresse: adresseClient,
        email: emailClient || null
      });

      toast.success(response.data.message || 'Client ajouté avec succès');
      resetForm();
      setDialogOpen(false);
      getClient();
      
    } catch (error: any) {
      console.error('Erreur création client:', error.response?.data);
      const message = error.response?.data?.message || "Erreur lors de l'ajout du client";
      toast.error(message);
    }
  };

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

      {/* Clients grid */}
      <div className="grid gap-6">
        {filteredClients && filteredClients.length > 0 ? (
          filteredClients.map((c: any) => (
            <Card key={c.id} className="shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{c?.nom_client}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Client depuis {new Date(c.created_at || Date.now()).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(c)}
                      title="Modifier"
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(c.id)}
                      title="Supprimer"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {c.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{c.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{c.numero}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{c.adresse}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Chiffre d'affaires</span>
                      <span className="font-semibold text-success">{c.prix_total || 0} Fcfa</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Achats</span>
                      <span className="font-semibold">{c.nombre_ventes || 0}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Historique
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-[var(--shadow-card)]">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                {searchTerm ? 'Aucun client trouvé' : 'Aucun client disponible'}
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                {searchTerm 
                  ? `Aucun client ne correspond à votre recherche "${searchTerm}"`
                  : 'Vous n\'avez pas encore de client. Ajoutez votre premier client pour commencer à développer votre portefeuille.'
                }
              </p>

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}