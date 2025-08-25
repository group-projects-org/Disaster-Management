from backend.config import db
from datetime import datetime

# Collections
reports_collection = db["reports"]
sos_alerts_collection = db["sos_alerts"]
users_collection = db["users"]

# In-memory fallback
in_memory_reports = []
in_memory_sos_alerts = []
in_memory_users = []

# Insert Report
async def insert_report(report_data):
    try:
        result = await reports_collection.insert_one(report_data)
        return str(result.inserted_id)
    except Exception as e:
        print(f"⚠️ MongoDB unavailable, storing report in-memory: {e}")
        report_id = f"mem_{len(in_memory_reports) + 1}_{datetime.now().timestamp()}"
        report_data["_id"] = report_id
        in_memory_reports.append(report_data)
        return report_id

# Get Reports
async def get_reports(limit=100):
    try:
        reports = await reports_collection.find().to_list(limit)
        for r in reports:
            r["_id"] = str(r["_id"])
        return reports
    except Exception as e:
        print(f"⚠️ MongoDB unavailable, using in-memory reports: {e}")
        return in_memory_reports.copy()

# Insert SOS Alert
async def insert_sos_alert(alert_data):
    try:
        result = await sos_alerts_collection.insert_one(alert_data)
        return str(result.inserted_id)
    except Exception as e:
        print(f"⚠️ MongoDB unavailable, storing SOS alert in-memory: {e}")
        alert_id = f"sos_{len(in_memory_sos_alerts) + 1}_{datetime.now().timestamp()}"
        alert_data["_id"] = alert_id
        in_memory_sos_alerts.append(alert_data)
        return alert_id