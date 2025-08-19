import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Building, 
  Users, 
  Bell, 
  Shield, 
  Database,
  Palette,
  Save,
  RefreshCw,
  Download,
  Upload
} from "lucide-react";

export function SettingsSection() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    companyName: "Entreprise Commerciale SARL",
    companyAddress: "123 Rue du Commerce, 75001 Paris",
    companyPhone: "+33 1 23 45 67 89",
    companyEmail: "contact@entreprise.com",
    currency: "EUR",
    language: "fr",
    timezone: "Europe/Paris",
    notifications: {
      email: true,
      sms: false,
      push: true,
      stockAlerts: true,
      paymentReminders: true
    },
    commissions: {
      defaultRate: 5,
      autoCalculate: true,
      paymentFrequency: "monthly"
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      passwordPolicy: "medium"
    }
  });

  const handleSave = () => {
    // Logique de sauvegarde
    console.log("Sauvegarde des paramètres:", settings);
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => {
      const sectionData = prev[section as keyof typeof prev] as any;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value
        }
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">
            Configurez les paramètres de votre application de gestion commerciale
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">
            <Building className="mr-2 h-4 w-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="commissions">
            <Settings className="mr-2 h-4 w-4" />
            Commissions
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Database className="mr-2 h-4 w-4" />
            Sauvegarde
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
              <CardDescription>
                Configurez les informations générales de votre entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => setSettings(prev => ({...prev, companyName: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => setSettings(prev => ({...prev, companyEmail: e.target.value}))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Adresse</Label>
                <Textarea
                  id="companyAddress"
                  value={settings.companyAddress}
                  onChange={(e) => setSettings(prev => ({...prev, companyAddress: e.target.value}))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select value={settings.currency} onValueChange={(value) => setSettings(prev => ({...prev, currency: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dollar US ($)</SelectItem>
                      <SelectItem value="GBP">Livre Sterling (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({...prev, language: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({...prev, timezone: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Paris (UTC+1)</SelectItem>
                      <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                      <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Gérez les comptes utilisateurs et leurs permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Fonctionnalité de gestion des utilisateurs en cours de développement...
              </p>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Gérer les utilisateurs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>
                Configurez comment vous souhaitez recevoir les notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir les notifications par email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'email', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir les notifications par SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'sms', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertes de stock</Label>
                    <p className="text-sm text-muted-foreground">
                      Être notifié quand le stock est bas
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.stockAlerts}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'stockAlerts', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rappels de paiement</Label>
                    <p className="text-sm text-muted-foreground">
                      Rappels pour les factures impayées
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.paymentReminders}
                    onCheckedChange={(checked) => handleInputChange('notifications', 'paymentReminders', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres des commissions</CardTitle>
              <CardDescription>
                Configurez les règles de calcul des commissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultRate">Taux par défaut (%)</Label>
                  <Input
                    id="defaultRate"
                    type="number"
                    value={settings.commissions.defaultRate}
                    onChange={(e) => handleInputChange('commissions', 'defaultRate', Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentFrequency">Fréquence de paiement</Label>
                  <Select 
                    value={settings.commissions.paymentFrequency} 
                    onValueChange={(value) => handleInputChange('commissions', 'paymentFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="quarterly">Trimestriel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Calcul automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Calculer automatiquement les commissions
                  </p>
                </div>
                <Switch
                  checked={settings.commissions.autoCalculate}
                  onCheckedChange={(checked) => handleInputChange('commissions', 'autoCalculate', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
              <CardDescription>
                Configurez les paramètres de sécurité de l'application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Authentification à deux facteurs</Label>
                  <p className="text-sm text-muted-foreground">
                    Ajouter une couche de sécurité supplémentaire
                  </p>
                </div>
                <Switch
                  checked={settings.security.twoFactor}
                  onCheckedChange={(checked) => handleInputChange('security', 'twoFactor', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Timeout de session (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleInputChange('security', 'sessionTimeout', Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passwordPolicy">Politique de mot de passe</Label>
                <Select 
                  value={settings.security.passwordPolicy} 
                  onValueChange={(value) => handleInputChange('security', 'passwordPolicy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sauvegarde et restauration</CardTitle>
              <CardDescription>
                Gérez les sauvegardes de vos données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Sauvegarde automatique</h4>
                    <p className="text-sm text-muted-foreground">
                      Dernière sauvegarde: Il y a 2 heures
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger sauvegarde
                  </Button>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Restaurer sauvegarde
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}