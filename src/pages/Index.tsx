import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { Dashboard } from "@/components/Dashboard";
import { DashboardAdmin } from "@/components/DashboardAdmin";
import { DashboardEmployee } from "@/components/DashboardEmployee";
import { DashboardClient } from "@/components/DashboardClient";
import { ClientsSection } from "@/components/ClientsSection";
import { IntermediairesSection } from "@/components/IntermediairesSection";
import { VentesSection } from "@/components/VentesSection";
import { FournisseursSection } from "@/components/FournisseursSection";
import { PersonnelSection } from "@/components/PersonnelSection";
import { AchatsSection } from "@/components/AchatsSection";
import { StockSection } from "@/components/StockSection";
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
      case "employee":
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
        return userRole === "admin" || userRole === "employee" ? <ClientsSection /> : renderDashboard();
      case "intermediaires":
        return userRole === "admin" ? <IntermediairesSection /> : renderDashboard();
      case "ventes":
        return userRole === "admin" || userRole === "employee" ? <VentesSection /> : renderDashboard();
      case "personnel":
        return userRole === "admin" ? <PersonnelSection /> : renderDashboard();
      case "fournisseurs":
        return userRole === "admin" ? <FournisseursSection /> : renderDashboard();
      case "achats":
        return userRole === "admin" ? <AchatsSection /> : renderDashboard();
      case "stock":
        return userRole === "admin" ? <StockSection /> : renderDashboard();
      case "commissions":
        return userRole === "admin" ? (
          <div className="p-8"><h1 className="text-2xl font-bold">Commissions - En cours de développement</h1></div>
        ) : renderDashboard();
      case "settings":
        return <div className="p-8"><h1 className="text-2xl font-bold">Paramètres - En cours de développement</h1></div>;
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
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;