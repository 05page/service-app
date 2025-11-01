import { useState, useEffect } from "react";
import api from '../api/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Plus, Shield, User, CheckCircle, XCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "@/hooks/usePagination";

interface Permission {
  id: number;
  user_id: number;
  description: string;
  module: string;
  active: boolean;
  fullname?: string;
  email?: string;
  role?: string;
}

interface Employee {
  id: number;
  fullname: string;
  email: string;
  role: string;
}

const availableModules = [
  { value: "clients", label: "Clients", description: "Gestion des clients" },
  { value: "ventes", label: "Ventes", description: "Gestion des ventes" },
  { value: "stock", label: "Stock", description: "Gestion du stock" },
  { value: "achats", label: "Achats", description: "Gestion des achats" },
  { value: "fournisseurs", label: "Fournisseurs", description: "Gestion des fournisseurs" },
  { value: "commissions", label: "Commissions", description: "Consultation des commissions" }
];

export function SettingsSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [description, setDescription] = useState("");

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions/');
      setPermissions(response.data.data || []);
    } catch (error: any) {
      console.error('Erreur récupération permissions:', error);
      toast.error('Erreur lors du chargement des autorisations');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/admin/showEmploye');
      setEmployees(response.data.data || []);
    } catch (error: any) {
      console.error('Erreur récupération employés:', error);
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchPermissions(), fetchEmployees()]);
      toast.success('Données actualisées');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !selectedModule) {
      toast.error('Veuillez sélectionner un employé et un module');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.post('/permissions/', {
        user_id: parseInt(selectedEmployee),
        module: selectedModule,
        description: description || `Accès au module ${selectedModule}`
      });
      toast.success(response.data.message || 'Autorisation créée avec succès');
      setDialogOpen(false);
      resetForm();
      fetchPermissions();
    } catch (error: any) {
      console.error('Erreur création autorisation:', error.response?.data);
      toast.error(error.response?.data?.message || "Erreur lors de la création");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePermission = async (permissionId: number, currentStatus: boolean) => {
    try {
      await api.put(`/permissions/${permissionId}`, {
        active: !currentStatus
      });
      toast.success(`Autorisation ${!currentStatus ? 'activée' : 'désactivée'}`);
      fetchPermissions();
    } catch (error: any) {
      console.error('Erreur toggle permission:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const resetForm = () => {
    setSelectedEmployee("");
    setSelectedModule("");
    setDescription("");
  };

  useEffect(() => {
    fetchPermissions();
    fetchEmployees();
  }, []);

  const groupedPermissions = permissions.reduce((acc: any, permission) => {
    if (!acc[permission.user_id]) {
      acc[permission.user_id] = {
        user: {
          id: permission.user_id,
          fullname: permission.fullname,
          email: permission.email,
          role: permission.role
        },
        permissions: []
      };
    }
    acc[permission.user_id].permissions.push(permission);
    return acc;
  }, {});

  const filteredGroupedPermissions = Object.values(groupedPermissions).filter((group: any) => {
    if (!searchTerm) return true;
    return (
      group.user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const {
    currentData: paginatedPermissions,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    goToPage
  } = usePagination({ data: filteredGroupedPermissions, itemsPerPage: 6 });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement des autorisations...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Gérez les autorisations d'accès aux modules</p>
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Attribuer une autorisation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nouvelle autorisation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employé *</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.fullname} ({emp.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="module">Module *</Label>
                  <Select value={selectedModule} onValueChange={setSelectedModule} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un module" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModules.map((mod) => (
                        <SelectItem key={mod.value} value={mod.value}>
                          {mod.label} - {mod.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description de l'autorisation..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                        Attribution...
                      </span>
                    ) : (
                      "Attribuer"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="autorisations" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-1">
          <TabsTrigger value="autorisations">
            <Shield className="mr-2 h-4 w-4" />
            Autorisations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="autorisations" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {paginatedPermissions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune autorisation</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Commencez par attribuer des autorisations à vos employés
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedPermissions.map((group: any) => (
                <Card key={group.user.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{group.user.fullname}</CardTitle>
                          <CardDescription className="text-sm">
                            {group.user.email}
                          </CardDescription>
                          <Badge variant="outline" className="mt-1">
                            {group.user.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-2">
                      {group.permissions.map((perm: Permission) => (
                        <div
                          key={perm.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium text-sm">{perm.module}</p>
                              <p className="text-xs text-muted-foreground">
                                {perm.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {perm.active ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <Switch
                              checked={perm.active}
                              onCheckedChange={() =>
                                handleTogglePermission(perm.id, perm.active)
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
