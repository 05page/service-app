import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Dashboard } from "@/components/Dashboard";
import { ClientsSection } from "@/components/ClientsSection";
import { IntermediairesSection } from "@/components/IntermediairesSection";
import { VentesSection } from "@/components/VentesSection";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "clients":
        return <ClientsSection />;
      case "intermediaires":
        return <IntermediairesSection />;
      case "ventes":
        return <VentesSection />;
      case "personnel":
        return <div className="p-8"><h1 className="text-2xl font-bold">Personnel - En cours de développement</h1></div>;
      case "fournisseurs":
        return <div className="p-8"><h1 className="text-2xl font-bold">Fournisseurs - En cours de développement</h1></div>;
      case "achats":
        return <div className="p-8"><h1 className="text-2xl font-bold">Achats - En cours de développement</h1></div>;
      case "stock":
        return <div className="p-8"><h1 className="text-2xl font-bold">Stock - En cours de développement</h1></div>;
      case "commissions":
        return <div className="p-8"><h1 className="text-2xl font-bold">Commissions - En cours de développement</h1></div>;
      case "settings":
        return <div className="p-8"><h1 className="text-2xl font-bold">Paramètres - En cours de développement</h1></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
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