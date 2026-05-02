---
description: Démarre une session AIactions — reprend le fil via muninn, synchronise l'index codebase-memory, résume l'état et attend le prochain prompt.
---

Session AIactions — kickoff. Effectue les étapes suivantes dans l'ordre, puis arrête-toi :

1. Appelle `mcp__muninn__muninn_where_left_off` avec `vault: "aiactions"` pour reprendre la continuité.
2. Si des commits ont eu lieu depuis la dernière reprise (vérifie `git log` si besoin), appelle `mcp__codebase-memory-mcp__detect_changes` avec `project: "home-aperrix-Documents-PROJECTS-aiactions"` et `since: "HEAD~<N>"` pour synchroniser le graphe.
3. Résume en 2 lignes maximum :
   - la dernière décision ou l'état courant tel que reflété en mémoire,
   - la prochaine étape planifiée (si un plan est actif).
4. Termine par une question ouverte : « Sur quoi travaille-t-on dans cette session ? »

**Ne commence aucune action au-delà de ce briefing sans mon feu vert explicite.**

Rappel du protocole de collaboration (voir `@.claude/rules/collaboration.md`) :

- Discussion en français ; code, commentaires, commits et docs en anglais.
- Checkpoint à chaque étape : brainstorm → plan → impl → tests → commit. Jamais de phase chaînée sans green light.
- Brainstorming + vérification systématique obligatoires, surtout quand on s'inspire d'Archon (trust the code, not the docs).
- Feature branches + squash merge, Conventional Commits, release-please.
