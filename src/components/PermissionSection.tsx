import { useState, useEffect } from "react";
import api from '../api/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Shield,
    Search,
    User,
    Save,
    Plus,
    RefreshCw,
    Power,
    PowerOff
} from "lucide-react";
import { toast } from "sonner";

interface Permission {
    id: string;
    user_id: string; // CORRECTION: changer employe_id en user_id
    description: string;
    module: string;
    active: boolean;
    created_at: string;
    employe: {
        id: string;
        fullname: string;
        email: string;
        role: string;
    };
}

interface Employee {
    id: string;
    fullname: string;
    email: string;
    role: string;
}

// Modules disponibles selon votre backend
const availableModules = [
    { value: "fournisseurs", label: "Fournisseurs", description: "Gestion des fournisseurs" },
    { value: "services", label: "Services", description: "Gestion des services" },
    { value: "achats", label: "Achats", description: "Gestion des achats" },
    { value: "stock", label: "Stock", description: "Gestion du stock" },
    { value: "ventes", label: "Ventes", description: "Gestion des ventes" },
    { value: "factures", label: "Factures", description: "Gestion des factures" }
];

export function PermissionsSection() {
    const [searchTerm, setSearchTerm] = useState("");
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    // États du formulaire
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");
    const [selectedModule, setSelectedModule] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    const fetchPermissions = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token non trouvé');
                return;
            }

            const response = await api.get('/admin/showPermissions');
            setPermissions(response.data.data || []);
            
        } catch (error: any) {
            console.error('Erreur récupération permissions:', error);
            if (error.response?.status === 401) {
                toast.error('Token invalide ou expiré. Veuillez vous reconnecter');
            } else if (error.response?.status === 403) {
                toast.error('Accès refusé');
            } else {
                toast.error('Erreur lors du chargement des permissions');
            }
            setPermissions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/admin/showEmploye');
            setEmployees(response.data.data || []);
        } catch (error: any) {
            console.error('Erreur récupération employés:', error);
            toast.error('Erreur lors du chargement des employés');
            setEmployees([]);
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
        
        if (!selectedEmployee || !selectedModule || !description) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        try {
            const response = await api.post('/admin/createPermission', {
                user_id: parseInt(selectedEmployee),
                module: selectedModule,
                description: description
            });

            toast.success(response.data.message || "Permission attribuée avec succès");
            resetForm();
            setDialogOpen(false);
            fetchPermissions();
            
        } catch (error: any) {
            console.error('Erreur création permission:', error.response?.data);
            const message = error.response?.data?.message || "Erreur lors de l'attribution de la permission";
            toast.error(message);
        }
    };

    const handleTogglePermission = async (permissionId: string) => {
        console.log('Toggle permission ID:', permissionId);
        
        try {
            const response = await api.post(`/admin/permission/${permissionId}`);
            console.log('Réponse toggle:', response.data);
            
            toast.success(response.data.message);
            
            // Attendre un peu avant de recharger pour s'assurer que le serveur a bien mis à jour
            await new Promise(resolve => setTimeout(resolve, 300));
            await fetchPermissions();
            
        } catch (error: any) {
            console.error('Erreur toggle permission:', error.response?.data);
            const message = error.response?.data?.message || "Erreur lors du changement de statut";
            toast.error(message);
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

    // Grouper les permissions par employé - CORRECTION
    const groupedPermissions = permissions.reduce((acc, permission) => {
        const employeeId = permission.user_id; // CORRECTION: utiliser user_id au lieu de employe_id
        if (!acc[employeeId]) {
            acc[employeeId] = {
                employee: permission.employe,
                permissions: []
            };
        }
        acc[employeeId].permissions.push(permission);
        return acc;
    }, {} as { [key: string]: { employee: any, permissions: Permission[] } });

    // Debug: logs pour vérifier le groupement et les valeurs de active
    console.log('Permissions brutes:', permissions);
    console.log('Vérification des statuts active:', permissions.map(p => ({
        id: p.id,
        module: p.module,
        active: p.active,
        typeOf: typeof p.active
    })));
    console.log('Groupement par employé:', groupedPermissions);

    // Filtrer par terme de recherche
    const filteredGroupedPermissions = Object.entries(groupedPermissions).filter(([_, data]) => {
        const employee = data.employee;
        return employee.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
               employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                        <p className="text-muted-foreground">Chargement des permissions...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Permissions</h1>
                    <p className="text-muted-foreground">
                        Gérez les permissions de vos employés
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

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Attribuer une permission
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Attribuer une nouvelle permission</DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4 py-2">
                                    <div className="space-y-2">
                                        <Label>Employé *</Label>
                                        {employees && employees.length > 0 ? (
                                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee} required>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choisir un employé" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {employees.map(emp => (
                                                        <SelectItem key={emp.id} value={emp.id.toString()}>
                                                            {emp.fullname} ({emp.email})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Select disabled>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Aucun employé disponible" />
                                                </SelectTrigger>
                                            </Select>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Module *</Label>
                                        <Select value={selectedModule} onValueChange={setSelectedModule} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir un module" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableModules.map(module => (
                                                    <SelectItem key={module.value} value={module.value}>
                                                        {module.label} - {module.description}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description *</Label>
                                        <Textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Décrivez les permissions accordées..."
                                            rows={3}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
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
                                    <Button type="submit">Attribuer</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search */}
            <Card className="shadow-[var(--shadow-card)]">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher un employé..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Permissions list */}
            <div className="grid gap-6">
                {filteredGroupedPermissions && filteredGroupedPermissions.length > 0 ? (
                    filteredGroupedPermissions.map(([employeeId, data]) => (
                        <Card key={employeeId} className="shadow-[var(--shadow-card)]">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{data.employee.fullname}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{data.employee.email}</p>
                                            <Badge variant="outline" className="mt-1">{data.employee.role}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data.permissions.map((permission) => {
                                        // Debug: log pour chaque permission affichée
                                        console.log(`Permission ${permission.id} - Module: ${permission.module} - Active:`, permission.active, typeof permission.active);
                                        
                                        return (
                                            <div
                                                key={permission.id}
                                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="font-medium">
                                                            Module: {permission.module}
                                                        </Label>
                                                        {permission.active && <Shield className="h-4 w-4 text-green-600" />}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {permission.description}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Créé le: {new Date(permission.created_at).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={permission.active ? "default" : "secondary"}>
                                                        {permission.active ? "Active" : "Inactive"}
                                                    </Badge>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleTogglePermission(permission.id)}
                                                        title={permission.active ? "Désactiver" : "Activer"}
                                                        className={`h-8 w-8 p-0 ${
                                                            permission.active 
                                                                ? 'text-orange-600 hover:text-orange-700 hover:border-orange-300'
                                                                : 'text-green-600 hover:text-green-700 hover:border-green-300'
                                                        }`}
                                                    >
                                                        {permission.active ? 
                                                            <PowerOff className="h-3 w-3" /> : 
                                                            <Power className="h-3 w-3" />
                                                        }
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Summary */}
                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-muted-foreground">
                                            Permissions totales: {data.permissions.length} | 
                                            Actives: {data.permissions.filter(p => p.active).length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="shadow-[var(--shadow-card)]">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                                {searchTerm ? 'Aucune permission trouvée' : 'Aucune permission attribuée'}
                            </h3>
                            <p className="text-sm text-muted-foreground text-center mb-6">
                                {searchTerm 
                                    ? `Aucune permission ne correspond à votre recherche "${searchTerm}"`
                                    : 'Aucune permission n\'a encore été attribuée. Commencez par attribuer des permissions à vos employés.'
                                }
                            </p>
                            {!searchTerm && (
                                <Button onClick={() => setDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Attribuer ma première permission
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}