import { useState, useEffect } from "react";
import api from '../api/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Save,
    Edit,
    RefreshCw
} from "lucide-react";

type UserRole = "admin" | "employe";
type ProfileSectionProps = {
    userRole: UserRole;
};

type UserProfile = {
    id: number;
    fullname: string;
    email: string;
    telephone: string;
    adresse: string;
    role: string;
};

export function ProfileSection({ userRole }: ProfileSectionProps) {

    const [loading, setLoading] = useState(true);
    const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    const getProfile = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                console.error('Token non trouvé');
                return

            }
            console.log(token);

            const response = await api.get('/profil');
            setProfileUser(response.data.data);

        } catch (error) {
            console.error('Erreur survenue lors de la récupération', error)
            if (error.response?.status === 401) {
                console.error('token invalide ou expiré')
                window.location.href = "/auth";
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getProfile();
    }, [])

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await getProfile();
            toast.success('Données actualisées')
        } catch (error) {
            toast.error('Erreur lors de l\'actualisation');
        } finally {
            setRefreshing(false);
        }
    }


    const handleSave = async () => {
        if (!profileUser) return;
        try {
            const response = await api.put('/update/', {
                fullname: profileUser.fullname,
                email: profileUser.email,
                telephone: profileUser.telephone,
                adresse: profileUser.adresse
            });

            const updatedData = response.data.data.user;
            setProfileUser(prev => prev ? { ...prev, ...updatedData } : updatedData);

            setIsEditing(false);

            toast.success('Profil mis à jour avec succès')

        } catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
            toast.error(error.response?.data?.message)
        }
    }

      if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement du profil...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Mon Profil</h1>
                    <p className="text-muted-foreground">Gérer vos informations personnelles</p>
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
                    <Button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className="gap-2"
                    >
                        {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                        {isEditing ? "Enregistrer" : "Modifier"}
                    </Button>
                </div>
            </div>

            <div className="grid- md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Informations générales
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-10 w-10 text-primary" />
                            </div>
                        </div>

                        <div className="text-center mb-4">
                            <h3 className="text-xl font-semibold">
                                {profileUser?.fullname}
                            </h3>
                            {/* <Badge variant={getRoleBadgeVariant()}>
                                {getRoleLabel()}
                            </Badge> */}
                        </div>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullname">Nom complet</Label>
                                <Input
                                    id="fullname"
                                    value={profileUser?.fullname || ""}
                                    // onChange={(e) => setProfile({ ...profile, prenom: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="telephone">Téleponhe</Label>
                                <Input
                                    id="telephone"
                                    value={profileUser?.telephone || ""}
                                    onChange={(e) => setProfileUser(prev => prev ? { ...prev, telephone: e.target.value } : prev)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={profileUser?.email || ""}
                                    onChange={(e) => setProfileUser(prev => prev ? { ...prev, email: e.target.value } : prev)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="adresse">Adresse</Label>
                                <Input
                                    id="adresse"
                                    value={profileUser?.adresse || ""}
                                    onChange={(e) => setProfileUser(prev => prev ? { ...prev, adresse: e.target.value } : prev)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <Input
                                    id="role"
                                    value={profileUser?.role || ""}
                                    // onChange={(e) => setProfile({ ...profile, prenom: e.target.value })}
                                    disabled
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {isEditing && (
                    <Card className="border-dashed">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    N'oubliez pas d'enregistrer vos modifications
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditing(false);
                                        }}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            handleSave()
                                        }}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Enregistrer
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

