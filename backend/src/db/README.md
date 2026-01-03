# Base de données

## Installation

1. Assurez-vous d'avoir PostgreSQL installé et en cours d'exécution
2. Créez une base de données :
```sql
CREATE DATABASE spotichris;
```

3. Exécutez le script de migration :
```bash
psql -U postgres -d spotichris -f src/db/migrations/001_initial_schema.sql
```

Ou utilisez un client PostgreSQL pour exécuter le fichier `001_initial_schema.sql`.

## Variables d'environnement

Configurez les variables suivantes dans votre fichier `.env` :

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spotichris
DB_USER=postgres
DB_PASSWORD=postgres
```








