# Configuration du Fork Directus avec Export XLS

Ce repository est un fork de Directus avec une fonctionnalité d'export XLS ajoutée. Il est configuré pour permettre la mise à jour depuis le repository officiel tout en préservant les modifications locales.

## Configuration Git

### Remotes configurés

- **origin** : `git@github.com:Agence-Indivisible/directus-add-xls-export.git` (votre fork)
- **upstream** : `https://github.com/directus/directus.git` (repository officiel)

### Branches

- **Branche actuelle** : `add-xls-export` (contient vos modifications)
- **Branche principale upstream** : `main`

## Outils de mise à jour

### Script automatique

Utilisez le script `update-from-upstream.sh` pour automatiser le processus de mise à jour :

```bash
./update-from-upstream.sh
```

### Documentation complète

Consultez le fichier `UPSTREAM_UPDATE.md` pour un guide détaillé du processus de mise à jour.

## Fonctionnalités ajoutées

Ce fork inclut une fonctionnalité d'export XLS qui n'est pas présente dans le repository officiel. Cette fonctionnalité permet d'exporter des données au format Excel.

## Workflow recommandé

1. **Développement** : Travaillez sur la branche `add-xls-export`
2. **Mise à jour** : Utilisez le script `update-from-upstream.sh` régulièrement
3. **Tests** : Testez toujours après une mise à jour
4. **Sauvegarde** : Le script crée automatiquement des branches de sauvegarde

## Commandes utiles

```bash
# Voir les remotes configurés
git remote -v

# Voir les branches
git branch -a

# Récupérer les dernières informations d'upstream
git fetch upstream

# Voir les différences avec upstream
git log HEAD..upstream/main --oneline

# Mise à jour automatique
./update-from-upstream.sh
```

## Support

En cas de problème avec la mise à jour ou la configuration, consultez :
- `UPSTREAM_UPDATE.md` pour le guide de mise à jour
- Les issues du repository Directus officiel
- Votre équipe de développement 