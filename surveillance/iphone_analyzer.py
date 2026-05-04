"""
Analyseur de sécurité iPhone — détection de pistage et accès non autorisé.
Analyse les sauvegardes iTunes/Finder pour détecter des signes de surveillance.
"""

import os
import sqlite3
import plistlib
import hashlib
import glob
import platform
import shutil
import tempfile
from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict
from .detector import Finding, RiskLevel


# ---------------------------------------------------------------------------
# Apps de pistage et surveillance connues sur iOS
# ---------------------------------------------------------------------------

KNOWN_IOS_STALKERWARE = {
    "com.thetruthspy.app": "TheTruthSpy",
    "com.mspy.agent": "mSpy",
    "com.flexispy": "FlexiSPY",
    "com.spyic": "Spyic",
    "com.cocospy": "Cocospy",
    "com.hoverwatch": "Hoverwatch",
    "com.ikeymonitor": "iKeyMonitor",
    "com.xnspy": "XNSPY",
    "com.highstermobile": "Highster Mobile",
    "com.spybubble": "SpyBubble",
    "com.spyera": "Spyera",
    "com.umobix": "uMobix",
    "com.eyezy": "Eyezy",
    "com.clevguard": "ClevGuard",
    "com.minspy": "Minspy",
    "com.moniterro": "Moniterro",
    "com.imazing": "iMazing (accès données)",
    "com.fone.monitor": "FoneMonitor",
    "com.spymaster": "SpyMaster Pro",
    "com.parentalcontrolapp": "Parental Control (vérifier)",
    "net.kidslox": "Kidslox",
    "com.qustodio": "Qustodio",
    "com.familytime": "FamilyTime",
    "com.findmykids": "Find My Kids",
    "com.life360": "Life360 (partage localisation)",
    "com.familyorbit": "Family Orbit",
}

DANGEROUS_PERMISSIONS = {
    "kTCCServiceLocation": "Localisation GPS",
    "kTCCServiceCamera": "Caméra",
    "kTCCServiceMicrophone": "Microphone",
    "kTCCServiceContacts": "Contacts",
    "kTCCServiceCalendar": "Calendrier",
    "kTCCServiceReminders": "Rappels",
    "kTCCServicePhotos": "Photos",
    "kTCCServiceMediaLibrary": "Bibliothèque musicale",
    "kTCCServiceSpeechRecognition": "Reconnaissance vocale",
    "kTCCServiceScreenCapture": "Capture d'écran",
    "kTCCServiceUserTracking": "Pistage publicitaire",
}

SYSTEM_APPS_WHITELIST = {
    "com.apple.", "com.google.maps", "com.google.chrome",
    "com.facebook.Messenger", "com.ubercab", "com.spotify.client",
}

MDM_INDICATORS = [
    "PayloadType", "com.apple.mdm", "com.apple.managed",
    "com.apple.configuration", "PayloadContent",
]


# ---------------------------------------------------------------------------
# Localisation des sauvegardes iPhone
# ---------------------------------------------------------------------------

def find_iphone_backups() -> List[dict]:
    """Trouve les sauvegardes iPhone disponibles sur cette machine."""
    backup_paths = []

    if platform.system() == "Darwin":
        base = os.path.expanduser("~/Library/Application Support/MobileSync/Backup/")
    elif platform.system() == "Windows":
        base = os.path.join(
            os.environ.get("APPDATA", ""),
            "Apple Computer", "MobileSync", "Backup"
        )
    else:
        # Linux — possible via libimobiledevice
        base = os.path.expanduser("~/.cache/libimobiledevice/backup/")

    if not os.path.isdir(base):
        return []

    for entry in os.listdir(base):
        backup_dir = os.path.join(base, entry)
        info_plist = os.path.join(backup_dir, "Info.plist")
        manifest_plist = os.path.join(backup_dir, "Manifest.plist")

        if not os.path.isfile(manifest_plist):
            continue

        info = {}
        if os.path.isfile(info_plist):
            try:
                with open(info_plist, "rb") as f:
                    data = plistlib.load(f)
                info = {
                    "device_name": data.get("Device Name", "Inconnu"),
                    "product_name": data.get("Product Name", "Inconnu"),
                    "ios_version": data.get("Product Version", "Inconnu"),
                    "serial": data.get("Serial Number", "Inconnu"),
                    "last_backup": str(data.get("Last Backup Date", "Inconnu")),
                    "phone_number": data.get("Phone Number", "Inconnu"),
                }
            except Exception:
                pass

        try:
            with open(manifest_plist, "rb") as f:
                manifest = plistlib.load(f)
            info["encrypted"] = manifest.get("IsEncrypted", False)
        except Exception:
            info["encrypted"] = False

        backup_paths.append({
            "uuid": entry,
            "path": backup_dir,
            **info
        })

    return backup_paths


