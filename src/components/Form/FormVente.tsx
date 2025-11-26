import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ItemVente = {
    stock_id: string;
    quantite: string;
    prix_unitaire: string;
    sous_total: string;
}

type Props = {
    isEdit?: boolean;
    stock?: any[];
    setStock: (value: []) => void;
    selectCommissionaire?: any[];
    setSelectCommissionaire: (value: []) => void;
    client?: string;
    setClient: (value: string) => void;
    numero?: string;
    setNumero: (value: string) => void;
    adresse?: string;
    setAdresse: (value: string) => void;
    commissionaire?: string;
    setCommissionnire: (value: string) => void;
    montant: string;
    setMontant: (value: string) => void;
    items: ItemVente[];
    setItems: (value: ItemVente[]) => void;
    setDialogOpen: (open: boolean) => void;
    isSubmitting: boolean;
    handleSubmit: (e: React.FormEvent) => void;
    handleUpdate: (e: React.FormEvent) => void;
    setEditDialogOpen: (open: boolean) => void;
    resetForm: () => void;
}

export default function FormVente({
    isEdit = false,
    stock, setStock, client, setClient, numero, setNumero, adresse,
    setAdresse, commissionaire, setCommissionnire, selectCommissionaire, setSelectCommissionaire,
    montant, setMontant, items, setItems, isSubmitting, setDialogOpen, setEditDialogOpen,
    handleSubmit, handleUpdate, resetForm
}: Props) {
    
    const addItem = () => {
        setItems([...items, { stock_id: "", quantite: "", prix_unitaire: "", sous_total: "" }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof ItemVente, value: string) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Calcul automatique du sous-total et du prix unitaire
        if (field === "stock_id" && value) {
            const selectedStock = stock?.find((s: any) => s.id === parseInt(value));
            if (selectedStock) {
                newItems[index].prix_unitaire = selectedStock.prix_vente.toString();
                const quantite = parseInt(newItems[index].quantite) || 0;
                newItems[index].sous_total = (quantite * selectedStock.prix_vente).toFixed(2);
            }
        }

        if (field === "quantite") {
            const quantite = parseInt(value) || 0;
            const prixUnitaire = parseFloat(newItems[index].prix_unitaire) || 0;
            newItems[index].sous_total = (quantite * prixUnitaire).toFixed(2);
        }

        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + (parseFloat(item.sous_total) || 0), 0).toFixed(2);
    };

    return (
        <div>
            <form onSubmit={isEdit ? handleUpdate : handleSubmit}>
                {/* Informations client */}
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="client">Client *</Label>
                        <Input
                            id="client"
                            type="text"
                            placeholder="Nom complet"
                            value={client}
                            onChange={(e) => setClient(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="numero">Numero *</Label>
                        <Input
                            id="numero"
                            type="text"
                            placeholder="+225 07 01 02 03 04"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adresse">Adresse *</Label>
                        <Input
                            id="adresse"
                            type="text"
                            placeholder="Ex: Yopougon"
                            value={adresse}
                            onChange={(e) => setAdresse(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Commissionaire</Label>
                        {selectCommissionaire && selectCommissionaire.length > 0 ? (
                            <Select value={commissionaire} onValueChange={setCommissionnire}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner l'intermédiaire" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectCommissionaire.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.fullname}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Select disabled>
                                <SelectTrigger>
                                    <SelectValue placeholder="Aucun commissionaire" />
                                </SelectTrigger>
                            </Select>
                        )}
                    </div>
                </div>

                {/* Articles */}
                <div className="space-y-4 mb-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-lg font-semibold">Articles *</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un article
                        </Button>
                    </div>

                    {items.map((item, index) => (
                        <Card key={index}>
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label>Article *</Label>
                                        {stock && stock.length > 0 ? (
                                            <Select 
                                                value={item.stock_id} 
                                                onValueChange={(value) => updateItem(index, "stock_id", value)}
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stock.map((s: any) => (
                                                        <SelectItem key={s.id} value={s.id.toString()}>
                                                            {s.achat.items?.[0]?.nom_service || 'Service non défini'} ({s.quantite} disponible)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Select disabled>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Aucun article" />
                                                </SelectTrigger>
                                            </Select>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Quantité *</Label>
                                        <Input
                                            type="number"
                                            placeholder="1"
                                            value={item.quantite}
                                            onChange={(e) => updateItem(index, "quantite", e.target.value)}
                                            min="1"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Prix unitaire (FCFA)</Label>
                                        <Input
                                            type="number"
                                            value={item.prix_unitaire}
                                            disabled
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Sous-total (FCFA)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                value={item.sous_total}
                                                disabled
                                            />
                                            {items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {stock && stock.length === 0 && (
                        <p className="text-sm text-red-500">
                            Aucun article en stock. Veuillez ajouter des articles au stock.
                        </p>
                    )}
                </div>

                {/* Total et Montant */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">Prix Total (FCFA)</Label>
                        <Input
                            type="text"
                            value={calculateTotal()}
                            disabled
                            className="font-bold text-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Montant versé (FCFA) *</Label>
                        <Input
                            type="number"
                            placeholder="Entrez le montant"
                            id="montant"
                            value={montant}
                            onChange={(e) => setMontant(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Boutons */}
                <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            isEdit ? setEditDialogOpen(false) : setDialogOpen(false);
                            resetForm();
                        }}
                    >
                        Annuler
                    </Button>
                    <Button type="submit" disabled={isSubmitting || items.length === 0}>
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
    );
}