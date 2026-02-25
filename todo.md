# RootsLegacy App — TODO

## Corrections prioritaires

- [ ] Arbre généalogique (family-tree.tsx) — connecter à l'API /tree réelle
- [ ] Page Home (home.tsx) — connecter à l'API /profiles/me et /tree pour données réelles
- [ ] Onboarding conversationnel (conversational-onboarding.tsx) — IA réelle via route /ai/chat
- [ ] Saisie vocale (voice-input.tsx) — sauvegarder transcription en DB via /profiles
- [ ] WhatsApp import — remplacer contacts hardcodés par import texte/fichier (paste groupe WA)
- [ ] WhatsApp partage — Web Share API pour partager le lien de la famille
- [ ] Photo Scan (photo-scan.tsx) — OCR réel via route /ai/scan-document avec vision LLM
- [ ] Ajouter routes Edge Function manquantes : /ai/chat, /ai/scan-document, /profiles/me, /share/family-link
