# Guide du Système de Permissions - CommercePro

## Vue d'ensemble

Le système de permissions de CommercePro permet à l'administrateur de contrôler précisément ce que chaque employé peut voir et faire dans l'application.

## Structure des Permissions

Chaque permission a 4 niveaux d'accès :
- **can_view** : Peut voir les données
- **can_create** : Peut créer de nouvelles données
- **can_edit** : Peut modifier les données existantes
- **can_delete** : Peut supprimer les données

## Permissions Disponibles

### 1. Gestion des Utilisateurs (`users.*`)
- `users.view` - Voir la liste des utilisateurs
- `users.create` - Créer un nouvel utilisateur
- `users.edit` - Modifier un utilisateur existant
- `users.delete` - Supprimer un utilisateur

### 2. Gestion des Clients (`clients.*`)
- `clients.view` - Voir la liste des clients
- `clients.create` - Créer un nouveau client
- `clients.edit` - Modifier un client existant
- `clients.delete` - Supprimer un client

### 3. Gestion des Intermédiaires (`intermediaires.*`)
- `intermediaires.view` - Voir la liste des intermédiaires
- `intermediaires.create` - Créer un nouvel intermédiaire
- `intermediaires.edit` - Modifier un intermédiaire existant
- `intermediaires.delete` - Supprimer un intermédiaire

### 4. Gestion des Ventes (`ventes.*`)
- `ventes.view` - Voir la liste des ventes
- `ventes.create` - Créer une nouvelle vente
- `ventes.edit` - Modifier une vente existante
- `ventes.delete` - Supprimer une vente

### 5. Gestion du Personnel (`personnel.*`)
- `personnel.view` - Voir la liste du personnel
- `personnel.create` - Créer un nouveau membre du personnel
- `personnel.edit` - Modifier un membre du personnel
- `personnel.delete` - Supprimer un membre du personnel

### 6. Gestion des Fournisseurs (`fournisseurs.*`)
- `fournisseurs.view` - Voir la liste des fournisseurs
- `fournisseurs.create` - Créer un nouveau fournisseur
- `fournisseurs.edit` - Modifier un fournisseur existant
- `fournisseurs.delete` - Supprimer un fournisseur

### 7. Gestion des Achats (`achats.*`)
- `achats.view` - Voir la liste des achats
- `achats.create` - Créer un nouvel achat
- `achats.edit` - Modifier un achat existant
- `achats.delete` - Supprimer un achat

### 8. Gestion du Stock (`stock.*`)
- `stock.view` - Voir l'état du stock
- `stock.create` - Ajouter des articles au stock
- `stock.edit` - Modifier les articles du stock
- `stock.delete` - Supprimer des articles du stock

### 9. Gestion des Commissions (`commissions.*`)
- `commissions.view` - Voir les commissions
- `commissions.create` - Créer une nouvelle commission
- `commissions.edit` - Modifier une commission existante
- `commissions.delete` - Supprimer une commission

### 10. Paramètres (`settings.*`)
- `settings.view` - Voir les paramètres
- `settings.edit` - Modifier les paramètres

## Utilisation dans le Code

### Hook usePermissions

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/hooks/usePermissions';

const MyComponent = () => {
  const { permissions } = useAuth();
  
  // Vérifier si l'utilisateur peut voir les clients
  if (permissions.canView(PERMISSIONS.CLIENTS_VIEW)) {
    // Afficher la section clients
  }
  
  // Vérifier si l'utilisateur peut créer des clients
  if (permissions.canCreate(PERMISSIONS.CLIENTS_CREATE)) {
    // Afficher le bouton "Ajouter un client"
  }
  
  // Vérifier si l'utilisateur peut modifier des clients
  if (permissions.canEdit(PERMISSIONS.CLIENTS_EDIT)) {
    // Afficher les boutons d'édition
  }
  
  // Vérifier si l'utilisateur peut supprimer des clients
  if (permissions.canDelete(PERMISSIONS.CLIENTS_DELETE)) {
    // Afficher les boutons de suppression
  }
};
```

### Composant ProtectedRoute

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PERMISSIONS } from '@/hooks/usePermissions';

// Route protégée nécessitant une permission spécifique
<ProtectedRoute requiredPermission={PERMISSIONS.CLIENTS_VIEW}>
  <ClientsSection />
</ProtectedRoute>

// Route réservée aux administrateurs
<ProtectedRoute requireAdmin={true}>
  <AdminPanel />
</ProtectedRoute>
```

## Exemples de Configuration

### Employé avec accès limité
```json
{
  "permissions": [
    {
      "slug": "clients.view",
      "can_view": true,
      "can_create": false,
      "can_edit": false,
      "can_delete": false
    },
    {
      "slug": "ventes.view",
      "can_view": true,
      "can_create": true,
      "can_edit": false,
      "can_delete": false
    }
  ]
}
```

### Employé avec accès complet aux ventes
```json
{
  "permissions": [
    {
      "slug": "ventes.view",
      "can_view": true,
      "can_create": true,
      "can_edit": true,
      "can_delete": true
    }
  ]
}
```

### Administrateur (accès complet)
```json
{
  "permissions": [
    {
      "slug": "users.view",
      "can_view": true,
      "can_create": true,
      "can_edit": true,
      "can_delete": true
    },
    {
      "slug": "clients.view",
      "can_view": true,
      "can_create": true,
      "can_edit": true,
      "can_delete": true
    }
    // ... toutes les autres permissions
  ]
}
```

## Bonnes Pratiques

1. **Toujours vérifier les permissions** avant d'afficher des éléments d'interface
2. **Utiliser le hook usePermissions** pour une gestion centralisée
3. **Protéger les routes** avec le composant ProtectedRoute
4. **Afficher des messages appropriés** quand l'accès est refusé
5. **Tester les permissions** côté serveur également

## Messages d'Erreur

L'application affiche automatiquement des messages d'erreur appropriés :
- "Vous n'avez pas les permissions nécessaires" pour les accès refusés
- "Session expirée" pour les tokens invalides
- Messages spécifiques pour les erreurs de validation

## Sécurité

- Les permissions sont vérifiées côté client ET côté serveur
- Les tokens JWT sont utilisés pour l'authentification
- Les permissions sont stockées avec l'utilisateur et mises à jour en temps réel
- La déconnexion automatique en cas de token expiré

