"""
Surveillance Detection Engine
Détecte les signes d'écoute, d'espionnage ou d'accès non autorisé à un système.
"""

import os
import platform
import socket
import subprocess
import json
import datetime
import re
from dataclasses import dataclass, field, asdict
from typing import List, Optional
from enum import Enum

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class Finding:
    category: str
    title: str
    description: str
    risk: RiskLevel
    evidence: List[str] = field(default_factory=list)
    recommendation: str = ""

    def to_dict(self):
        d = asdict(self)
        d["risk"] = self.risk.value
        return d


# ---------------------------------------------------------------------------
# Base de données de menaces connues
# ---------------------------------------------------------------------------

KNOWN_STALKERWARE_PROCESSES = {
    "mspy", "mspyagent", "flexispy", "flexispyagent", "spyic", "cocospy",
    "hoverwatch", "ikeymonitor", "xnspy", "cerberus", "spyfone", "spybubble",
    "phonesheriff", "netspy", "highstermobile", "familyorbit", "kidlogger",
    "spyera", "thedogwatcher", "safeguarde", "moniterro", "parentalapp",
    "eyezy", "clevguard", "minspy", "spyzie", "umobix", "famisafe",
    "gpswatcher", "trackview", "keylogger", "kspy", "spymaster",
    "girlfriendspy", "wifisniffer", "netcut",
}

KNOWN_SURVEILLANCE_PROCESSES = {
    "wireshark", "tcpdump", "ettercap", "kismet", "aircrack",
    "mitmproxy", "bettercap", "arpspoof", "dsniff", "sslstrip",
    "responder", "ntopng", "zeek", "suricata", "snort",
}

SUSPICIOUS_PORTS = {
    4444: "Metasploit Meterpreter",
    5555: "Android ADB (accès distant possible)",
    6666: "RAT (Outil d'Administration Distante) courant",
    6667: "IRC (souvent utilisé par des botnets)",
    7777: "RAT courant",
    8080: "Proxy potentiel",
    9090: "Proxy/RAT courant",
    31337: "Back Orifice (RAT historique)",
    12345: "NetBus (RAT)",
    54321: "RAT courant",
    1080: "SOCKS Proxy",
    3389: "RDP — accès bureau à distance",
    5900: "VNC — accès bureau à distance",
    22: "SSH — vérifier si attendu",
}

SUSPICIOUS_DOMAINS_KEYWORDS = {
    "track", "spy", "monitor", "surveil", "keylog", "remote-access",
    "stealth", "hidden", "invisible", "ghost", "shadow", "intercept",
    "wiretap", "sniff", "packet", "capture",
}

KNOWN_SURVEILLANCE_IPS = {
    # Plages connues de sociétés de surveillance commerciale (exemples publics)
    # Ces données proviennent de rapports publics (Citizen Lab, EFF, etc.)
    "185.220.101": "Tor Exit Node connu",
    "185.220.102": "Tor Exit Node connu",
    "199.249.230": "Tor Exit Node connu",
}

SAFE_DNS_SERVERS = [
    ("8.8.8.8", "Google DNS"),
    ("1.1.1.1", "Cloudflare DNS"),
    ("9.9.9.9", "Quad9 DNS"),
]


# ---------------------------------------------------------------------------
# Scanners
# ---------------------------------------------------------------------------

