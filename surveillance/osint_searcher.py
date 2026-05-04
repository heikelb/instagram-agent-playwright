"""
Module OSINT — Recherche d'un username sur les sources publiques.
Vérifie uniquement les informations PUBLIQUEMENT accessibles.
"""

import time
import re
from typing import Optional
from dataclasses import dataclass, asdict

try:
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8",
}

TIMEOUT = 8


@dataclass
class PlatformResult:
    platform: str
    username: str
    url: str
    exists: bool
    public_info: dict
    error: Optional[str] = None

    def to_dict(self):
        return asdict(self)


def _make_session():
    s = requests.Session()
    retry = Retry(total=2, backoff_factor=0.5, status_forcelist=[429, 500, 502, 503])
    s.mount("https://", HTTPAdapter(max_retries=retry))
    s.headers.update(HEADERS)
    return s


# ---------------------------------------------------------------------------
# Vérificateurs par plateforme
# ---------------------------------------------------------------------------

def check_snapchat(username: str, session) -> PlatformResult:
    """
    Vérifie si un compte Snapchat public existe.
    Snapchat expose les profils publics via snapchat.com/add/<username>.
    """
    url = f"https://www.snapchat.com/add/{username}"
    result = PlatformResult(
        platform="Snapchat", username=username, url=url,
        exists=False, public_info={}
    )
    try:
        resp = session.get(url, timeout=TIMEOUT, allow_redirects=True)
        if resp.status_code == 200 and "Snapchat" in resp.text:
            # Chercher des infos dans la page
            display_name_match = re.search(
                r'"displayName"\s*:\s*"([^"]+)"', resp.text
            )
            bitmoji_match = re.search(
                r'"avatarImage"\s*:\s*"([^"]+)"', resp.text
            )
            result.exists = True
            result.public_info = {
                "display_name": display_name_match.group(1) if display_name_match else None,
                "has_bitmoji": bitmoji_match is not None,
                "profile_url": url,
            }
        else:
            result.exists = False
    except Exception as e:
        result.error = str(e)
    return result


def check_instagram(username: str, session) -> PlatformResult:
    url = f"https://www.instagram.com/{username}/"
    result = PlatformResult(
        platform="Instagram", username=username, url=url,
        exists=False, public_info={}
    )
    try:
        resp = session.get(url, timeout=TIMEOUT)
        if resp.status_code == 200:
            full_name = re.search(r'"full_name"\s*:\s*"([^"]+)"', resp.text)
            bio = re.search(r'"biography"\s*:\s*"([^"]*)"', resp.text)
            followers = re.search(r'"edge_followed_by".*?"count"\s*:\s*(\d+)', resp.text)
            is_private = re.search(r'"is_private"\s*:\s*(true|false)', resp.text)
            result.exists = True
            result.public_info = {
                "full_name": full_name.group(1) if full_name else None,
                "bio": bio.group(1) if bio else None,
                "followers": int(followers.group(1)) if followers else None,
                "is_private": is_private.group(1) == "true" if is_private else None,
            }
        elif resp.status_code == 404:
            result.exists = False
    except Exception as e:
        result.error = str(e)
    return result


def check_tiktok(username: str, session) -> PlatformResult:
    url = f"https://www.tiktok.com/@{username}"
    result = PlatformResult(
        platform="TikTok", username=username, url=url,
        exists=False, public_info={}
    )
    try:
        resp = session.get(url, timeout=TIMEOUT)
        if resp.status_code == 200 and "uniqueId" in resp.text:
            nickname = re.search(r'"nickname"\s*:\s*"([^"]+)"', resp.text)
            result.exists = True
            result.public_info = {
                "nickname": nickname.group(1) if nickname else None,
            }
        else:
            result.exists = False
    except Exception as e:
        result.error = str(e)
    return result


def check_twitter(username: str, session) -> PlatformResult:
    url = f"https://twitter.com/{username}"
    result = PlatformResult(
        platform="X (Twitter)", username=username, url=url,
        exists=False, public_info={}
    )
    try:
        resp = session.get(url, timeout=TIMEOUT)
        result.exists = resp.status_code == 200 and "twitter:site" in resp.text
        if result.exists:
            display = re.search(r'<title>([^<]+) on X</title>', resp.text)
            result.public_info = {
                "display_name": display.group(1).strip() if display else None,
            }
    except Exception as e:
        result.error = str(e)
    return result


def check_facebook(username: str, session) -> PlatformResult:
    url = f"https://www.facebook.com/{username}"
    result = PlatformResult(
        platform="Facebook", username=username, url=url,
        exists=False, public_info={}
    )
    try:
        resp = session.get(url, timeout=TIMEOUT)
        if resp.status_code == 200 and "facebook" in resp.url:
            og_title = re.search(r'property="og:title"\s+content="([^"]+)"', resp.text)
            result.exists = og_title is not None
            result.public_info = {
                "display_name": og_title.group(1) if og_title else None,
            }
    except Exception as e:
        result.error = str(e)
    return result


