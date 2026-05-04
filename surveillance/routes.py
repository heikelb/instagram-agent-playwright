from flask import Blueprint, render_template, jsonify
from .detector import SurveillanceDetector

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
