
    //   {/* Dialog Détails */}
    //   <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
    //     <DialogContent className="max-w-2xl">
    //       <DialogHeader>
    //         <DialogTitle>Détails de la vente</DialogTitle>
    //       </DialogHeader>
    //       {selectedVente && (
    //         <div className="space-y-4">
    //           {selectedVente.photo_url ? (
    //             <img src={selectedVente.photo_url} alt="Produit" className="w-full h-48 object-cover rounded" />
    //           ) : (
    //             <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
    //               <Package className="h-16 w-16 text-muted-foreground" />
    //             </div>
    //           )}
    //           <div className="grid grid-cols-2 gap-4">
    //             <div>
    //               <p className="text-sm text-muted-foreground">Référence</p>
    //               <p className="font-semibold">{selectedVente.reference}</p>
    //             </div>
    //             <div>
    //               <p className="text-sm text-muted-foreground">Produit</p>
    //               <p className="font-semibold">{selectedVente.nom_produit}</p>
    //             </div>
    //             <div>
    //               <p className="text-sm text-muted-foreground">Client</p>
    //               <p className="font-semibold">{selectedVente.nom_client}</p>
    //             </div>
    //             <div>
    //               <p className="text-sm text-muted-foreground">Téléphone</p>
    //               <p className="font-semibold">{selectedVente.numero}</p>
    //             </div>
    //             <div>
    //               <p className="text-sm text-muted-foreground">Adresse</p>
    //               <p className="font-semibold">{selectedVente.adresse}</p>
    //             </div>
    //             <div>
    //               <p className="text-sm text-muted-foreground">Quantité</p>
    //               <p className="font-semibold">{selectedVente.quantite}</p>
    //             </div>
    //             <div>
    //               <p className="text-sm text-muted-foreground">Prix total</p>
    //               <p className="font-semibold text-success">{selectedVente.prix_total} Fcfa</p>
    //             </div>
    //             <div>
    //               <p className="text-sm text-muted-foreground">Statut paiement</p>
    //               <Badge variant={selectedVente.statut_paiement === 'réglé' ? 'default' : 'destructive'}>
    //                 {selectedVente.statut_paiement || 'non réglé'}
    //               </Badge>
    //             </div>
    //             <div className="col-span-2">
    //               <p className="text-sm text-muted-foreground mb-2">Personnel</p>
    //               <div className="p-3 bg-muted rounded-lg">
    //                 <div className="flex items-center justify-between">
    //                   <div>
    //                     <p className="font-semibold">{selectedVente.employe_nom || 'N/A'}</p>
    //                     <Badge variant="outline" className="mt-1">
    //                       {selectedVente.employe_role || 'employé'}
    //                     </Badge>
    //                   </div>
    //                   <div className="text-right">
    //                     <p className="text-sm text-muted-foreground">Commission</p>
    //                     <p className="font-semibold text-primary">
    //                       {selectedVente.commission_montant ? `${selectedVente.commission_montant} Fcfa` : 'N/A'}
    //                     </p>
    //                     {selectedVente.commission_touche && (
    //                       <Badge variant="default" className="mt-1">
    //                         ✓ Commissionné
    //                       </Badge>
    //                     )}
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>

    //           <Button
    //             variant="outline"
    //             size="sm">
    //             {selectedVente.statut_paiement === 'réglé' ? <FileText className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
    //           </Button>
    //         </div>
    //       )}
    //     </DialogContent>
    //   </Dialog>