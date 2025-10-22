import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Receipt, Calendar, User, Phone, MapPin, Package } from "lucide-react";

type RecuPreviewProps = {
  vente: any;
};

export function RecuPreview({ vente }: RecuPreviewProps) {
  const montantPaye = vente.montant_paye || 0;
  const montantRestant = parseFloat(vente.prix_total) - montantPaye;
  
  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-primary/5 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Reçu de paiement</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Document non fiscal</p>
            </div>
          </div>
          <Badge variant="outline" className="text-warning border-warning">
            Paiement partiel
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Informations générales */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">N° de référence</p>
            <p className="font-semibold text-lg">{vente.reference}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Date</p>
            </div>
            <p className="font-semibold">{new Date(vente.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        <Separator />

        {/* Informations client */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Informations client
          </h3>
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Nom complet</p>
              <p className="font-medium">{vente.nom_client}</p>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{vente.numero}</p>
              </div>
            </div>
            <div className="col-span-2 flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium">{vente.adresse}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Détails du produit */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Détails du produit
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 p-3 grid grid-cols-4 gap-4 text-sm font-medium">
              <div className="col-span-2">Produit</div>
              <div className="text-center">Quantité</div>
              <div className="text-right">Prix unitaire</div>
            </div>
            <div className="p-3 grid grid-cols-4 gap-4 items-center">
              <div className="col-span-2 flex items-center gap-3">
                {vente.photo_url ? (
                  <img src={vente.photo_url} alt={vente.nom_produit} className="w-10 h-10 rounded object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <span className="font-medium">{vente.nom_produit}</span>
              </div>
              <div className="text-center">{vente.quantite}</div>
              <div className="text-right font-medium">{(parseFloat(vente.prix_total) / vente.quantite).toLocaleString('fr-FR')} Fcfa</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Récapitulatif des paiements */}
        <div className="space-y-3">
          <h3 className="font-semibold">Récapitulatif des paiements</h3>
          <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Montant total de la vente</span>
              <span className="font-medium">{parseFloat(vente.prix_total).toLocaleString('fr-FR')} Fcfa</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-success font-medium">Montant payé à ce jour</span>
              <span className="font-semibold text-success">{montantPaye.toLocaleString('fr-FR')} Fcfa</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span className="font-semibold">Reste à payer</span>
              <span className="font-bold text-lg text-destructive">{montantRestant.toLocaleString('fr-FR')} Fcfa</span>
            </div>
          </div>
        </div>

        {/* Note importante */}
        <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note :</strong> Ce reçu atteste d'un paiement partiel. Une facture définitive sera émise lors du règlement complet de la vente.
          </p>
        </div>

        {/* Pied du reçu */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          <p>Ce document est généré automatiquement et ne nécessite pas de signature</p>
          <p className="mt-1">Pour toute question, veuillez nous contacter</p>
        </div>
      </CardContent>
    </Card>
  );
}
