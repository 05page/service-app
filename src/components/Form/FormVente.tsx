import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { RefreshCw } from "lucide-react";

type Props = {
    isEdit?: boolean;
    stock?: any[];
    setStock: (value: []) => void;
    stockId?: string;
    setStockId: (value: string) => void;
    client?: string;
    setClient: (value: string) => void;
    numero?: string;
    setNumero: (value: string) => void;
    adresse?: string;
    setAdresse: (value: string) => void;
    quantite?: string;
    setQuantite: (value: string) => void;
    prixUnitaire?: string;
    setPrixUnitaire: (value: string) => void;
    prixTotal?: string;
    setPrixTotal: (value: string) => void;
    setDialogOpen: (open: boolean) => void;
    isSubmitting: boolean;
    handleSubmit: (e: React.FormEvent) => void;
    handleUpdate: (e: React.FormEvent) => void;
    setEditDialogOpen: (open: boolean) => void;
    resetForm: () => void;
}

export default function FormVente({
    isEdit = false,
    stock,
    setStock,
    stockId,
    setStockId,
    client,
    setClient,
    numero,
    setNumero,
    adresse,
    setAdresse,
    quantite,
    setQuantite,
    prixUnitaire,
    setPrixUnitaire,
    prixTotal,
    isSubmitting,
    setDialogOpen,
    setEditDialogOpen,
    setPrixTotal,
    handleSubmit,
    handleUpdate,
    resetForm
}: Props) {
    return (
        <div>
            <form onSubmit={isEdit ? handleUpdate : handleSubmit}>
                {/* Grille pour les champs du formulaire */}
                <div className="grid grid-cols-2 gap-4 py-4">
                    {/* Champ Article */}
                    <div className="space-y-2">
                        <Label htmlFor="stock">Article *</Label>
                        {stock && stock.length > 0 ? (
                            <Select value={stockId} onValueChange={setStockId} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un article" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stock.map((s: any) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.achat?.nom_service}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Select disabled>
                                <SelectTrigger>
                                    <SelectValue placeholder="Aucun article en stock" />
                                </SelectTrigger>
                            </Select>
                        )}
                        {stock.length === 0 && (
                            <p className="text-sm text-red-500">
                                Aucun article en stock. Veuillez ajouter des articles au stock.
                            </p>
                        )}
                    </div>

                    {/* Champ Client */}
                    <div className="space-y-2">
                        <Label htmlFor="client">Client *</Label>
                        <Input
                            id="client"
                            type="text"
                            placeholder="Nom complet"
                            value={client}
                            onChange={(e) => setClient(e.target.value)}
                            min="1"
                            required
                        />
                    </div>

                    {/* Champ Numéro */}
                    <div className="space-y-2">
                        <Label htmlFor="client">Numero *</Label>
                        <Input
                            id="numero"
                            type="text"
                            placeholder="+225 07 01 02 03 04"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            min="1"
                            required
                        />
                    </div>

                    {/* Champ Adresse */}
                    <div className="space-y-2">
                        <Label htmlFor="client">Adresse *</Label>
                        <Input
                            id="adresse"
                            type="text"
                            placeholder="Ex: Yopougon"
                            value={adresse}
                            onChange={(e) => setAdresse(e.target.value)}
                            min="1"
                            required
                        />
                    </div>

                    {/* Champ Quantité */}
                    <div className="space-y-2">
                        <Label htmlFor="quantite">Quantité *</Label>
                        <Input
                            id="quantite"
                            type="number"
                            placeholder="1"
                            value={quantite}
                            onChange={(e) => setQuantite(e.target.value)}
                            min="1"
                            required
                        />
                    </div>

                    {/* Champ Prix unitaire */}
                    <div className="space-y-2">
                        <Label htmlFor="prixUnitaire">Prix unitaire (FCFA) *</Label>
                        <Input
                            id="prixUnitaire"
                            type="number"
                            placeholder="Prix de vente"
                            value={prixUnitaire}
                            onChange={(e) => setPrixUnitaire(e.target.value)}
                            min="0"
                            step="0.01"
                            required
                            disabled
                        />
                        <p className="text-xs text-muted-foreground">
                            Prix automatiquement rempli selon l'article sélectionné
                        </p>
                    </div>

                    {/* Champ Prix total */}
                    <div className="space-y-2">
                        <Label htmlFor="prixTotal">Prix Total (FCFA) *</Label>
                        <Input
                            id="prixTotal"
                            type="number"
                            placeholder="Prix total"
                            value={prixTotal}
                            onChange={(e) => setPrixTotal(e.target.value)}
                            min="0"
                            step="0.01"
                            disabled
                        />
                        <p className="text-xs text-muted-foreground">
                            Prix automatiquement rempli selon la quantité sélectionnée
                        </p>
                    </div>
                </div>

                {/* Boutons annuler et créer */}
                <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            console.log("Cancel clicked, isEdit =", isEdit);
                            isEdit ? setEditDialogOpen(false) : setDialogOpen(false);
                            resetForm();
                        }}
                    >
                        Annuler
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <span className="flex items-center">
                                <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                                {isEdit ? "Mise à jour..." : "Créer..."}
                            </span>
                        ) : (
                            isEdit ? "Mettre à jour la vente" : "Créer la vente"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}