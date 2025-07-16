# Guide de mise à jour depuis le repository officiel Directus

Ce document explique comment maintenir votre fork à jour avec les dernières modifications du repository officiel Directus, tout en préservant vos modifications locales.

## Configuration initiale

La configuration a déjà été effectuée :
- `origin` : Votre fork (Agence-Indivisible/directus-add-xls-export)
- `upstream` : Repository officiel (directus/directus)

## Processus de mise à jour

### Méthode automatique (recommandée)

Utilisez le script `update-from-upstream.sh` :

```bash
./update-from-upstream.sh
```

Ce script :
1. ✅ Vérifie que vous êtes sur la branche principale
2. 📥 Récupère les dernières informations depuis upstream
3. 💾 Crée une branche de sauvegarde automatiquement
4. 🔄 Fusionne les changements d'upstream
5. 📤 Pousse les changements vers votre fork
6. 📋 Fournit un résumé et les prochaines étapes

### Méthode manuelle

Si vous préférez faire la mise à jour manuellement :

```bash
# 1. Récupérer les dernières informations
git fetch upstream

# 2. Créer une branche de sauvegarde (optionnel mais recommandé)
git checkout -b backup-$(date +%Y%m%d-%H%M%S)

# 3. Retourner sur votre branche principale
git checkout main  # ou master

# 4. Fusionner les changements d'upstream
git merge upstream/main  # ou upstream/master

# 5. Pousser vers votre fork
git push origin main
```

## Gestion des conflits

Si des conflits surviennent lors de la fusion :

1. **Identifier les fichiers en conflit** :
   ```bash
   git status
   ```

2. **Résoudre les conflits** :
   - Ouvrir chaque fichier en conflit
   - Choisir les bonnes parties (vos modifications vs upstream)
   - Sauvegarder les fichiers

3. **Finaliser la fusion** :
   ```bash
   git add .
   git commit
   ```

4. **Pousser les changements** :
   ```bash
   git push origin main
   ```

## Bonnes pratiques

### Avant chaque mise à jour

1. **Commiter ou stasher vos changements** :
   ```bash
   git add .
   git commit -m "WIP: Sauvegarde avant mise à jour"
   # OU
   git stash
   ```

2. **Vérifier que vous êtes sur la bonne branche** :
   ```bash
   git branch --show-current
   ```

### Après chaque mise à jour

1. **Tester votre application** pour vous assurer que tout fonctionne
2. **Supprimer la branche de sauvegarde** si tout va bien :
   ```bash
   git branch -d backup-YYYYMMDD-HHMMSS
   ```
3. **Récupérer vos changements stashés** si nécessaire :
   ```bash
   git stash pop
   ```

## Fréquence recommandée

- **Mise à jour hebdomadaire** : Pour les corrections de bugs et améliorations mineures
- **Mise à jour mensuelle** : Pour les nouvelles fonctionnalités majeures
- **Mise à jour immédiate** : En cas de correction de sécurité critique

## En cas de problème

### Revenir en arrière

Si la mise à jour cause des problèmes :

```bash
# Retourner à la branche de sauvegarde
git checkout backup-YYYYMMDD-HHMMSS

# Ou revenir au commit précédent
git reset --hard HEAD~1
```

### Vérifier l'état du repository

```bash
# Voir les remotes configurés
git remote -v

# Voir l'historique des commits
git log --oneline -10

# Voir les branches
git branch -a
```

## Notes importantes

- **Ne jamais faire de force push** sur la branche principale sans sauvegarde
- **Toujours tester** après une mise à jour
- **Documenter** les modifications spécifiques à votre fork
- **Considérer** l'utilisation de branches feature pour vos modifications

## Support

En cas de problème avec ce processus, consultez :
- La documentation Git officielle
- Les issues du repository Directus
- Votre équipe de développement 