def check_github(username: str, session) -> PlatformResult:
    url = f"https://github.com/{username}"
    result = PlatformResult(
        platform="GitHub", username=username, url=url,
        exists=False, public_info={}
    )
    try:
        resp = session.get(url, timeout=TIMEOUT)
        if resp.status_code == 200:
            name = re.search(r'itemprop="name"\s*>\s*([^<]+)', resp.text)
            result.exists = True
            result.public_info = {"display_name": name.group(1).strip() if name else None}
        else:
            result.exists = False
    except Exception as e:
        result.error = str(e)
    return result


def check_reddit(username: str, session) -> PlatformResult:
    url = f"https://www.reddit.com/user/{username}"
    result = PlatformResult(
        platform="Reddit", username=username, url=url,
        exists=False, public_info={}
    )
    try:
        resp = session.get(url + "/about.json", timeout=TIMEOUT)
        if resp.status_code == 200:
            data = resp.json().get("data", {})
            result.exists = True
            result.public_info = {
                "display_name": data.get("name"),
                "created_utc": data.get("created_utc"),
                "karma": data.get("total_karma"),
            }
        else:
            result.exists = False
    except Exception as e:
        result.error = str(e)
    return result


# ---------------------------------------------------------------------------
# Recherche croisée Google publique
# ---------------------------------------------------------------------------

def build_google_dork(username: str) -> dict:
    """
    Génère des requêtes Google Dork pour rechercher manuellement le username.
    Retourne des URLs cliquables — la recherche est faite par l'utilisateur.
    """
    import urllib.parse
    queries = {
        "Recherche directe": f'"{username}"',
        "Snapchat + username": f'site:snapchat.com "{username}"',
        "Toutes plateformes": f'"{username}" (snapchat OR instagram OR facebook OR tiktok)',
        "Email probable": f'"{username}" (gmail.com OR yahoo.fr OR hotmail.fr OR icloud.com)',
        "Nom réel probable": f'"{username}" (prénom OR nom OR prenom)',
    }
    return {
        label: f"https://www.google.com/search?q={urllib.parse.quote(q)}"
        for label, q in queries.items()
    }


# ---------------------------------------------------------------------------
# Fonction principale
# ---------------------------------------------------------------------------

def osint_search(username: str, platforms: list = None) -> dict:
    """
    Lance la recherche OSINT sur un username donné.
    Vérifie uniquement les informations publiquement accessibles.
    """
    if not REQUESTS_AVAILABLE:
        return {"error": "Module requests non disponible", "results": []}

    if platforms is None:
        platforms = ["snapchat", "instagram", "tiktok", "twitter", "facebook", "github", "reddit"]

    checkers = {
        "snapchat":  check_snapchat,
        "instagram": check_instagram,
        "tiktok":    check_tiktok,
        "twitter":   check_twitter,
        "facebook":  check_facebook,
        "github":    check_github,
        "reddit":    check_reddit,
    }

    session = _make_session()
    results = []
    found_on = []

    for platform in platforms:
        checker = checkers.get(platform.lower())
        if not checker:
            continue
        result = checker(username, session)
        results.append(result.to_dict())
        if result.exists:
            found_on.append(platform)
        time.sleep(0.5)  # Respecter les rate limits

    google_dorks = build_google_dork(username)

    # Analyser les résultats pour déduire des infos sur l'identité
    identity_clues = _extract_identity_clues(username, results)

    return {
        "username": username,
        "found_on": found_on,
        "results": results,
        "google_dorks": google_dorks,
        "identity_clues": identity_clues,
    }


def _extract_identity_clues(username: str, results: list) -> list:
    """Extrait des indices d'identité des résultats OSINT."""
    clues = []
    names_found = set()

    for r in results:
        if not r.get("exists"):
            continue
        info = r.get("public_info", {})
        display_name = info.get("display_name") or info.get("nickname")
        if display_name and display_name.lower() != username.lower():
            names_found.add(display_name)

    if names_found:
        for name in names_found:
            clues.append({
                "type": "Nom d'affichage",
                "value": name,
                "interpretation": (
                    f"Ce compte utilise le nom '{name}'. "
                    "Peut être le vrai prénom/nom ou un pseudonyme récurrent."
                )
            })

    # Analyser le username lui-même pour des indices
    year_match = re.search(r'(19[6-9]\d|200[0-9]|201[0-9])', username)
    if year_match:
        clues.append({
            "type": "Année dans le username",
            "value": year_match.group(1),
            "interpretation": f"Probable année de naissance : {year_match.group(1)}"
        })

    words = re.findall(r'[a-zA-ZÀ-ÿ]{3,}', username)
    for word in words:
        if len(word) >= 4:
            clues.append({
                "type": "Mot dans le username",
                "value": word,
                "interpretation": f"'{word}' peut être un prénom, surnom ou passion."
            })

    return clues
