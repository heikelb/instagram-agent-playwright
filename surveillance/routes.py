import os
from flask import Blueprint, render_template, jsonify, request
from .detector import SurveillanceDetector
from .iphone_analyzer import (
    find_iphone_backups, IPhoneBackupAnalyzer, IPHONE_MANUAL_CHECKLIST
)

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
