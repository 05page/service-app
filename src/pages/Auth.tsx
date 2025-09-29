import { useState, useEffect } from "react";
import api from '../api/api'
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ShieldCheck, User, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export type UserRole = "admin" | "employe" | "client";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !role) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    try {
      const response = await api.post('/login', { email, role, password });
      const token = response.data.data?.token
      const user = response.data.data?.user;

        localStorage.setItem("token", token);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userName", user.fullname);
        localStorage.setItem("userEmail", user.email);

        toast.success(response.data.message || "Connexion réussie")
        console.log("Navigation vers dashboard")
        navigate('/dashboard')

    } catch (error: any) {
      console.log("Erreur complète:", error.response);
      console.log(error); // ← toujours vérifier dans la console ce qui remonte
      const msg = error?.response?.data?.message || "Erreur lors de la connexion";
      setMessage(msg);
      toast.error(msg);
    }

    // // Simulation de connexion
    // localStorage.setItem("userRole", role);
    // localStorage.setItem("userEmail", email);
    // toast.success(`Connexion réussie en tant que ${getRoleLabel(role as UserRole)}`);
    // navigate("/dashboard");
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "employe":
        return "Employé";
      case "client":
        return "Client";
      default:
        return "";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <ShieldCheck className="h-4 w-4" />;
      case "employe":
        return <Users className="h-4 w-4" />;
      case "client":
        return <User className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Connexion</h1>
          <p className="text-muted-foreground mt-2">
            Connectez-vous à votre compte CommercePro
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Se connecter</CardTitle>
            <CardDescription>
              Entrez vos identifiants et sélectionnez votre rôle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select value={role} onValueChange={(value) => setRole(value as UserRole)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Administrateur
                      </div>
                    </SelectItem>
                    <SelectItem value="employe">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Employé
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full gap-2">
                {role && getRoleIcon(role)}
                Se connecter
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Accès selon le rôle :</p>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>Admin</strong> : Accès complet</li>
                  <li>• <strong>Employé</strong> : Gestion clients et ventes</li>
                  <li>• <strong>Client</strong> : Consultation commandes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;