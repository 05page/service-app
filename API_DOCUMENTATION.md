# Documentation API Laravel - CommercePro

## Configuration

### Base URL
```
http://localhost:8000/api
```

### Headers requis
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token} (pour les routes protégées)
```

## Authentification

### POST /auth/login
Connexion utilisateur

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "permissions": [
      {
        "id": 1,
        "name": "Voir les utilisateurs",
        "slug": "users.view",
        "can_view": true,
        "can_create": true,
        "can_edit": true,
        "can_delete": true
      }
    ]
  }
}
```

### POST /auth/logout
Déconnexion utilisateur

**Headers:** `Authorization: Bearer {token}`

**Response:** `204 No Content`

### GET /auth/profile
Récupérer le profil utilisateur

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "permissions": [...]
}
```

### POST /auth/refresh
Rafraîchir le token

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "token": "new_token_here"
}
```

## Gestion des utilisateurs (Admin seulement)

### GET /users
Liste des utilisateurs

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "permissions": [...],
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
]
```

### POST /users
Créer un utilisateur

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "name": "Nouvel Employé",
  "email": "employe@example.com",
  "password": "password",
  "role": "employee",
  "permissions": [1, 2, 3]
}
```

### PUT /users/{id}
Modifier un utilisateur

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "name": "Nom modifié",
  "email": "nouveau@example.com",
  "role": "employee",
  "permissions": [1, 2]
}
```

### PUT /users/{id}/permissions
Modifier les permissions d'un utilisateur

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "permissions": [1, 2, 3, 4]
}
```

### DELETE /users/{id}
Supprimer un utilisateur

**Headers:** `Authorization: Bearer {token}`

## Gestion des clients

### GET /clients
Liste des clients

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
[
  {
    "id": 1,
    "nom": "Client A",
    "email": "client@example.com",
    "telephone": "0123456789",
    "adresse": "123 Rue Example",
    "statut": "Actif",
    "intermediaire_id": 1,
    "intermediaire": {
      "id": 1,
      "nom": "Intermédiaire A"
    },
    "ca": "50000.00",
    "commandes_count": 5,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
]
```

### POST /clients
Créer un client

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "nom": "Nouveau Client",
  "email": "nouveau@example.com",
  "telephone": "0123456789",
  "adresse": "123 Rue Example",
  "intermediaire_id": 1
}
```

### PUT /clients/{id}
Modifier un client

**Headers:** `Authorization: Bearer {token}`

### DELETE /clients/{id}
Supprimer un client

**Headers:** `Authorization: Bearer {token}`

## Gestion des intermédiaires

### GET /intermediaires
Liste des intermédiaires

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
[
  {
    "id": 1,
    "nom": "Intermédiaire A",
    "email": "inter@example.com",
    "telephone": "0123456789",
    "commission": 10.5,
    "clients_count": 5,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
]
```

### POST /intermediaires
Créer un intermédiaire

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "nom": "Nouvel Intermédiaire",
  "email": "nouveau@example.com",
  "telephone": "0123456789",
  "commission": 8.5
}
```

## Gestion des ventes

### GET /ventes
Liste des ventes

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
[
  {
    "id": 1,
    "client_id": 1,
    "client": {
      "id": 1,
      "nom": "Client A"
    },
    "montant": "1500.00",
    "statut": "Payé",
    "intermediaire_id": 1,
    "intermediaire": {
      "id": 1,
      "nom": "Intermédiaire A"
    },
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
]
```

### POST /ventes
Créer une vente

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "client_id": 1,
  "montant": "1500.00",
  "intermediaire_id": 1
}
```

## Statistiques

### GET /stats/dashboard
Statistiques du dashboard

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "chiffre_affaires": "150000.00",
  "benefice_net": "45000.00",
  "clients_actifs": 25,
  "commandes_count": 150,
  "articles_stock": 500,
  "commissions_dues": "7500.00",
  "ventes_recentes": [...]
}
```

## Permissions

### GET /permissions
Liste des permissions disponibles

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Voir les utilisateurs",
    "slug": "users.view",
    "can_view": true,
    "can_create": false,
    "can_edit": false,
    "can_delete": false
  }
]
```

## Codes d'erreur

- `401 Unauthorized` - Token invalide ou expiré
- `403 Forbidden` - Permissions insuffisantes
- `404 Not Found` - Ressource non trouvée
- `422 Unprocessable Entity` - Erreur de validation
- `500 Internal Server Error` - Erreur serveur

## Exemple de validation d'erreur

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

