import { useState } from "react";
import api from '../api/api';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ActivateAccount = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code) {
      toast.error("Veuillez entrer le code d'activation");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/activate-account', {
        activationCode: code
      });

      toast.success(response.data.message || "Compte activé avec succès !");
      
      // Rediriger vers la page de connexion après quelques secondes
      setTimeout(() => {
        navigate('/auth');
      }, 2000);

    } catch (error: any) {
      console.log("Erreur d'activation:", error.response);
      const msg = error?.response?.data?.message || "Erreur lors de l'activation du compte";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/auth" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Activation du compte</h1>
          <p className="text-muted-foreground mt-2">
            Entrez le code d'activation reçu par email
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Activer votre compte</CardTitle>
            <CardDescription>
              Un code d'activation a été envoyé à votre adresse email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleActivation} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">Code d'activation</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Entrez le code reçu"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                  required
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  Le code contient 6 caractères
                </p>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <CheckCircle2 className="h-4 w-4" />
                {loading ? "Activation en cours..." : "Activer le compte"}
              </Button>
            </form>

            <div className="mt-4 p-3 bg-accent/30 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Astuce :</strong> Vérifiez vos spams si vous ne trouvez pas l'email
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivateAccount;