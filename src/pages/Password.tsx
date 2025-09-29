import { useState } from "react";
import api from '../api/api';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const CreatePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Récupérer le token ou l'email depuis l'URL si disponible
//   const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  // Validation du mot de passe
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(req => req);
  const doPasswordsMatch = password === confirmPassword && password !== "";

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Le mot de passe ne respecte pas les critères requis");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/create-password', {
        email,
        // token,
        password,
        confirmPassword
      });

      toast.success(response.data.message || "Mot de passe créé avec succès !");
      
      // Rediriger vers la page de connexion
      setTimeout(() => {
        navigate('/auth');
      }, 2000);

    } catch (error: any) {
      console.log("Erreur création mot de passe:", error.response);
      const msg = error?.response?.data?.message || "Erreur lors de la création du mot de passe";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={`text-xs ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
        {text}
      </span>
    </div>
  );

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
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Créer un mot de passe</h1>
          <p className="text-muted-foreground mt-2">
            Définissez un mot de passe sécurisé pour votre compte
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Nouveau mot de passe</CardTitle>
            <CardDescription>
              Choisissez un mot de passe fort pour sécuriser votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePassword} className="space-y-6">
              {email && (
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Email : <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Exigences du mot de passe */}
              {password && (
                <div className="p-4 bg-accent/30 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Exigences du mot de passe :
                  </p>
                  <RequirementItem met={passwordRequirements.minLength} text="Au moins 8 caractères" />
                  <RequirementItem met={passwordRequirements.hasUpperCase} text="Une lettre majuscule" />
                  <RequirementItem met={passwordRequirements.hasLowerCase} text="Une lettre minuscule" />
                  <RequirementItem met={passwordRequirements.hasNumber} text="Un chiffre" />
                  <RequirementItem met={passwordRequirements.hasSpecialChar} text="Un caractère spécial (!@#$%...)" />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="flex items-center gap-2 mt-1">
                    {doPasswordsMatch ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-600">Les mots de passe correspondent</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600">Les mots de passe ne correspondent pas</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={loading || !isPasswordValid || !doPasswordsMatch}
              >
                <Lock className="h-4 w-4" />
                {loading ? "Création en cours..." : "Créer le mot de passe"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="p-3 bg-accent/30 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  🔒 <strong>Sécurité :</strong> Votre mot de passe sera chiffré et stocké en toute sécurité
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePassword;