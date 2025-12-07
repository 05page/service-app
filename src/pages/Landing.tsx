import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, ShoppingCart, Package, Shield, Sparkles, Zap, TrendingUp, Truck, CheckCircle, Lock, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="relative border-b bg-background/80 backdrop-blur-md animate-fade-in">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <ShoppingCart className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">EntraLevel</h1>
            </div>
            <Link to="/auth">
              <Button variant="outline" className="gap-2 hover-scale">
                Se connecter
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Nouveau : Gestion de stock intelligente</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Gérez votre activité commerciale
            <span className="block mt-2 bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
              en toute simplicité
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Plateforme complète pour acheter, revendre et gérer vos services avec un système de gestion de stock avancé.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Link to="/auth">
              <Button size="lg" className="gap-2 px-8 py-6 text-lg group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Accéder à l'application
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Entreprises</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h3 className="text-4xl font-bold mb-4 text-foreground">
              Une solution complète pour votre business
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tous les outils dont vous avez besoin pour gérer votre commerce efficacement
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: "Gestion clients",
                description: "Gérez vos clients, intermédiaires et employés facilement",
                delay: "0s",
                gradient: "from-blue-500/10 to-blue-600/10"
              },
              {
                icon: ShoppingCart,
                title: "Achats & Ventes",
                description: "Suivez vos achats chez les fournisseurs et vos ventes clients",
                delay: "0.1s",
                gradient: "from-purple-500/10 to-purple-600/10"
              },
              {
                icon: Package,
                title: "Gestion de stock",
                description: "Gérez votre inventaire et suivez vos stocks en temps réel",
                delay: "0.2s",
                gradient: "from-green-500/10 to-green-600/10"
              },
              {
                icon: Shield,
                title: "Sécurisé",
                description: "Accès sécurisé avec différents niveaux de permissions",
                delay: "0.3s",
                gradient: "from-orange-500/10 to-orange-600/10"
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                className="group p-6 border-border bg-card hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 animate-fade-in cursor-pointer relative overflow-hidden"
                style={{ animationDelay: feature.delay }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2 text-card-foreground text-lg">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Guide d'utilisation</span>
            </div>
            <h3 className="text-4xl font-bold mb-4 text-foreground">
              Comment ça marche ?
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Règles essentielles pour une gestion optimale de votre stock
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Truck,
                step: "1",
                title: "Créer l'achat d'abord",
                description: "Avant d'ajouter un article au stock, vous devez d'abord enregistrer l'achat auprès de votre fournisseur.",
                color: "from-blue-500/20 to-blue-600/20",
                iconBg: "bg-blue-500/10",
                iconColor: "text-blue-600"
              },
              {
                icon: CheckCircle,
                step: "2",
                title: "Vérifier le statut",
                description: "Seuls les achats avec le statut 'Payé' ou 'Reçu' peuvent être ajoutés au stock. Les commandes en attente sont exclues pour plus de sécurité.",
                color: "from-green-500/20 to-green-600/20",
                iconBg: "bg-green-500/10",
                iconColor: "text-green-600"
              },
              {
                icon: Lock,
                step: "3",
                title: "Éviter les doublons",
                description: "Un achat déjà enregistré dans le stock ne peut plus être ajouté une seconde fois pour éviter les erreurs de comptabilité.",
                color: "from-orange-500/20 to-orange-600/20",
                iconBg: "bg-orange-500/10",
                iconColor: "text-orange-600"
              },
              {
                icon: ShieldAlert,
                step: "4",
                title: "Respecter les permissions",
                description: "Les employés ne peuvent effectuer que les tâches pour lesquelles ils ont reçu l'autorisation explicite de l'administrateur.",
                color: "from-red-500/20 to-red-600/20",
                iconBg: "bg-red-500/10",
                iconColor: "text-red-600"
              }
            ].map((step, index) => (
              <Card 
                key={index}
                className="group p-8 border-border bg-card hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 animate-fade-in relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative flex gap-4">
                  <div className="flex-shrink-0">
                    <div className={`h-14 w-14 ${step.iconBg} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                      <step.icon className={`h-7 w-7 ${step.iconColor}`} />
                    </div>
                    <div className="text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${step.iconBg} ${step.iconColor} text-xs font-bold`}>
                        {step.step}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-3 text-card-foreground text-xl">{step.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Performance optimale</span>
              </div>
              <h3 className="text-4xl font-bold text-foreground">
                Augmentez votre productivité de 300%
              </h3>
              <p className="text-lg text-muted-foreground">
                Automatisez vos processus de gestion et concentrez-vous sur la croissance de votre entreprise.
              </p>
              <ul className="space-y-4">
                {[
                  "Tableau de bord intuitif en temps réel",
                  "Rapports automatiques détaillés",
                  "Notifications intelligentes",
                  "Multi-utilisateurs avec permissions"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-8 backdrop-blur-sm border border-primary/10">
                <div className="w-full h-full rounded-xl bg-card/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                      99.9%
                    </div>
                    <div className="text-xl text-muted-foreground">Disponibilité</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-6">
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 animate-fade-in">
            <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]"></div>
            <div className="relative p-12 text-center">
              <h3 className="text-4xl font-bold mb-6 text-foreground">
                Prêt à démarrer ?
              </h3>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Rejoignez des centaines d'entreprises qui font confiance à EntraLevel
              </p>
              <Link to="/auth">
                <Button size="lg" className="gap-2 px-8 py-6 text-lg group hover-scale">
                  Commencer maintenant
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Entralevel. Plateforme de gestion commerciale.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