# ---------------------------------------------------------------------------
# Analyseur de sauvegarde iPhone
# ---------------------------------------------------------------------------

class IPhoneBackupAnalyzer:
    """Analyse une sauvegarde iPhone pour détecter des signes de surveillance."""

    def __init__(self, backup_path: str):
        self.backup_path = backup_path
        self.manifest_db = os.path.join(backup_path, "Manifest.db")

    def analyze(self) -> dict:
        findings: List[Finding] = []

        if not os.path.exists(self.backup_path):
            return {"error": "Chemin de sauvegarde introuvable"}

        if not os.path.exists(self.manifest_db):
            return {"error": "Manifest.db absent — sauvegarde corrompue ou chiffrée"}

        findings += self._check_installed_apps()
        findings += self._check_app_permissions()
        findings += self._check_mdm_profiles()
        findings += self._check_location_sharing()
        findings += self._check_screen_time()

        risk_counts = {r.value: 0 for r in RiskLevel}
        for f in findings:
            risk_counts[f.risk.value] += 1

        overall_risk = RiskLevel.LOW
        if risk_counts["critical"] > 0:
            overall_risk = RiskLevel.CRITICAL
        elif risk_counts["high"] > 0:
            overall_risk = RiskLevel.HIGH
        elif risk_counts["medium"] > 0:
            overall_risk = RiskLevel.MEDIUM

        return {
            "overall_risk": overall_risk.value,
            "risk_counts": risk_counts,
            "total_findings": len(findings),
            "findings": [f.to_dict() for f in findings],
        }

    def _get_db_file(self, domain: str, relative_path: str) -> Optional[str]:
        """Récupère le chemin réel d'un fichier dans la sauvegarde."""
        try:
            conn = sqlite3.connect(self.manifest_db)
            cur = conn.cursor()
            cur.execute(
                "SELECT fileID FROM Files WHERE domain=? AND relativePath=?",
                (domain, relative_path)
            )
            row = cur.fetchone()
            conn.close()
            if row:
                file_id = row[0]
                return os.path.join(self.backup_path, file_id[:2], file_id)
        except Exception:
            pass
        return None

    def _check_installed_apps(self) -> List[Finding]:
        """Liste les apps installées et détecte les stalkerware connus."""
        findings = []
        detected = []
        all_apps = []

        try:
            conn = sqlite3.connect(self.manifest_db)
            cur = conn.cursor()
            cur.execute("SELECT domain, relativePath FROM Files WHERE domain LIKE 'AppDomain%'")
            rows = cur.fetchall()
            conn.close()

            bundle_ids = set()
            for domain, _ in rows:
                if domain.startswith("AppDomain-"):
                    bundle_id = domain.replace("AppDomain-", "")
                    bundle_ids.add(bundle_id)

            for bundle_id in bundle_ids:
                app_name = KNOWN_IOS_STALKERWARE.get(bundle_id)
                if app_name:
                    detected.append(f"{bundle_id} → {app_name}")
                all_apps.append(bundle_id)

        except Exception as e:
            pass

        if detected:
            findings.append(Finding(
                category="Applications de surveillance",
                title="Application de pistage/surveillance détectée",
                description=(
                    "Une ou plusieurs applications connues pour leur capacité de surveillance "
                    "sont installées sur cet iPhone. Ces apps peuvent transmettre "
                    "la localisation, les messages et l'activité à un tiers."
                ),
                risk=RiskLevel.CRITICAL,
                evidence=detected,
                recommendation=(
                    "Désinstallez immédiatement ces applications. "
                    "Changez votre mot de passe Apple ID depuis un autre appareil. "
                    "Effectuez une réinitialisation complète de l'iPhone "
                    "(Réglages → Général → Transférer ou réinitialiser l'iPhone → Effacer)."
                )
            ))
        return findings

    def _check_app_permissions(self) -> List[Finding]:
        """Analyse les permissions d'accès à la localisation et autres données sensibles."""
        findings = []

        # Le fichier TCC.db contient les permissions
        tcc_path = self._get_db_file(
            "RootDomain", "Library/TCC/TCC.db"
        )
        if not tcc_path or not os.path.exists(tcc_path):
            # Essayer via AppDomain
            try:
                conn = sqlite3.connect(self.manifest_db)
                cur = conn.cursor()
                cur.execute(
                    "SELECT fileID FROM Files WHERE relativePath LIKE '%TCC.db%'"
                )
                rows = cur.fetchall()
                conn.close()
                for row in rows:
                    candidate = os.path.join(self.backup_path, row[0][:2], row[0])
                    if os.path.exists(candidate):
                        tcc_path = candidate
                        break
            except Exception:
                pass

        if not tcc_path or not os.path.exists(tcc_path):
            return []

        suspicious_perms = []
        try:
            # Copier pour éviter le lock
            tmp = tempfile.mktemp(suffix=".db")
            shutil.copy2(tcc_path, tmp)
            conn = sqlite3.connect(tmp)
            cur = conn.cursor()

            # iOS TCC schema
            try:
                cur.execute(
                    "SELECT service, client, auth_value FROM access WHERE auth_value=2"
                )
                rows = cur.fetchall()
                for service, client, _ in rows:
                    if service == "kTCCServiceLocation":
                        # Ignorer les apps système Apple
                        if not any(client.startswith(prefix)
                                   for prefix in SYSTEM_APPS_WHITELIST):
                            perm_label = DANGEROUS_PERMISSIONS.get(service, service)
                            is_stalker = client in KNOWN_IOS_STALKERWARE
                            suspicious_perms.append(
                                f"{'⛔ ' if is_stalker else ''}{client} → {perm_label}"
                            )
            except Exception:
                pass
            conn.close()
            os.unlink(tmp)
        except Exception:
            pass

        if suspicious_perms:
            findings.append(Finding(
                category="Permissions",
                title=f"{len(suspicious_perms)} app(s) avec accès à la localisation GPS",
                description=(
                    "Ces applications ont accès à la localisation GPS. "
                    "Vérifiez que vous reconnaissez toutes ces apps "
                    "et que leur accès est légitime."
                ),
                risk=RiskLevel.MEDIUM,
                evidence=suspicious_perms,
                recommendation=(
                    "Réglages → Confidentialité et sécurité → Service de localisation. "
                    "Passez chaque app en revue. Révoquez l'accès pour toute app non reconnue."
                )
            ))
        return findings

    def _check_mdm_profiles(self) -> List[Finding]:
        """Détecte les profils MDM (Mobile Device Management) installés."""
        findings = []

        # Chercher les profils de configuration
        mdm_files = []
        try:
            conn = sqlite3.connect(self.manifest_db)
            cur = conn.cursor()
            cur.execute(
                "SELECT fileID, relativePath FROM Files "
                "WHERE relativePath LIKE '%.mobileconfig' "
                "OR relativePath LIKE '%ConfigurationProfiles%' "
                "OR domain='RootDomain' AND relativePath LIKE '%MDM%'"
            )
            rows = cur.fetchall()
            conn.close()

            for file_id, rel_path in rows:
                fpath = os.path.join(self.backup_path, file_id[:2], file_id)
                if os.path.exists(fpath):
                    mdm_files.append((fpath, rel_path))
        except Exception:
            pass

        profile_details = []
        for fpath, rel_path in mdm_files:
            try:
                with open(fpath, "rb") as f:
                    data = plistlib.load(f)
                org = data.get("PayloadOrganization", "Inconnu")
                desc = data.get("PayloadDescription", "")
                name = data.get("PayloadDisplayName", rel_path)
                profile_details.append(
                    f"Profil: '{name}' — Organisation: {org} — {desc[:60]}"
                )
            except Exception:
                profile_details.append(f"Profil trouvé: {rel_path} (format binaire)")

        if profile_details:
            findings.append(Finding(
                category="Profils de configuration",
                title=f"{len(profile_details)} profil(s) MDM/configuration trouvé(s)",
                description=(
                    "Des profils de configuration sont installés sur cet iPhone. "
                    "Un profil MDM inconnu peut permettre à un tiers de surveiller "
                    "toutes les communications, installer des apps à distance, "
                    "lire les emails et intercepter le trafic HTTPS."
                ),
                risk=RiskLevel.CRITICAL,
                evidence=profile_details,
                recommendation=(
                    "Réglages → Général → VPN et gestion des appareils. "
                    "Supprimez tout profil que vous n'avez pas installé vous-même. "
                    "Un profil inconnu est un signe FORT d'espionnage."
                )
            ))
        return findings

    def _check_location_sharing(self) -> List[Finding]:
        """Vérifie les paramètres de partage de localisation."""
        findings = []
        # Chercher les préférences de Localisation dans la sauvegarde
        loc_pref_path = self._get_db_file(
            "RootDomain",
            "Library/Preferences/com.apple.locationd.plist"
        )
        if loc_pref_path and os.path.exists(loc_pref_path):
            try:
                with open(loc_pref_path, "rb") as f:
                    data = plistlib.load(f)
                # LocationServicesEnabled
                if not data.get("LocationServicesEnabled", True):
                    pass  # Location désactivée, pas de problème
            except Exception:
                pass

        # Chercher FindMy preferences
        findmy_path = self._get_db_file(
            "RootDomain",
            "Library/Preferences/com.apple.icloud.fmfd.plist"
        )
        if findmy_path and os.path.exists(findmy_path):
            try:
                with open(findmy_path, "rb") as f:
                    data = plistlib.load(f)
                share_my_location = data.get("ShareMyLocation", False)
                if share_my_location:
                    findings.append(Finding(
                        category="Partage de localisation",
                        title="Partage de localisation Find My activé",
                        description=(
                            "La fonctionnalité 'Partager ma position' est activée. "
                            "Des personnes dans votre liste Find My peuvent voir "
                            "votre position en temps réel."
                        ),
                        risk=RiskLevel.MEDIUM,
                        evidence=["com.apple.icloud.fmfd: ShareMyLocation = True"],
                        recommendation=(
                            "Réglages → [Votre nom] → Localiser → Partager ma position. "
                            "Vérifiez avec qui vous partagez votre position. "
                            "App Localiser → onglet 'Moi' → liste des personnes."
                        )
                    ))
            except Exception:
                pass

        return findings

    def _check_screen_time(self) -> List[Finding]:
        """Détecte si Screen Time est contrôlé par quelqu'un d'autre."""
        findings = []
        st_pref = self._get_db_file(
            "RootDomain",
            "Library/Preferences/com.apple.ScreenTime.plist"
        )
        if st_pref and os.path.exists(st_pref):
            try:
                with open(st_pref, "rb") as f:
                    data = plistlib.load(f)
                # Si Screen Time est géré par un compte parent
                managed_by = data.get("RestrictionsPasswordKey")
                family_managed = data.get("sf.managed", False)
                if managed_by or family_managed:
                    findings.append(Finding(
                        category="Contrôle parental / Screen Time",
                        title="Screen Time contrôlé par un compte externe",
                        description=(
                            "Le Screen Time de cet iPhone est verrouillé par un mot de passe "
                            "ou géré par un compte Partage familial. "
                            "Cette personne peut voir l'activité de l'appareil, "
                            "les apps utilisées et le temps d'écran."
                        ),
                        risk=RiskLevel.HIGH,
                        evidence=["Screen Time managé détecté dans com.apple.ScreenTime.plist"],
                        recommendation=(
                            "Réglages → Temps d'écran → Désactiver le temps d'écran. "
                            "Si un mot de passe vous est demandé que vous ne connaissez pas, "
                            "quelqu'un d'autre a configuré cette restriction."
                        )
                    ))
            except Exception:
                pass
        return findings


