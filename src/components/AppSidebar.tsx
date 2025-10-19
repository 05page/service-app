import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Shield,
  Building2, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  Wallet,
  Settings,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: "admin" | "employe" | "client";
}


export function AppSidebar({ activeSection, onSectionChange, userRole }: SidebarProps) {
  const getMenuItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    ];

    if (userRole === "admin") {
      return [
        ...baseItems,
        { id: "clients", label: "Clients", icon: Users },
        // { id: "intermediaires", label: "Intermédiaires", icon: UserCheck },
        { id: "ventes", label: "Ventes", icon: ShoppingCart },
        { id: "personnel", label: "Personnel", icon: Building2 },
        { id: "permissions", label: "Permissions", icon: Shield },
        { id: "fournisseurs", label: "Fournisseurs", icon: Package },
        { id: "achats", label: "Achats", icon: TrendingUp },
        { id: "stock", label: "Stock", icon: Package },
        { id: "profile", label: "Mon Profil", icon: User },
        { id: "commissions", label: "Commissions", icon: Wallet },
        // { id: "settings", label: "Paramètres", icon: Settings },
      ];
    }

    if (userRole === "employe") {
      return [
        ...baseItems,
        { id: "clients", label: "Clients", icon: Users },
        { id: "ventes", label: "Ventes", icon: ShoppingCart },
        { id: "achats", label: "Achats", icon: TrendingUp },
        { id: "stock", label: "Stock", icon: Package },
        { id: "commissions", label: "Mes Commissions", icon: Wallet },
        { id: "profile", label: "Mon Profil", icon: User },
      ];
    }

    // Client role - only dashboard and settings
    return [
      ...baseItems,
      { id: "settings", label: "Paramètres", icon: Settings },
    ];
  };

  const currentMenuItems = getMenuItems();
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">
          CommercePro
        </h1>
        <p className="text-sm text-sidebar-foreground/70 mt-1">
          Gestion commerciale
        </p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {currentMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-11 px-4",
                activeSection === item.id 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}