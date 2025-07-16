#!/bin/bash

# Script pour mettre à jour le fork depuis le repository officiel Directus
# Usage: ./update-from-upstream.sh [branch_name]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Début de la mise à jour depuis upstream...${NC}"

# Vérifier que nous sommes sur la branche principale
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${YELLOW}⚠️  Vous n'êtes pas sur la branche principale (main/master)${NC}"
    echo -e "${YELLOW}   Branche actuelle: $CURRENT_BRANCH${NC}"
    read -p "Voulez-vous continuer quand même ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Mise à jour annulée${NC}"
        exit 1
    fi
fi

# Récupérer les dernières informations depuis upstream
echo -e "${BLUE}📥 Récupération des dernières informations depuis upstream...${NC}"
git fetch upstream

# Déterminer la branche cible (main ou master)
UPSTREAM_MAIN=""
if git ls-remote --heads upstream main | grep -q main; then
    UPSTREAM_MAIN="main"
elif git ls-remote --heads upstream master | grep -q master; then
    UPSTREAM_MAIN="master"
else
    echo -e "${RED}❌ Impossible de déterminer la branche principale d'upstream${NC}"
    exit 1
fi

echo -e "${BLUE}🎯 Branche principale upstream: $UPSTREAM_MAIN${NC}"

# Vérifier s'il y a des changements non commités
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Il y a des changements non commités dans votre working directory${NC}"
    echo -e "${YELLOW}   Veuillez les commiter ou les stasher avant de continuer${NC}"
    exit 1
fi

# Sauvegarder la branche actuelle
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}💾 Sauvegarde de la branche actuelle: $CURRENT_BRANCH${NC}"

# Créer une branche de sauvegarde avec la date
BACKUP_BRANCH="backup-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BACKUP_BRANCH"
echo -e "${GREEN}✅ Branche de sauvegarde créée: $BACKUP_BRANCH${NC}"

# Retourner sur la branche principale
git checkout "$CURRENT_BRANCH"

# Merger les changements d'upstream
echo -e "${BLUE}🔄 Fusion des changements depuis upstream/$UPSTREAM_MAIN...${NC}"
if git merge "upstream/$UPSTREAM_MAIN" --no-edit; then
    echo -e "${GREEN}✅ Fusion réussie !${NC}"
else
    echo -e "${RED}❌ Conflits de fusion détectés${NC}"
    echo -e "${YELLOW}💡 Vous devrez résoudre les conflits manuellement${NC}"
    echo -e "${YELLOW}   Utilisez 'git status' pour voir les fichiers en conflit${NC}"
    echo -e "${YELLOW}   Après résolution, utilisez 'git add .' et 'git commit'${NC}"
    exit 1
fi

# Pousser les changements vers votre fork
echo -e "${BLUE}📤 Poussée des changements vers votre fork...${NC}"
if git push origin "$CURRENT_BRANCH"; then
    echo -e "${GREEN}✅ Changements poussés avec succès !${NC}"
else
    echo -e "${RED}❌ Erreur lors de la poussée${NC}"
    echo -e "${YELLOW}   Vous devrez peut-être forcer la poussée avec 'git push --force-with-lease'${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Mise à jour terminée avec succès !${NC}"
echo -e "${BLUE}📋 Résumé:${NC}"
echo -e "   - Branche de sauvegarde: $BACKUP_BRANCH"
echo -e "   - Branche mise à jour: $CURRENT_BRANCH"
echo -e "   - Source: upstream/$UPSTREAM_MAIN"
echo -e ""
echo -e "${YELLOW}💡 Prochaines étapes:${NC}"
echo -e "   1. Testez votre application pour vous assurer que tout fonctionne"
echo -e "   2. Si tout va bien, vous pouvez supprimer la branche de sauvegarde:"
echo -e "      git branch -d $BACKUP_BRANCH"
echo -e "   3. Si vous avez des problèmes, vous pouvez revenir en arrière:"
echo -e "      git checkout $BACKUP_BRANCH" 