import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, ShoppingCart, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">CommercePro</h1>
            </div>
            <Link to="/auth">
              <Button variant="outline" className="gap-2">
                Se connecter
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Gérez votre activité commerciale
            <span className="block text-primary">en toute simplicité</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Plateforme complète pour acheter, revendre et gérer vos services avec un système de commissions pour vos intermédiaires.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2 px-8 py-4 text-lg">
              Accéder à l'application
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-16 text-foreground">
            Une solution complète pour votre business
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center border-border bg-card">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2 text-card-foreground">Gestion clients</h4>
              <p className="text-sm text-muted-foreground">
                Gérez vos clients, intermédiaires et employés facilement
              </p>
            </Card>

            <Card className="p-6 text-center border-border bg-card">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2 text-card-foreground">Achats & Ventes</h4>
              <p className="text-sm text-muted-foreground">
                Suivez vos achats chez les fournisseurs et vos ventes clients
              </p>
            </Card>

            <Card className="p-6 text-center border-border bg-card">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2 text-card-foreground">Commissions</h4>
              <p className="text-sm text-muted-foreground">
                Système de commissions paramétrable pour vos intermédiaires
              </p>
            </Card>

            <Card className="p-6 text-center border-border bg-card">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2 text-card-foreground">Sécurisé</h4>
              <p className="text-sm text-muted-foreground">
                Accès sécurisé avec différents niveaux de permissions
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-6 text-foreground">
            Prêt à démarrer ?
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            Connectez-vous et découvrez toutes les fonctionnalités
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2 px-8 py-4 text-lg">
              Commencer maintenant
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 CommercePro. Plateforme de gestion commerciale.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;