import api from "../api/api"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type UserRole = "admin" | "employe" | "client";

type AppHeaderProps = {
  userRole: UserRole;
};

export function AppHeader({ userRole }: AppHeaderProps) {
  const navigate = useNavigate();

  // Récupérer le nom d'utilisateur du localStorage ou utiliser un nom par défaut
  const getUserName = () => {
    const storedName = localStorage.getItem("userName");
    // console.log(storedName)
    if (storedName) return storedName;

    switch (userRole) {
      case "admin":
        return "Administrateur";
      case "employe":
        return "Employé";
      case "client":
        return "Client";
      default:
        return "Utilisateur";
    }
  };

  const getRoleBadgeVariant = () => {
    switch (userRole) {
      case "admin":
        return "default";
      case "employe":
        return "secondary";
      case "client":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case "admin":
        return "Administrateur";
      case "employe":
        return "Employé";
      case "client":
        return "Client";
      default:
        return "Utilisateur";
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error('Token non trouvé');
        return;
      }

      const response = await api.post('/logout')
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      toast.success(response.data.data || "Déconnexion réussie")
      navigate("/auth"); // redirige vers la page de connexion
    } catch (error) {
      console.error("Erreur lors du logout", error);
      toast.error(error.response?.data?.message || "Erreur de déconnexion")
    }
  };


  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-card-foreground">{getUserName()}</h2>
            <Badge variant={getRoleBadgeVariant()} className="text-xs">
              {getRoleLabel()}
            </Badge>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </header>
  );
}