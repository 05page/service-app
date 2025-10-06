import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";

interface DeleteConfirmDialogProps {
    open: boolean;
    openChange: (open: boolean)=> void;
    onConfirm: ()=> void | Promise<void>;
    title?: string;
    description?: string;
    itemName?: string;
    isDeleting: boolean;
}

export default function DeleteDialog({open, openChange, onConfirm, title = "Confirmer la supression", 
    description, itemName, isDeleting = false}: DeleteConfirmDialogProps){
    const defaulDescription = itemName 
    ? `Êtes vous sur de vouloir supprimer ${itemName}? Cette suppression entrainera la supresion de d'autres informations à la quelle elles sont liées. Cette action est irréversible.`
    : "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.";
    return(
        <AlertDialog open={open} onOpenChange={openChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>
                    {description || defaulDescription}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                        Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        {isDeleting ? "supression..." : "supprimer"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}