#!/usr/bin/env python3
"""
Envoi de rappels SMS pour la recherche de patron CAP Bijouterie Lyon.

Usage:
    python send_reminder.py matin
    python send_reminder.py debut_aprem
    python send_reminder.py fin_aprem

Variables d'environnement requises:
    TWILIO_ACCOUNT_SID   → Account SID Twilio
    TWILIO_AUTH_TOKEN    → Auth Token Twilio
    TWILIO_FROM_NUMBER   → Numéro expéditeur Twilio (ex: +33757xxxxxx)
    RECIPIENT_NUMBER     → Numéro du destinataire (défaut: +33763766206)
"""

import os
import sys

# ─────────────────────────────────────────────────
# MESSAGES par créneau horaire
# Adaptés aux horaires des ateliers bijouterie (ouverture ~9h, déj 12h-14h, fermeture ~18h)
# ─────────────────────────────────────────────────
MESSAGES = {
    "matin": (
        "💎 Bonjour ! Les ateliers bijouterie ouvrent maintenant.\n"
        "C'est le MEILLEUR moment de la journée pour appeler.\n\n"
        "🎯 Objectif ce matin : contacter 2 patrons.\n"
        "Ouvre ton fichier de suivi et fonce ! 🚀"
    ),
    "debut_aprem": (
        "☀️ Les artisans reprennent après le déjeuner !\n"
        "C'est le bon moment pour relancer ceux qui n'ont pas encore répondu.\n\n"
        "📞 2 appels = 5 minutes. Tu peux le faire !\n"
        "Ouvre ton fichier et vas-y 💪"
    ),
    "fin_aprem": (
        "⏰ Dernier rappel de la journée !\n"
        "Les ateliers ferment dans ~1h.\n\n"
        "Un appel ou un mail MAINTENANT = une chance de plus de trouver ton patron.\n"
        "Allez, dernier effort ! 💎🔥"
    ),
}


def get_credentials():
    account_sid  = os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token   = os.environ.get("TWILIO_AUTH_TOKEN")
    from_number  = os.environ.get("TWILIO_FROM_NUMBER")
    to_number    = os.environ.get("RECIPIENT_NUMBER", "+33763766206")

    missing = [
        name for name, val in [
            ("TWILIO_ACCOUNT_SID",  account_sid),
            ("TWILIO_AUTH_TOKEN",   auth_token),
            ("TWILIO_FROM_NUMBER",  from_number),
        ] if not val
    ]

    if missing:
        print(f"ERREUR : variables d'environnement manquantes : {', '.join(missing)}")
        print("Configure ces variables (GitHub Secrets ou .env local).")
        sys.exit(1)

    return account_sid, auth_token, from_number, to_number


def send_sms(moment: str):
    message_body = MESSAGES.get(moment)
    if not message_body:
        print(f"ERREUR : moment inconnu '{moment}'.")
        print(f"Valeurs valides : {', '.join(MESSAGES.keys())}")
        sys.exit(1)

    try:
        from twilio.rest import Client
    except ImportError:
        print("ERREUR : twilio non installé. Lance : pip install twilio")
        sys.exit(1)

    account_sid, auth_token, from_number, to_number = get_credentials()

    print(f"Envoi SMS [{moment}] → {to_number} ...")
    client  = Client(account_sid, auth_token)
    message = client.messages.create(
        body=message_body,
        from_=from_number,
        to=to_number,
    )
    print(f"SMS envoyé avec succès. SID : {message.sid} | Statut : {message.status}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage : python send_reminder.py <matin|debut_aprem|fin_aprem>")
        sys.exit(1)

    send_sms(sys.argv[1])
