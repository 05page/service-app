import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { Dashboard } from "@/components/Dashboard";
import { DashboardAdmin } from "@/components/DashboardAdmin";
import { DashboardEmployee } from "@/components/DashboardEmployee";
import { DashboardClient } from "@/components/DashboardClient";
import { ClientsSection } from "@/components/ClientsSection";
import { PermissionsSection } from "@/components/PermissionSection";
import { IntermediairesSection } from "@/components/IntermediairesSection";
import { VentesSection } from "@/components/VentesSection";
import { FournisseursSection } from "@/components/FournisseursSection";
import { PersonnelSection } from "@/components/PersonnelSection";
import { AchatsSection } from "@/components/AchatsSection";
import { StockSection } from "@/components/StockSection";
import { ProfileSection } from "@/components/ProfileSection";
import { CommissionsSection } from "@/components/CommissionsSection";
import { CommissionEmployeeSection } from "@/components/CommissionEmployeeSection";
import { MouvementsStockSection } from "@/components/MouvementsStockSection";
import { SettingsSection } from "@/components/SettingsSection";
import { UserRole } from "./Auth";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole | null;
    if (!role) {
      navigate("/auth");
      return;
    }
    setUserRole(role);
  }, [navigate]);

  const renderDashboard = () => {
    switch (userRole) {
      case "admin":
        return <DashboardAdmin />;

      case "employe":
        return <DashboardEmployee />;
      case "client":
        return <DashboardClient />;
      default:
        return <Dashboard />;
    }
  };

  const renderContent = () => {
    // Les clients n'ont accès qu'au dashboard
    if (userRole === "client" && activeSection !== "dashboard") {
      return renderDashboard();
    }

    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "clients":
        return userRole === "admin" || userRole === "employe" ? <ClientsSection /> : renderDashboard();
      case "intermediaires":
        return userRole === "admin" ? <IntermediairesSection /> : renderDashboard();
      case "ventes":
        return userRole === "admin" || userRole === "employe" ? <VentesSection /> : renderDashboard();
      case "personnel":
        return userRole === "admin" ? <PersonnelSection /> : renderDashboard();

      case "permissions":
        return userRole === "admin" ? <PermissionsSection /> : renderDashboard();

      case "fournisseurs":
        return userRole === "admin" ? <FournisseursSection /> : renderDashboard();
      case "achats":
        return userRole === "admin" || userRole === "employe" ? <AchatsSection /> : renderDashboard();
      case "stock":
        return userRole === "admin" || userRole === "employe" ? <StockSection /> : renderDashboard();
      case "mouvements-stock":
        return userRole === "admin" || userRole === "employe" ? <MouvementsStockSection /> : renderDashboard();
      case "commissions":
        if (userRole === "admin") {
          return <CommissionsSection />;
        } else if (userRole === "employe") {
          return <CommissionEmployeeSection />;
        }
        return renderDashboard();
      case "profile":
        return userRole === "admin" || userRole === "employe" ? <ProfileSection userRole={userRole} /> : renderDashboard();
      case "settings":
        return <SettingsSection />;
      default:
        return renderDashboard();
    }
  };

  if (!userRole) {
    return null; // Loading state while checking auth
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userRole={userRole}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader userRole={userRole} />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;