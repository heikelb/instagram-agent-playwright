"""Récolte des bijoutiers/joailliers Lyon + Dijon via l'API publique SIRENE.

Source: https://recherche-entreprises.api.gouv.fr (open data, sans auth, sans rate-limit officiel mais on temporise).

NAF visés:
  - 32.13Z : Fabrication d'articles de joaillerie et bijouterie (cible prioritaire pour apprentissage)
  - 47.77Z : Commerce de détail d'articles d'horlogerie et de bijouterie

Communes:
  - Lyon : codes INSEE 69381 à 69389 (1er au 9e arrondissement)
  - Dijon : 21231

Usage:
  python scripts/fetch_sirene.py --output ../prospects_sirene.csv

Le CSV produit suit le même schéma que candidatures.csv pour permettre la fusion manuelle.
"""

from __future__ import annotations

import argparse
import csv
import sys
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

API = "https://recherche-entreprises.api.gouv.fr/search"

NAF_CODES = ["32.13Z", "47.77Z"]
LYON_COMMUNES = [f"6938{i}" for i in range(1, 10)]
DIJON_COMMUNES = ["21231"]
COMMUNES = {"Lyon": LYON_COMMUNES, "Dijon": DIJON_COMMUNES}

CSV_HEADERS = [
    "nom", "ville", "code_postal", "adresse",
    "telephone", "email", "site_web",
    "statut", "date_premier_contact", "date_relance", "canal", "notes",
]


def fetch_page(naf: str, commune: str, page: int, max_retries: int = 5) -> dict:
    params = {
        "activite_principale": naf,
        "code_commune": commune,
        "etat_administratif": "A",
        "per_page": 25,
        "page": page,
    }
    url = f"{API}?{urlencode(params)}"
    req = Request(url, headers={"User-Agent": "candidature-apprentissage-bijouterie/1.0"})
    backoff = 2
    for attempt in range(max_retries):
        try:
            with urlopen(req, timeout=15) as r:
                import json
                return json.load(r)
        except HTTPError as e:
            if e.code == 429 and attempt < max_retries - 1:
                time.sleep(backoff)
                backoff *= 2
                continue
            raise


def fetch_all(naf: str, commune: str) -> list[dict]:
    out = []
    page = 1
    while True:
        try:
            data = fetch_page(naf, commune, page)
        except (HTTPError, URLError) as e:
            print(f"  ! erreur {naf}/{commune} page {page}: {e}", file=sys.stderr)
            break
        results = data.get("results", [])
        out.extend(results)
        total_pages = data.get("total_pages", 1)
        if page >= total_pages or not results:
            break
        page += 1
        time.sleep(1.2)
    return out


def to_rows(entreprise: dict, ville_label: str) -> list[dict]:
    """Un établissement correspondant = une ligne (un même SIREN peut avoir 2 boutiques à Lyon)."""
    matches = entreprise.get("matching_etablissements") or []
    if not matches:
        return []
    siege = entreprise.get("siege") or {}
    enseignes_siege = siege.get("liste_enseignes") or []
    nom_base = (
        (enseignes_siege[0] if enseignes_siege else None)
        or siege.get("nom_commercial")
        or entreprise.get("nom_complet")
        or entreprise.get("nom_raison_sociale")
        or ""
    )
    siren = entreprise.get("siren", "")
    rows = []
    for etab in matches:
        if etab.get("etat_administratif") != "A":
            continue
        enseignes = etab.get("liste_enseignes") or []
        nom = (enseignes[0] if enseignes else None) or etab.get("nom_commercial") or nom_base
        adresse = etab.get("adresse", "") or ""
        code_postal = etab.get("code_postal", "") or ""
        if code_postal and code_postal in adresse:
            adresse_short = adresse.split(code_postal)[0].strip().rstrip(",")
        else:
            adresse_short = adresse
        naf = etab.get("activite_principale", "")
        note = f"NAF {naf} - SIREN {siren}"
        if etab.get("date_creation"):
            note += f" - créée {etab['date_creation']}"
        rows.append({
            "nom": nom.title() if nom.isupper() else nom,
            "ville": ville_label,
            "code_postal": code_postal,
            "adresse": adresse_short,
            "telephone": "",
            "email": "",
            "site_web": "",
            "statut": "à contacter",
            "date_premier_contact": "",
            "date_relance": "",
            "canal": "",
            "notes": note,
            "_siret": etab.get("siret", ""),
        })
    return rows


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="prospects_sirene.csv")
    args = parser.parse_args()

    seen_siret = set()
    rows: list[dict] = []
    for ville_label, communes in COMMUNES.items():
        for commune in communes:
            for naf in NAF_CODES:
                print(f"  -> {ville_label} ({commune}) NAF {naf}…")
                entreprises = fetch_all(naf, commune)
                for e in entreprises:
                    for row in to_rows(e, ville_label):
                        siret = row.pop("_siret", None)
                        if siret and siret in seen_siret:
                            continue
                        if siret:
                            seen_siret.add(siret)
                        rows.append(row)

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        w.writeheader()
        w.writerows(rows)
    print(f"\nÉcrit {len(rows)} entreprises dans {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