# ---------------------------------------------------------------------------
# Checklist manuelle iOS
# ---------------------------------------------------------------------------

IPHONE_MANUAL_CHECKLIST = [
    {
        "id": "find_my",
        "category": "Partage de localisation",
        "risk": "critical",
        "title": "Vérifier qui voit votre position dans Localiser",
        "steps": [
            "Ouvrir l'app <strong>Localiser</strong> (icône verte avec radar)",
            "Aller dans l'onglet <strong>Moi</strong> (en bas à droite)",
            "Vérifier <strong>Partager ma position</strong> → noter toutes les personnes listées",
            "Supprimer toute personne non reconnue en glissant à gauche sur son nom",
        ],
        "danger_sign": "Un nom inconnu dans la liste = cette personne voit votre position en temps réel"
    },
    {
        "id": "location_apps",
        "category": "Permissions GPS",
        "risk": "high",
        "title": "Auditer les apps avec accès GPS permanent",
        "steps": [
            "Réglages → <strong>Confidentialité et sécurité</strong>",
            "Appuyer sur <strong>Service de localisation</strong>",
            "Faire défiler la liste → noter toutes les apps en <strong>Toujours</strong>",
            "Changer en <strong>Jamais</strong> ou <strong>En utilisant l'app</strong> pour les apps non essentielles",
        ],
        "danger_sign": "Une app inconnue avec accès 'Toujours' à la localisation"
    },
    {
        "id": "mdm_profiles",
        "category": "Profils de configuration",
        "risk": "critical",
        "title": "Vérifier les profils MDM installés",
        "steps": [
            "Réglages → <strong>Général</strong>",
            "Faire défiler → chercher <strong>VPN et gestion des appareils</strong>",
            "Si cette option existe → appuyer dessus → lister tous les profils",
            "Tout profil dont vous ne connaissez pas l'origine doit être supprimé",
        ],
        "danger_sign": "Tout profil installé par une autre personne peut surveiller toutes vos communications"
    },
    {
        "id": "apple_id_sessions",
        "category": "Compte Apple ID",
        "risk": "critical",
        "title": "Vérifier les appareils connectés à votre Apple ID",
        "steps": [
            "Réglages → <strong>[Votre prénom]</strong> (en haut de l'écran)",
            "Faire défiler vers le bas → liste de tous les appareils connectés",
            "Appuyer sur chaque appareil inconnu → <strong>Supprimer du compte</strong>",
            "Aller sur <strong>appleid.apple.com</strong> depuis un autre appareil pour vérification complète",
        ],
        "danger_sign": "Un appareil inconnu connecté à votre Apple ID peut accéder à iCloud (photos, messages, localisation)"
    },
    {
        "id": "icloud_sharing",
        "category": "Partage iCloud",
        "risk": "high",
        "title": "Vérifier le Partage familial iCloud",
        "steps": [
            "Réglages → <strong>[Votre prénom]</strong> → <strong>Partage familial</strong>",
            "Vérifier la liste des membres de votre groupe familial",
            "Un membre du groupe peut voir votre localisation si vous la partagez",
            "Pour quitter : appuyer sur votre nom → <strong>Quitter la famille</strong>",
        ],
        "danger_sign": "Si le harceleur est dans votre groupe familial, il voit votre position automatiquement"
    },
    {
        "id": "airtag",
        "category": "Traceur physique",
        "risk": "critical",
        "title": "Rechercher un AirTag caché sur vous ou votre véhicule",
        "steps": [
            "L'iPhone 17 Pro vous alerte automatiquement si un AirTag inconnu vous suit",
            "Vérifier les notifications → <strong>AirTag détecté près de vous</strong>",
            "Réglages → Confidentialité → <strong>Suivi</strong>",
            "Inspecter physiquement : sous le véhicule, dans les affaires, les poches de vêtements",
            "Un AirTag ressemble à une pièce de monnaie blanche (3,2 cm de diamètre)",
        ],
        "danger_sign": "Notification 'AirTag détecté' = quelqu'un vous suit physiquement"
    },
    {
        "id": "screen_time",
        "category": "Contrôle parental",
        "risk": "high",
        "title": "Vérifier si Screen Time est contrôlé par quelqu'un",
        "steps": [
            "Réglages → <strong>Temps d'écran</strong>",
            "Si un cadenas apparaît ou si on vous demande un code que vous ne connaissez pas",
            "→ Quelqu'un d'autre a mis ce verrou sur votre téléphone",
            "Solution : effacement complet de l'iPhone (Réglages → Général → Réinitialiser)",
        ],
        "danger_sign": "Code Screen Time inconnu = quelqu'un surveille et contrôle votre téléphone"
    },
    {
        "id": "two_factor",
        "category": "Sécurité du compte",
        "risk": "high",
        "title": "Activer la double authentification Apple ID",
        "steps": [
            "Réglages → <strong>[Votre prénom]</strong> → <strong>Connexion et sécurité</strong>",
            "Vérifier que <strong>Authentification à deux facteurs</strong> est activée",
            "Changer le mot de passe Apple ID : appuyer sur <strong>Modifier</strong> sous 'Mot de passe'",
            "Choisir un mot de passe fort que personne d'autre ne connaît",
        ],
        "danger_sign": "Si la 2FA n'est pas activée, votre compte est vulnérable à l'accès non autorisé"
    },
    {
        "id": "wifi_history",
        "category": "Réseaux Wi-Fi",
        "risk": "medium",
        "title": "Vérifier l'historique des réseaux Wi-Fi mémorisés",
        "steps": [
            "Réglages → <strong>Wi-Fi</strong> → appuyer sur <strong>Modifier</strong>",
            "Lister les réseaux mémorisés → supprimer ceux que vous ne reconnaissez pas",
            "Un réseau Wi-Fi d'un lieu fréquenté peut révéler votre agenda",
        ],
        "danger_sign": "Des réseaux Wi-Fi inconnus mémorisés peuvent indiquer un accès passé au téléphone"
    },
]