class NetworkScanner:
    """Analyse les connexions réseau pour détecter des activités suspectes."""

    def scan(self) -> List[Finding]:
        findings = []
        if not PSUTIL_AVAILABLE:
            return [Finding(
                category="Réseau",
                title="Module psutil non disponible",
                description="Installez psutil pour l'analyse réseau complète.",
                risk=RiskLevel.LOW,
                recommendation="pip install psutil"
            )]

        findings += self._check_connections()
        findings += self._check_listening_ports()
        findings += self._check_dns_hijacking()
        findings += self._check_network_interfaces()
        return findings

    def _check_connections(self) -> List[Finding]:
        findings = []
        try:
            connections = psutil.net_connections(kind="inet")
            suspicious = []
            for conn in connections:
                if conn.status != "ESTABLISHED":
                    continue
                if not conn.raddr:
                    continue
                remote_ip = conn.raddr.ip
                remote_port = conn.raddr.port

                # Vérifier si l'IP correspond à une plage suspecte connue
                for prefix, label in KNOWN_SURVEILLANCE_IPS.items():
                    if remote_ip.startswith(prefix):
                        suspicious.append(f"{remote_ip}:{remote_port} → {label}")

                # Vérifier les ports distants sensibles
                if remote_port in SUSPICIOUS_PORTS:
                    try:
                        proc = psutil.Process(conn.pid) if conn.pid else None
                        proc_name = proc.name() if proc else "inconnu"
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        proc_name = "inconnu"
                    suspicious.append(
                        f"{remote_ip}:{remote_port} ({SUSPICIOUS_PORTS[remote_port]}) "
                        f"← processus: {proc_name}"
                    )

            if suspicious:
                findings.append(Finding(
                    category="Réseau",
                    title="Connexions réseau suspectes détectées",
                    description=(
                        f"{len(suspicious)} connexion(s) potentiellement suspecte(s) "
                        "vers des ports ou IPs associés à des outils de surveillance."
                    ),
                    risk=RiskLevel.HIGH,
                    evidence=suspicious,
                    recommendation=(
                        "Vérifiez chaque connexion. Bloquez les connexions non reconnues "
                        "via votre pare-feu. Identifiez le processus source."
                    )
                ))
        except Exception as e:
            findings.append(Finding(
                category="Réseau",
                title="Erreur d'analyse des connexions",
                description=str(e),
                risk=RiskLevel.LOW,
            ))
        return findings

    def _check_listening_ports(self) -> List[Finding]:
        findings = []
        try:
            connections = psutil.net_connections(kind="inet")
            exposed = []
            for conn in connections:
                if conn.status == "LISTEN":
                    port = conn.laddr.port
                    if port in SUSPICIOUS_PORTS:
                        try:
                            proc = psutil.Process(conn.pid) if conn.pid else None
                            proc_name = proc.name() if proc else "inconnu"
                        except (psutil.NoSuchProcess, psutil.AccessDenied):
                            proc_name = "inconnu"
                        exposed.append(
                            f"Port {port} ({SUSPICIOUS_PORTS[port]}) "
                            f"— processus: {proc_name}"
                        )
            if exposed:
                findings.append(Finding(
                    category="Réseau",
                    title="Ports suspects en écoute sur votre machine",
                    description=(
                        "Des ports associés à des outils d'accès distant ou de surveillance "
                        "sont actifs sur cette machine."
                    ),
                    risk=RiskLevel.CRITICAL,
                    evidence=exposed,
                    recommendation=(
                        "Fermez immédiatement ces ports si vous ne reconnaissez pas les services. "
                        "Vérifiez si un RAT (Remote Access Tool) est installé."
                    )
                ))
        except Exception as e:
            pass
        return findings

    def _check_dns_hijacking(self) -> List[Finding]:
        """Vérifie si le DNS est détourné en comparant plusieurs résolveurs."""
        findings = []
        test_domain = "google.com"
        results = {}

        # Résolution via le DNS système
        try:
            local_ip = socket.gethostbyname(test_domain)
            results["système"] = local_ip
        except Exception:
            local_ip = None

        # Résolution via DNS alternatifs fiables
        if REQUESTS_AVAILABLE:
            for dns_ip, dns_name in SAFE_DNS_SERVERS[:2]:
                try:
                    resp = requests.get(
                        f"https://dns.google/resolve?name={test_domain}&type=A",
                        timeout=5
                    )
                    data = resp.json()
                    answers = [r["data"] for r in data.get("Answer", []) if r.get("type") == 1]
                    if answers:
                        results[dns_name] = answers[0]
                except Exception:
                    pass

        if local_ip and len(results) > 1:
            # Vérifier si le DNS local retourne quelque chose de très différent
            known_ips = [v for k, v in results.items() if k != "système"]
            if known_ips and not any(local_ip == ip for ip in known_ips):
                findings.append(Finding(
                    category="Réseau",
                    title="Possible détournement DNS (DNS Hijacking)",
                    description=(
                        f"Le DNS local résout '{test_domain}' en {local_ip}, "
                        f"mais des résolveurs sécurisés retournent {known_ips}. "
                        "Cela peut indiquer une interception du trafic."
                    ),
                    risk=RiskLevel.CRITICAL,
                    evidence=[f"{k}: {v}" for k, v in results.items()],
                    recommendation=(
                        "Changez vos serveurs DNS manuellement (1.1.1.1 ou 8.8.8.8). "
                        "Vérifiez la configuration de votre routeur. "
                        "Un MITM (man-in-the-middle) est possible."
                    )
                ))

        return findings

    def _check_network_interfaces(self) -> List[Finding]:
        """Détecte les interfaces en mode promiscuous (capture de trafic)."""
        findings = []
        try:
            if platform.system() == "Linux":
                result = subprocess.run(
                    ["ip", "link", "show"], capture_output=True, text=True, timeout=5
                )
                promisc_ifaces = []
                for line in result.stdout.splitlines():
                    if "PROMISC" in line:
                        match = re.search(r"^\d+:\s+(\S+):", line)
                        if match:
                            promisc_ifaces.append(match.group(1))

                if promisc_ifaces:
                    findings.append(Finding(
                        category="Réseau",
                        title="Interface réseau en mode promiscuous",
                        description=(
                            "Une interface réseau en mode promiscuous capture TOUT le trafic "
                            "réseau, y compris celui destiné à d'autres machines. "
                            "Cela indique qu'un outil de capture de paquets est actif."
                        ),
                        risk=RiskLevel.CRITICAL,
                        evidence=[f"Interface: {i}" for i in promisc_ifaces],
                        recommendation=(
                            "Vérifiez qui a activé ce mode. Désactivez-le si non autorisé: "
                            "ip link set <interface> promisc off"
                        )
                    ))
        except Exception:
            pass
        return findings

    def get_active_connections_table(self) -> List[dict]:
        """Retourne toutes les connexions actives pour affichage."""
        if not PSUTIL_AVAILABLE:
            return []
        connections = []
        try:
            for conn in psutil.net_connections(kind="inet"):
                if conn.status not in ("ESTABLISHED", "LISTEN"):
                    continue
                try:
                    proc = psutil.Process(conn.pid) if conn.pid else None
                    proc_name = proc.name() if proc else "-"
                    proc_exe = proc.exe() if proc else "-"
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    proc_name = "inconnu"
                    proc_exe = "-"

                laddr = f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "-"
                raddr = f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "-"
                is_suspicious = (
                    (conn.raddr and conn.raddr.port in SUSPICIOUS_PORTS) or
                    (conn.laddr and conn.laddr.port in SUSPICIOUS_PORTS and conn.status == "LISTEN") or
                    any(conn.raddr and conn.raddr.ip.startswith(p) for p in KNOWN_SURVEILLANCE_IPS)
                ) if conn.raddr or (conn.laddr and conn.status == "LISTEN") else False

                connections.append({
                    "local": laddr,
                    "remote": raddr,
                    "status": conn.status,
                    "pid": conn.pid or "-",
                    "process": proc_name,
                    "suspicious": is_suspicious,
                    "note": SUSPICIOUS_PORTS.get(conn.raddr.port if conn.raddr else 0, "")
                           or SUSPICIOUS_PORTS.get(conn.laddr.port if conn.laddr else 0, "")
                })
        except Exception:
            pass
        return connections


