import os
from flask import Blueprint, render_template, jsonify, request, Response
from .detector import SurveillanceDetector
from .iphone_analyzer import (
    find_iphone_backups, IPhoneBackupAnalyzer, IPHONE_MANUAL_CHECKLIST
)
from .investigation import (
    init_db, add_incident, get_incidents, delete_incident,
    add_account, get_accounts, update_account_osint,
    add_suspect, get_suspects,
    PatternAnalyzer, generate_police_report
)
from .osint_searcher import osint_search

surveillance_bp = Blueprint(
    "surveillance", __name__,
    template_folder="../templates/surveillance",
    url_prefix="/surveillance"
)

detector = SurveillanceDetector()


@surveillance_bp.route("/")
def dashboard():
    return render_template("surveillance/dashboard.html")


@surveillance_bp.route("/scan", methods=["POST"])
def run_scan():
    results = detector.full_scan()
    return jsonify(results)


@surveillance_bp.route("/connections")
def connections():
    data = detector.network_scanner.get_active_connections_table()
    return jsonify(data)


@surveillance_bp.route("/iphone")
def iphone_dashboard():
    backups = find_iphone_backups()
    return render_template(
        "surveillance/iphone.html",
        checklist=IPHONE_MANUAL_CHECKLIST,
        backups=backups,
    )


@surveillance_bp.route("/iphone/analyze", methods=["POST"])
def analyze_iphone_backup():
    data = request.get_json()
    backup_path = data.get("backup_path", "")
    if not backup_path or not os.path.isdir(backup_path):
        return jsonify({"error": "Chemin de sauvegarde invalide"}), 400
    analyzer = IPhoneBackupAnalyzer(backup_path)
    return jsonify(analyzer.analyze())


@surveillance_bp.route("/iphone/backups")
def list_backups():
    return jsonify(find_iphone_backups())


# ---------------------------------------------------------------------------
# Investigation routes
# ---------------------------------------------------------------------------

init_db()


@surveillance_bp.route("/investigation")
def investigation_dashboard():
    return render_template("surveillance/investigation.html")


@surveillance_bp.route("/investigation/incident", methods=["POST"])
def create_incident():
    data = request.get_json()
    incident_id = add_incident(data)
    return jsonify({"id": incident_id})


@surveillance_bp.route("/investigation/incidents")
def list_incidents():
    return jsonify(get_incidents())


@surveillance_bp.route("/investigation/incident/<int:incident_id>", methods=["DELETE"])
def remove_incident(incident_id):
    delete_incident(incident_id)
    return jsonify({"ok": True})


@surveillance_bp.route("/investigation/account", methods=["POST"])
def create_account():
    data = request.get_json()
    account_id = add_account(data)
    return jsonify({"id": account_id})


@surveillance_bp.route("/investigation/accounts")
def list_accounts():
    return jsonify(get_accounts())


@surveillance_bp.route("/investigation/suspect", methods=["POST"])
def create_suspect():
    data = request.get_json()
    sid = add_suspect(data)
    return jsonify({"id": sid})


@surveillance_bp.route("/investigation/suspects")
def list_suspects():
    return jsonify(get_suspects())


@surveillance_bp.route("/investigation/analyze")
def analyze():
    analyzer = PatternAnalyzer()
    return jsonify(analyzer.full_analysis())


@surveillance_bp.route("/investigation/osint", methods=["POST"])
def run_osint():
    data = request.get_json()
    username = data.get("username", "").strip().lstrip("@")
    if not username:
        return jsonify({"error": "Username manquant"}), 400
    result = osint_search(username)
    # Mettre à jour le compte si connu
    accounts = get_accounts()
    for acc in accounts:
        if acc["username"].lower() == username.lower():
            update_account_osint(acc["id"], result)
            break
    return jsonify(result)


@surveillance_bp.route("/investigation/report")
def police_report():
    html = generate_police_report()
    return Response(html, mimetype="text/html")
