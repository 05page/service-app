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
    RefreshCw,
    Lock,
    Eye,
    EyeOff
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
    const [isSubmitting, setIsSubmitting] = useState(false)

    // États pour le changement de mot de passe
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

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
        setIsSubmitting(true);
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
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChangePassword = async () => {
        // Validation côté client
        if (!passwordData.current_password || !passwordData.password || !passwordData.password_confirmation) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        if (passwordData.password !== passwordData.password_confirmation) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        if (passwordData.password.length < 8) {
            toast.error('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        setPasswordLoading(true);
        setIsSubmitting(true);
        try {
            const response = await api.post('/password/reset', passwordData);

            if (response.data.success) {
                toast.success(response.data.message || 'Mot de passe modifié avec succès');

                // Réinitialiser le formulaire
                setPasswordData({
                    current_password: '',
                    password: '',
                    password_confirmation: ''
                });
                setIsChangingPassword(false);
            }
        } catch (error) {
            console.error('Erreur lors du changement de mot de passe:', error);

            if (error.response?.data?.errors) {
                // Afficher les erreurs de validation
                const errors = error.response.data.errors;
                Object.values(errors).flat().forEach((err: string) => {
                    toast.error(err);
                });
            } else {
                toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
            }
        } finally {
            setPasswordLoading(false);
            setIsSubmitting(false)
        }
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

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

            <div className="grid md:grid-cols-2 gap-6">
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
                        </div>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullname">Nom complet</Label>
                                <Input
                                    id="fullname"
                                    value={profileUser?.fullname || ""}
                                    onChange={(e) => setProfileUser(prev => prev ? { ...prev, fullname: e.target.value } : prev)}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="telephone">Téléphone</Label>
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
                                <Label htmlFor="role">Rôle</Label>
                                <Input
                                    id="role"
                                    value={profileUser?.role || ""}
                                    disabled
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            Sécurité
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {!isChangingPassword ? (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Modifiez votre mot de passe pour sécuriser votre compte
                                </p>
                                <Button
                                    onClick={() => setIsChangingPassword(true)}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Changer le mot de passe
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">Mot de passe actuel</Label>
                                    <div className="relative">
                                        <Input
                                            id="current_password"
                                            type={showPasswords.current ? "text" : "password"}
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                                            placeholder="Entrez votre mot de passe actuel"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                            onClick={() => togglePasswordVisibility('current')}
                                        >
                                            {showPasswords.current ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="new_password">Nouveau mot de passe</Label>
                                    <div className="relative">
                                        <Input
                                            id="new_password"
                                            type={showPasswords.new ? "text" : "password"}
                                            value={passwordData.password}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                                            placeholder="Entrez votre nouveau mot de passe"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                            onClick={() => togglePasswordVisibility('new')}
                                        >
                                            {showPasswords.new ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Min. 8 caractères avec majuscules, minuscules, chiffres et symboles
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirm_password"
                                            type={showPasswords.confirm ? "text" : "password"}
                                            value={passwordData.password_confirmation}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                                            placeholder="Confirmez votre nouveau mot de passe"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                        >
                                            {showPasswords.confirm ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setPasswordData({
                                                current_password: '',
                                                password: '',
                                                password_confirmation: ''
                                            });
                                        }}
                                        disabled={passwordLoading}
                                        className="flex-1"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        onClick={handleChangePassword}
                                        disabled={passwordLoading}
                                        className="flex-1"
                                    >
                                        {passwordLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Modification...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Modifier
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

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
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center">
                                            <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                                            Mise à jour...
                                        </span>
                                    ):(    
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Enregistrer
                                    </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}