class ProcessScanner:
    """Analyse les processus en cours pour détecter des logiciels espions."""

    def scan(self) -> List[Finding]:
        findings = []
        if not PSUTIL_AVAILABLE:
            return findings

        findings += self._check_stalkerware()
        findings += self._check_surveillance_tools()
        findings += self._check_screen_capture()
        findings += self._check_suspicious_hidden_processes()
        return findings

    def _get_all_processes(self) -> List[dict]:
        processes = []
        for proc in psutil.process_iter(["pid", "name", "exe", "cmdline", "username"]):
            try:
                info = proc.info
                processes.append({
                    "pid": info["pid"],
                    "name": (info["name"] or "").lower(),
                    "exe": info["exe"] or "",
                    "cmdline": " ".join(info["cmdline"] or []),
                    "username": info["username"] or "",
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        return processes

    def _check_stalkerware(self) -> List[Finding]:
        findings = []
        detected = []
        processes = self._get_all_processes()
        for proc in processes:
            name_lower = proc["name"].replace(".exe", "").replace("-", "").replace("_", "")
            for stalker in KNOWN_STALKERWARE_PROCESSES:
                if stalker in name_lower or stalker in proc["cmdline"].lower():
                    detected.append(
                        f"PID {proc['pid']}: {proc['name']} (utilisateur: {proc['username']})"
                    )
                    break
        if detected:
            findings.append(Finding(
                category="Logiciels espions",
                title="Stalkerware / Spyware connu détecté",
                description=(
                    "Des processus correspondant à des logiciels espions connus "
                    "sont actifs sur ce système. Ces outils peuvent enregistrer "
                    "vos frappes clavier, captures d'écran, messages et localisation."
                ),
                risk=RiskLevel.CRITICAL,
                evidence=detected,
                recommendation=(
                    "Terminez immédiatement ces processus (kill -9 <PID>). "
                    "Supprimez le logiciel. Changez tous vos mots de passe depuis "
                    "un autre appareil. Envisagez une réinstallation complète du système."
                )
            ))
        return findings

    def _check_surveillance_tools(self) -> List[Finding]:
        findings = []
        detected = []
        processes = self._get_all_processes()
        for proc in processes:
            name_lower = proc["name"].replace(".exe", "")
            for tool in KNOWN_SURVEILLANCE_PROCESSES:
                if tool in name_lower:
                    detected.append(
                        f"PID {proc['pid']}: {proc['name']} (utilisateur: {proc['username']})"
                    )
                    break
        if detected:
            findings.append(Finding(
                category="Outils réseau",
                title="Outil de capture/analyse réseau actif",
                description=(
                    "Un outil d'interception ou d'analyse du trafic réseau est en cours d'exécution. "
                    "Si vous ne l'avez pas lancé vous-même, quelqu'un surveille votre trafic."
                ),
                risk=RiskLevel.HIGH,
                evidence=detected,
                recommendation=(
                    "Vérifiez qui a lancé cet outil. "
                    "Si non autorisé, terminez le processus et auditez les accès au système."
                )
            ))
        return findings

    def _check_screen_capture(self) -> List[Finding]:
        """Détecte les outils de capture d'écran/enregistrement à distance."""
        findings = []
        screen_tools = {
            "vnc": "VNC (accès bureau à distance)",
            "x11vnc": "X11VNC (partage d'écran Linux)",
            "xrdp": "XRDP (bureau à distance)",
            "teamviewer": "TeamViewer (accès à distance)",
            "anydesk": "AnyDesk (accès à distance)",
            "screenshare": "Partage d'écran",
            "recordmydesktop": "Enregistrement écran",
            "simplescreenrecorder": "Enregistrement écran",
            "obs": "OBS Studio (peut enregistrer l'écran)",
        }
        if not PSUTIL_AVAILABLE:
            return findings

        detected = []
        processes = self._get_all_processes()
        for proc in processes:
            name_lower = proc["name"].lower().replace(".exe", "").replace("-", "").replace("_", "")
            for tool_key, tool_label in screen_tools.items():
                if tool_key in name_lower:
                    detected.append(
                        f"PID {proc['pid']}: {proc['name']} → {tool_label} "
                        f"(utilisateur: {proc['username']})"
                    )
                    break
        if detected:
            findings.append(Finding(
                category="Accès à distance",
                title="Outil d'accès/enregistrement à distance détecté",
                description=(
                    "Un ou plusieurs outils permettant l'accès à distance ou "
                    "l'enregistrement de votre écran sont actifs."
                ),
                risk=RiskLevel.HIGH,
                evidence=detected,
                recommendation=(
                    "Vérifiez que vous avez autorisé ces outils. "
                    "Désactivez tout accès à distance non souhaité."
                )
            ))
        return findings

    def _check_suspicious_hidden_processes(self) -> List[Finding]:
        """Vérifie les processus sans nom visible ou avec des noms masqués."""
        findings = []
        if not PSUTIL_AVAILABLE or platform.system() != "Linux":
            return findings

        suspicious = []
        try:
            for proc in psutil.process_iter(["pid", "name", "exe", "cmdline"]):
                try:
                    info = proc.info
                    name = info.get("name") or ""
                    exe = info.get("exe") or ""
                    cmdline = info.get("cmdline") or []

                    # Processus sans nom ni exe
                    if not name and not exe and proc.pid > 100:
                        suspicious.append(f"PID {proc.pid}: processus sans nom ni chemin")

                    # Processus dont le binaire a été supprimé (technique anti-forensique)
                    if exe and not os.path.exists(exe) and proc.pid > 100:
                        suspicious.append(
                            f"PID {proc.pid} ({name}): binaire supprimé → {exe} (introuvable)"
                        )
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
        except Exception:
            pass

        if suspicious:
            findings.append(Finding(
                category="Logiciels espions",
                title="Processus cachés ou furtifs détectés",
                description=(
                    "Des processus suspects ont été trouvés: binaires supprimés après lancement "
                    "(technique classique des malwares pour éviter la détection)."
                ),
                risk=RiskLevel.CRITICAL,
                evidence=suspicious,
                recommendation=(
                    "Analysez ces processus immédiatement. "
                    "Un processus dont le binaire a été supprimé est un signe fort de malware. "
                    "Dumper la mémoire du processus pour analyse forensique."
                )
            ))
        return findings

    def get_processes_table(self) -> List[dict]:
        """Retourne la liste des processus pour affichage."""
        if not PSUTIL_AVAILABLE:
            return []
        results = []
        for proc in self._get_all_processes():
            name_lower = proc["name"].replace(".exe", "").replace("-", "").replace("_", "")
            is_suspicious = any(s in name_lower for s in KNOWN_STALKERWARE_PROCESSES) or \
                            any(s in name_lower for s in KNOWN_SURVEILLANCE_PROCESSES)
            if is_suspicious:
                results.append({**proc, "suspicious": True})
        return results


class SystemIntegrityChecker:
    """Vérifie l'intégrité du système: fichiers hosts, cron, accès SSH, etc."""

    def scan(self) -> List[Finding]:
        findings = []
        findings += self._check_hosts_file()
        findings += self._check_cron_jobs()
        findings += self._check_ssh_authorized_keys()
        findings += self._check_sudoers()
        findings += self._check_startup_services()
        return findings

    def _check_hosts_file(self) -> List[Finding]:
        """Vérifie si le fichier hosts est manipulé (redirection de domaines)."""
        findings = []
        hosts_path = "/etc/hosts" if platform.system() != "Windows" else r"C:\Windows\System32\drivers\etc\hosts"
        try:
            with open(hosts_path, "r") as f:
                lines = f.readlines()

            suspicious_entries = []
            for line in lines:
                line = line.strip()
                if line.startswith("#") or not line:
                    continue
                parts = line.split()
                if len(parts) >= 2:
                    ip = parts[0]
                    domains = parts[1:]
                    # Chercher des domaines légitimes redirigés vers des IPs locales inattendues
                    for domain in domains:
                        if any(legit in domain for legit in [
                            "google", "facebook", "apple", "microsoft", "amazon",
                            "twitter", "instagram", "paypal", "bank"
                        ]):
                            if ip not in ("127.0.0.1", "::1", "0.0.0.0"):
                                suspicious_entries.append(f"{ip} → {domain}")

            if suspicious_entries:
                findings.append(Finding(
                    category="Intégrité système",
                    title="Fichier hosts manipulé — redirection de domaines",
                    description=(
                        "Le fichier /etc/hosts redirige des domaines légitimes vers des IPs "
                        "inconnues. Cela peut être utilisé pour intercepter vos communications "
                        "ou vous rediriger vers des sites de phishing."
                    ),
                    risk=RiskLevel.CRITICAL,
                    evidence=suspicious_entries,
                    recommendation=(
                        "Restaurez le fichier hosts à sa version d'origine. "
                        "Supprimez toutes les entrées non reconnues. "
                        "Vérifiez si d'autres fichiers système ont été modifiés."
                    )
                ))
        except PermissionError:
            pass
        except Exception:
            pass
        return findings

    def _check_cron_jobs(self) -> List[Finding]:
        """Cherche des tâches cron suspectes."""
        findings = []
        if platform.system() == "Windows":
            return findings

        cron_dirs = [
            "/etc/cron.d", "/etc/cron.daily", "/etc/cron.hourly",
            "/etc/cron.weekly", "/etc/cron.monthly"
        ]
        suspicious_scripts = []
        spy_keywords = ["spy", "monitor", "track", "keylog", "exfil", "upload",
                        "wget", "curl", "nc ", "ncat", "bash -i", "/dev/tcp"]

        for cron_dir in cron_dirs:
            if not os.path.isdir(cron_dir):
                continue
            for fname in os.listdir(cron_dir):
                fpath = os.path.join(cron_dir, fname)
                try:
                    with open(fpath, "r") as f:
                        content = f.read().lower()
                    for kw in spy_keywords:
                        if kw in content:
                            suspicious_scripts.append(f"{fpath} (contient: '{kw}')")
                            break
                except Exception:
                    pass

        # Vérifier crontab utilisateur courant
        try:
            result = subprocess.run(
                ["crontab", "-l"], capture_output=True, text=True, timeout=5
            )
            content = result.stdout.lower()
            for kw in spy_keywords:
                if kw in content:
                    suspicious_scripts.append(f"crontab utilisateur (contient: '{kw}')")
                    break
        except Exception:
            pass

        if suspicious_scripts:
            findings.append(Finding(
                category="Intégrité système",
                title="Tâches planifiées (cron) suspectes",
                description=(
                    "Des tâches planifiées contiennent des commandes associées "
                    "à l'exfiltration de données ou à la surveillance."
                ),
                risk=RiskLevel.HIGH,
                evidence=suspicious_scripts,
                recommendation=(
                    "Examinez et supprimez les tâches cron non reconnues. "
                    "Vérifiez l'historique d'exécution de ces scripts."
                )
            ))
        return findings

    def _check_ssh_authorized_keys(self) -> List[Finding]:
        """Vérifie si des clés SSH non autorisées ont été ajoutées."""
        findings = []
        if platform.system() == "Windows":
            return findings

        home = os.path.expanduser("~")
        auth_keys_path = os.path.join(home, ".ssh", "authorized_keys")

        if not os.path.exists(auth_keys_path):
            return findings

        try:
            with open(auth_keys_path, "r") as f:
                keys = [line.strip() for line in f if line.strip() and not line.startswith("#")]

            if len(keys) > 0:
                findings.append(Finding(
                    category="Accès distant",
                    title=f"{len(keys)} clé(s) SSH autorisée(s) sur ce compte",
                    description=(
                        "Des clés SSH permettent une connexion sans mot de passe. "
                        "Vérifiez que vous reconnaissez toutes ces clés."
                    ),
                    risk=RiskLevel.MEDIUM if len(keys) <= 2 else RiskLevel.HIGH,
                    evidence=[k[:80] + "..." if len(k) > 80 else k for k in keys],
                    recommendation=(
                        "Supprimez toute clé SSH que vous ne reconnaissez pas. "
                        "Une clé inconnue signifie qu'une personne peut se connecter "
                        "à votre machine sans mot de passe."
                    )
                ))
        except Exception:
            pass
        return findings

    def _check_sudoers(self) -> List[Finding]:
        """Vérifie les entrées sudoers suspectes."""
        findings = []
        if platform.system() != "Linux":
            return findings

        sudoers_paths = ["/etc/sudoers"]
        sudoers_dir = "/etc/sudoers.d"
        if os.path.isdir(sudoers_dir):
            for f in os.listdir(sudoers_dir):
                sudoers_paths.append(os.path.join(sudoers_dir, f))

        suspicious = []
        for spath in sudoers_paths:
            try:
                with open(spath, "r") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("#") or not line:
                            continue
                        # NOPASSWD pour tous les commandes = dangereux
                        if "NOPASSWD" in line and "ALL" in line:
                            suspicious.append(f"{spath}: {line}")
            except PermissionError:
                pass
            except Exception:
                pass

        if suspicious:
            findings.append(Finding(
                category="Intégrité système",
                title="Droits sudo sans mot de passe (NOPASSWD ALL)",
                description=(
                    "Des entrées sudoers permettent d'exécuter des commandes en root "
                    "sans mot de passe. Cela peut être une porte dérobée installée par un attaquant."
                ),
                risk=RiskLevel.HIGH,
                evidence=suspicious,
                recommendation=(
                    "Vérifiez chaque entrée NOPASSWD. "
                    "Supprimez celles que vous n'avez pas créées."
                )
            ))
        return findings

    def _check_startup_services(self) -> List[Finding]:
        """Vérifie les services systemd suspects."""
        findings = []
        if platform.system() != "Linux":
            return findings

        suspicious_services = []
        service_dirs = [
            "/etc/systemd/system",
            os.path.expanduser("~/.config/systemd/user"),
        ]
        spy_keywords = ["spy", "keylog", "monitor", "stealth", "hidden", "backdoor",
                        "shell", "reverse", "exfil"]

        for sdir in service_dirs:
            if not os.path.isdir(sdir):
                continue
            for fname in os.listdir(sdir):
                if not fname.endswith(".service"):
                    continue
                fpath = os.path.join(sdir, fname)
                try:
                    with open(fpath, "r") as f:
                        content = f.read().lower()
                    for kw in spy_keywords:
                        if kw in content:
                            suspicious_services.append(f"{fpath} (contient: '{kw}')")
                            break
                    # Vérifier les ExecStart avec des commandes réseau suspectes
                    for line in content.splitlines():
                        if "execstart" in line and any(
                            t in line for t in ["nc ", "ncat", "bash -i", "/dev/tcp", "curl", "wget"]
                        ):
                            suspicious_services.append(f"{fpath}: {line.strip()[:100]}")
                except Exception:
                    pass

        if suspicious_services:
            findings.append(Finding(
                category="Intégrité système",
                title="Services système suspects détectés",
                description=(
                    "Des services systemd contenant des commandes associées "
                    "à une backdoor ou à la surveillance ont été trouvés."
                ),
                risk=RiskLevel.CRITICAL,
                evidence=suspicious_services,
                recommendation=(
                    "Arrêtez et désactivez ces services: "
                    "systemctl stop <service> && systemctl disable <service>. "
                    "Supprimez les fichiers .service correspondants."
                )
            ))
        return findings


class AccessAuditor:
    """Audite qui a accès aux informations sensibles."""

    def scan(self) -> List[Finding]:
        findings = []
        findings += self._check_recent_logins()
        findings += self._check_failed_logins()
        findings += self._check_open_files_by_users()
        return findings

    def _check_recent_logins(self) -> List[Finding]:
        """Récupère l'historique des connexions récentes."""
        findings = []
        if platform.system() == "Windows":
            return findings

        try:
            result = subprocess.run(
                ["last", "-n", "20", "-F"], capture_output=True, text=True, timeout=10
            )
            lines = result.stdout.strip().splitlines()
            remote_logins = []
            for line in lines:
                if line.startswith("wtmp") or not line.strip():
                    continue
                parts = line.split()
                if len(parts) >= 3:
                    user = parts[0]
                    terminal = parts[1]
                    from_host = parts[2]
                    # Connexions distantes (pas de tty local)
                    if not terminal.startswith("tty") and from_host not in ("", "reboot", "system"):
                        if from_host != "boot":
                            remote_logins.append(f"Utilisateur '{user}' depuis {from_host}: {line.strip()[:80]}")

            if remote_logins:
                findings.append(Finding(
                    category="Accès & Authentification",
                    title=f"{len(remote_logins)} connexion(s) distante(s) récente(s)",
                    description=(
                        "Des connexions distantes au système ont été détectées récemment. "
                        "Vérifiez que vous reconnaissez toutes ces connexions."
                    ),
                    risk=RiskLevel.MEDIUM,
                    evidence=remote_logins[:10],
                    recommendation=(
                        "Si vous ne reconnaissez pas certaines connexions, "
                        "changez immédiatement vos mots de passe et vérifiez "
                        "les clés SSH autorisées."
                    )
                ))
        except Exception:
            pass
        return findings

    def _check_failed_logins(self) -> List[Finding]:
        """Détecte les tentatives de connexion échouées (brute force)."""
        findings = []
        if platform.system() == "Windows":
            return findings

        try:
            result = subprocess.run(
                ["lastb", "-n", "50"], capture_output=True, text=True, timeout=10
            )
            lines = [l for l in result.stdout.strip().splitlines()
                     if l and not l.startswith("btmp")]

            if len(lines) > 10:
                # Compter les IPs les plus fréquentes
                ip_count = {}
                for line in lines:
                    parts = line.split()
                    if len(parts) >= 3:
                        ip = parts[2]
                        ip_count[ip] = ip_count.get(ip, 0) + 1

                top_attackers = sorted(ip_count.items(), key=lambda x: -x[1])[:5]
                evidence = [f"{count} tentatives depuis {ip}" for ip, count in top_attackers]
                evidence.append(f"Total: {len(lines)} tentatives échouées")

                findings.append(Finding(
                    category="Accès & Authentification",
                    title="Tentatives de connexion échouées (brute force possible)",
                    description=(
                        f"{len(lines)} tentatives de connexion échouées détectées. "
                        "Cela peut indiquer une attaque par force brute en cours."
                    ),
                    risk=RiskLevel.HIGH,
                    evidence=evidence,
                    recommendation=(
                        "Installez fail2ban pour bloquer automatiquement les IPs malveillantes. "
                        "Désactivez l'authentification SSH par mot de passe. "
                        "Changez le port SSH par défaut (22)."
                    )
                ))
        except Exception:
            pass
        return findings

    def _check_open_files_by_users(self) -> List[Finding]:
        """Vérifie qui accède aux fichiers sensibles en ce moment."""
        findings = []
        if not PSUTIL_AVAILABLE or platform.system() == "Windows":
            return findings

        sensitive_paths = [
            "/etc/shadow", "/etc/passwd", "/etc/ssh",
            os.path.expanduser("~/.ssh"),
            os.path.expanduser("~/.gnupg"),
            os.path.expanduser("~/.aws"),
        ]
        current_user = os.environ.get("USER", "")
        suspicious_accesses = []

        for proc in psutil.process_iter(["pid", "name", "username", "open_files"]):
            try:
                info = proc.info
                proc_user = info.get("username") or ""
                open_files = info.get("open_files") or []
                for f in open_files:
                    for sensitive in sensitive_paths:
                        if f.path.startswith(sensitive) and proc_user != current_user:
                            suspicious_accesses.append(
                                f"PID {info['pid']} ({info['name']}, user={proc_user}) "
                                f"accède à: {f.path}"
                            )
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

        if suspicious_accesses:
            findings.append(Finding(
                category="Accès & Authentification",
                title="Accès non autorisé à des fichiers sensibles en cours",
                description=(
                    "Des processus appartenant à d'autres utilisateurs accèdent "
                    "actuellement à des fichiers sensibles (clés SSH, identifiants, etc.)."
                ),
                risk=RiskLevel.CRITICAL,
                evidence=suspicious_accesses,
                recommendation=(
                    "Identifiez et terminez immédiatement ces processus. "
                    "Auditez les permissions des fichiers concernés."
                )
            ))
        return findings


# ---------------------------------------------------------------------------
# Moteur principal
# ---------------------------------------------------------------------------

class SurveillanceDetector:
    """Orchestrateur principal du scan de détection de surveillance."""

    def __init__(self):
        self.network_scanner = NetworkScanner()
        self.process_scanner = ProcessScanner()
        self.system_checker = SystemIntegrityChecker()
        self.access_auditor = AccessAuditor()

    def full_scan(self) -> dict:
        all_findings: List[Finding] = []
        all_findings += self.network_scanner.scan()
        all_findings += self.process_scanner.scan()
        all_findings += self.system_checker.scan()
        all_findings += self.access_auditor.scan()

        risk_counts = {r.value: 0 for r in RiskLevel}
        for f in all_findings:
            risk_counts[f.risk.value] += 1

        overall_risk = RiskLevel.LOW
        if risk_counts["critical"] > 0:
            overall_risk = RiskLevel.CRITICAL
        elif risk_counts["high"] > 0:
            overall_risk = RiskLevel.HIGH
        elif risk_counts["medium"] > 0:
            overall_risk = RiskLevel.MEDIUM

        return {
            "scan_time": datetime.datetime.now().isoformat(),
            "hostname": platform.node(),
            "os": f"{platform.system()} {platform.release()}",
            "overall_risk": overall_risk.value,
            "risk_counts": risk_counts,
            "total_findings": len(all_findings),
            "findings": [f.to_dict() for f in all_findings],
            "connections": self.network_scanner.get_active_connections_table(),
            "suspicious_processes": self.process_scanner.get_processes_table(),
            "psutil_available": PSUTIL_AVAILABLE,
        }
