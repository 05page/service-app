import { useState, useEffect } from "react";
import api from '../api/api';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Send, CheckCircle2, Lock, Eye, EyeOff, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pour la réinitialisation du mot de passe
  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation du mot de passe
  const passwordRequirements = {
    minLength: newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasLowerCase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(req => req);
  const doPasswordsMatch = newPassword === confirmPassword && newPassword !== "";

  // Vérifier si on est en mode réinitialisation (token présent)
  const isResetMode = !!token && !!emailFromUrl;

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Veuillez entrer votre email");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/password/forgot', {
        email
      });

      if (response.data.success) {
        setEmailSent(true);
        toast.success(response.data.message || "Email de réinitialisation envoyé avec succès !");
      }

    } catch (error: any) {
      console.log("Erreur mot de passe oublié:", error.response);
      
      if (error?.response?.status === 403) {
        toast.error("Ce compte est désactivé");
      } else if (error?.response?.status === 422) {
        const errors = error?.response?.data?.errors;
        if (errors?.email) {
          toast.error(errors.email[0]);
        } else {
          toast.error(error?.response?.data?.message || "Email invalide");
        }
      } else {
        const msg = error?.response?.data?.message || "Erreur lors de l'envoi de l'email";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Le mot de passe ne respecte pas les critères requis");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/password/change', {
        email: emailFromUrl,
        token: token,
        password: newPassword,
        password_confirmation: confirmPassword
      });

      toast.success(response.data.message || "Mot de passe réinitialisé avec succès !");
      
      // Rediriger vers la page de connexion
      setTimeout(() => {
        navigate('/auth');
      }, 2000);

    } catch (error: any) {
      console.log("Erreur réinitialisation:", error.response);
      const msg = error?.response?.data?.message || "Erreur lors de la réinitialisation du mot de passe";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setEmailSent(false);
    await handleForgotPassword(new Event('submit') as any);
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

  // Mode réinitialisation du mot de passe
  if (isResetMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
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
            <h1 className="text-3xl font-bold text-foreground">Nouveau mot de passe</h1>
            <p className="text-muted-foreground mt-2">
              Créez un mot de passe sécurisé pour votre compte
            </p>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Réinitialiser le mot de passe</CardTitle>
              <CardDescription>
                Entrez votre nouveau mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Email : <span className="font-medium text-foreground">{emailFromUrl}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={loading}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {newPassword && (
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
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={loading}
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
                  {loading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="p-3 bg-accent/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    🔒 <strong>Sécurité :</strong> Votre nouveau mot de passe sera chiffré et stocké en toute sécurité
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Mode demande de réinitialisation
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
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Mot de passe oublié</h1>
          <p className="text-muted-foreground mt-2">
            Entrez votre email pour réinitialiser votre mot de passe
          </p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Réinitialiser le mot de passe</CardTitle>
            <CardDescription>
              Nous vous enverrons un lien pour créer un nouveau mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
              <>
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        autoFocus
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Entrez l'email associé à votre compte
                    </p>
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    <Send className="h-4 w-4" />
                    {loading ? "Envoi en cours..." : "Envoyer le lien"}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="p-3 bg-accent/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Astuce :</strong> Vérifiez vos spams si vous ne recevez pas l'email dans quelques minutes
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                {/* Confirmation d'envoi */}
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Email envoyé !
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Un email a été envoyé à :
                    </p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {email}
                    </p>
                  </div>

                  <div className="p-4 bg-accent/50 rounded-lg text-left space-y-2">
                    <p className="text-sm text-foreground font-medium">
                      📧 Étapes suivantes :
                    </p>
                    <ol className="text-xs text-muted-foreground space-y-1 ml-4 list-decimal">
                      <li>Consultez votre boîte email</li>
                      <li>Cliquez sur le lien de réinitialisation</li>
                      <li>Créez votre nouveau mot de passe</li>
                      <li>Connectez-vous avec votre nouveau mot de passe</li>
                    </ol>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={handleResendEmail}
                    disabled={loading}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Renvoyer l'email
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => navigate('/auth')}
                    className="w-full"
                  >
                    Retour à la connexion
                  </Button>
                </div>

                <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <p className="text-xs text-yellow-700 dark:text-yellow-500">
                    ⚠️ Le lien expire dans 60 minutes
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aide supplémentaire */}
        {!emailSent && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Besoin d'aide ?{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contactez le support
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;