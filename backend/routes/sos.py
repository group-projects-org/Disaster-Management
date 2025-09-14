from fastapi import APIRouter, Form
from datetime import datetime
from backend.models import SOSAlert
from backend.database import sos_alerts_collection, reports_collection
from bson import ObjectId

router = APIRouter()

@router.post("/sos")
async def sos_alert(
    reporter: str | None = Form(None),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    description: str | None = Form(None),
    severity: str | None = Form("critical"),
    timestamp: str | None = Form(None),
    payload: SOSAlert | None = None
):
    # Overwrite form data if payload is sent as JSON
    if payload:
        reporter = payload.reporter
        latitude = payload.latitude
        longitude = payload.longitude
        description = payload.description
        severity = payload.severity
        timestamp = payload.timestamp

    if not all([reporter, latitude, longitude]):
        return {"error": "Missing required fields: reporter, latitude, longitude"}

    if timestamp is None:
        timestamp = datetime.utcnow().isoformat()

    data = {
        "reporter": reporter,
        "latitude": latitude,
        "longitude": longitude,
        "description": description,
        "severity": severity,
        "isSOSAlert": True,
        "timestamp": timestamp
    }

    result = await sos_alerts_collection.insert_one(data)

    return {
        "message": "SOS alert received",
        "id": str(result.inserted_id),
        "data": {**data, "_id": str(result.inserted_id)}
    }


@router.get("/sos")
async def get_sos_alerts():
    # Get SOS alerts from sos_alerts_collection (not reports_collection)
    alerts_cursor = sos_alerts_collection.find({})
    alerts = await alerts_cursor.to_list(length=None)

    # Convert ObjectId to string for JSON serialization
    for alert in alerts:
        alert["_id"] = str(alert["_id"])

    return {"count": len(alerts), "data": alerts}

@router.get("/sos-dashboard")
async def get_sos_dashboard():
    """Get SOS dashboard data for government officials"""
    try:
        # Get all SOS alerts
        alerts_cursor = sos_alerts_collection.find({})
        alerts = await alerts_cursor.to_list(length=None)
        
        # Count by severity
        critical_count = len([a for a in alerts if a.get("severity") == "critical"])
        high_count = len([a for a in alerts if a.get("severity") == "high"])
        medium_count = len([a for a in alerts if a.get("severity") == "medium"])
        
        # Get recent alerts (last 5)
        recent_alerts = alerts[-5:] if alerts else []
        
        # Convert ObjectId to string for JSON serialization
        for alert in recent_alerts:
            alert["_id"] = str(alert["_id"])
        
        return {
            "total_alerts": len(alerts),
            "active_alerts": len(alerts),  # All alerts are considered active
            "recent_alerts": recent_alerts,
            "alerts_by_severity": {
                "critical": critical_count,
                "high": high_count,
                "medium": medium_count
            }
        }
    except Exception as e:
        return {"error": f"Failed to get dashboard data: {str(e)}"}

@router.get("/sos-map")
async def get_sos_map():
    """Get SOS alerts for map display"""
    try:
        alerts_cursor = sos_alerts_collection.find({})
        alerts = await alerts_cursor.to_list(length=None)
        
        # Convert ObjectId to string for JSON serialization
        for alert in alerts:
            alert["_id"] = str(alert["_id"])
        
        return {
            "alerts": alerts,
            "map_center": {"lat": 30.0668, "lng": 79.0193},  # Uttarakhand center
            "zoom": 8
        }
    except Exception as e:
        return {"error": f"Failed to get map data: {str(e)}"}

@router.post("/api/predict-population")
async def predict_population(
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    rainfall: float | None = Form(None),
    wind_speed: float | None = Form(None),
    humidity: float | None = Form(None),
    temperature: float | None = Form(None)
):
    """AI-powered population prediction for disaster response planning"""
    try:
        # Mock AI prediction based on weather and location data
        # In real implementation, this would use your ML models
        
        base_population = 50000  # Base population for the area
        
        # Weather impact factors
        weather_factor = 1.0
        if rainfall and rainfall > 50:
            weather_factor *= 0.8  # Heavy rain reduces population
        if temperature and temperature > 35:
            weather_factor *= 0.9  # High temperature reduces population
        if wind_speed and wind_speed > 20:
            weather_factor *= 0.85  # High winds reduce population
            
        # Location-based adjustments
        location_factor = 1.0
        if latitude and longitude:
            # Uttarakhand area (rough coordinates)
            if 28.0 <= latitude <= 31.0 and 77.0 <= longitude <= 80.0:
                location_factor = 1.2  # Higher population density
            elif 27.0 <= latitude <= 28.0 and 77.0 <= longitude <= 79.0:
                location_factor = 1.5  # Very high population density (Delhi area)
        
        predicted_population = int(base_population * weather_factor * location_factor)
        
        return {
            "status": "success",
            "predicted_population": predicted_population,
            "confidence_score": 0.85,
            "factors": {
                "base_population": base_population,
                "weather_factor": round(weather_factor, 2),
                "location_factor": round(location_factor, 2),
                "weather_data": {
                    "rainfall": rainfall,
                    "wind_speed": wind_speed,
                    "humidity": humidity,
                    "temperature": temperature
                },
                "coordinates": {
                    "latitude": latitude,
                    "longitude": longitude
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to predict population: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

@router.post("/api/calculate-resources")
async def calculate_resources(
    affected_population: int | None = Form(None),
    disaster_type: str | None = Form(None),
    duration_days: int | None = Form(None),
    rainfall: float | None = Form(None),
    wind_speed: float | None = Form(None),
    humidity: float | None = Form(None),
    temperature: float | None = Form(None)
):
    """Calculate resource requirements for disaster response"""
    try:
        # Use form data or default values
        population = affected_population or 10000
        disaster = disaster_type or "flash_flood"
        duration = duration_days or 7
        
        # Base resource calculations
        food_packets = population * 3 * duration  # 3 meals per day
        rescue_teams = max(10, population // 1000)  # 1 team per 1000 people
        medical_staff = max(5, population // 2000)  # 1 staff per 2000 people
        
        # Weather impact adjustments
        weather_multiplier = 1.0
        if rainfall and rainfall > 50:
            weather_multiplier *= 1.2  # More resources needed in heavy rain
        if temperature and temperature > 35:
            weather_multiplier *= 1.15  # More resources in extreme heat
        if wind_speed and wind_speed > 20:
            weather_multiplier *= 1.1  # More resources in high winds
            
        # Disaster type adjustments
        disaster_multiplier = 1.0
        if disaster == "flash_flood":
            disaster_multiplier = 1.3  # Floods need more resources
        elif disaster == "earthquake":
            disaster_multiplier = 1.4  # Earthquakes need most resources
        elif disaster == "landslide":
            disaster_multiplier = 1.25
        elif disaster == "forest_fire":
            disaster_multiplier = 1.2
        elif disaster == "cyclone":
            disaster_multiplier = 1.35
            
        # Apply multipliers
        final_food = int(food_packets * weather_multiplier * disaster_multiplier)
        final_rescue = int(rescue_teams * weather_multiplier * disaster_multiplier)
        final_medical = int(medical_staff * weather_multiplier * disaster_multiplier)
        
        return {
            "status": "success",
            "resource_calculation": {
                "calculated_resources": {
                    "food": {
                        "base_amount": {"food_packets": food_packets},
                        "weather_adjustment": {"food_packets": int(food_packets * weather_multiplier)},
                        "final_amount": {"food_packets": final_food}
                    },
                    "rescue": {
                        "base_amount": {"rescue_teams": rescue_teams},
                        "weather_adjustment": {"rescue_teams": int(rescue_teams * weather_multiplier)},
                        "final_amount": {"rescue_teams": final_rescue}
                    },
                    "medical": {
                        "base_amount": {"medical_staff": medical_staff},
                        "weather_adjustment": {"medical_staff": int(medical_staff * weather_multiplier)},
                        "final_amount": {"medical_staff": final_medical}
                    }
                },
                "duration_days": duration,
                "weather_multiplier": round(weather_multiplier, 2),
                "disaster_multiplier": round(disaster_multiplier, 2),
                "total_multiplier": round(weather_multiplier * disaster_multiplier, 2)
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to calculate resources: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

@router.post("/api/allocate-resources")
async def allocate_resources(
    available_food: int | None = Form(None),
    available_rescue_teams: int | None = Form(None),
    available_medical_staff: int | None = Form(None),
    food_needed: int | None = Form(None),
    rescue_teams_needed: int | None = Form(None),
    medical_staff_needed: int | None = Form(None)
):
    """Allocate available resources based on requirements"""
    try:
        # Use form data or default values
        available_food = available_food or 100000
        available_rescue_teams = available_rescue_teams or 100
        available_medical_staff = available_medical_staff or 200
        
        food_needed = food_needed or 50000
        rescue_teams_needed = rescue_teams_needed or 50
        medical_staff_needed = medical_staff_needed or 100
        
        # Calculate allocation
        food_allocated = min(available_food, food_needed)
        rescue_allocated = min(available_rescue_teams, rescue_teams_needed)
        medical_allocated = min(available_medical_staff, medical_staff_needed)
        
        # Calculate wastage
        food_wastage = max(0, available_food - food_needed)
        rescue_wastage = max(0, available_rescue_teams - rescue_teams_needed)
        medical_wastage = max(0, available_medical_staff - medical_staff_needed)
        
        # Calculate efficiency
        food_efficiency = (food_allocated / food_needed * 100) if food_needed > 0 else 100
        rescue_efficiency = (rescue_allocated / rescue_teams_needed * 100) if rescue_teams_needed > 0 else 100
        medical_efficiency = (medical_allocated / medical_staff_needed * 100) if medical_staff_needed > 0 else 100
        
        return {
            "status": "success",
            "resource_allocation": {
                "disasters_processed": 1,
                "available_resources": {
                    "food_packets": available_food,
                    "rescue_teams": available_rescue_teams,
                    "medical_staff": available_medical_staff
                },
                "required_resources": {
                    "food_packets": food_needed,
                    "rescue_teams": rescue_teams_needed,
                    "medical_staff": medical_staff_needed
                },
                "allocated_resources": {
                    "food_packets": food_allocated,
                    "rescue_teams": rescue_allocated,
                    "medical_staff": medical_allocated
                },
                "wastage_analysis": {
                    "food_wastage": food_wastage,
                    "rescue_wastage": rescue_wastage,
                    "medical_wastage": medical_wastage,
                    "total_wastage": food_wastage + rescue_wastage + medical_wastage
                },
                "efficiency_metrics": {
                    "food_efficiency": round(food_efficiency, 1),
                    "rescue_efficiency": round(rescue_efficiency, 1),
                    "medical_efficiency": round(medical_efficiency, 1),
                    "overall_efficiency": round((food_efficiency + rescue_efficiency + medical_efficiency) / 3, 1)
                },
                "allocations": {
                    "disaster_1": {
                        "name": "Active Disaster",
                        "location": "Affected Area",
                        "resources_allocated": {
                            "food_packets": food_allocated,
                            "rescue_teams": rescue_allocated,
                            "medical_staff": medical_allocated
                        }
                    }
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to allocate resources: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

@router.post("/api/full-disaster-analysis")
async def full_disaster_analysis(
    location: str | None = Form(None),
    disaster_type: str | None = Form(None),
    affected_area_percentage: int | None = Form(None),
    duration_days: int | None = Form(None),
    rainfall: float | None = Form(None),
    wind_speed: float | None = Form(None),
    humidity: float | None = Form(None),
    temperature: float | None = Form(None),
    available_food: int | None = Form(None),
    available_rescue_teams: int | None = Form(None),
    available_medical_staff: int | None = Form(None)
):
    """Run complete disaster analysis combining all systems"""
    try:
        # Step 1: Population Prediction
        base_population = 50000
        weather_factor = 1.0
        if rainfall and rainfall > 50:
            weather_factor *= 0.8
        if temperature and temperature > 35:
            weather_factor *= 0.9
        if wind_speed and wind_speed > 20:
            weather_factor *= 0.85
            
        location_factor = 1.2  # Default for Uttarakhand
        predicted_population = int(base_population * weather_factor * location_factor)
        
        # Step 2: Resource Calculation
        food_packets = predicted_population * 3 * (duration_days or 7)
        rescue_teams = max(10, predicted_population // 1000)
        medical_staff = max(5, predicted_population // 2000)
        
        disaster_multiplier = 1.3 if disaster_type == "flash_flood" else 1.0
        weather_multiplier = 1.2 if rainfall and rainfall > 50 else 1.0
        
        final_food = int(food_packets * weather_multiplier * disaster_multiplier)
        final_rescue = int(rescue_teams * weather_multiplier * disaster_multiplier)
        final_medical = int(medical_staff * weather_multiplier * disaster_multiplier)
        
        # Step 3: Resource Allocation
        available_food = available_food or 100000
        available_rescue_teams = available_rescue_teams or 100
        available_medical_staff = available_medical_staff or 200
        
        food_allocated = min(available_food, final_food)
        rescue_allocated = min(available_rescue_teams, final_rescue)
        medical_allocated = min(available_medical_staff, final_medical)
        
        return {
            "status": "success",
            "full_analysis": {
                "step_1_population_prediction": {
                    "predicted_affected_population": predicted_population,
                    "ml_confidence": 0.85,
                    "weather_factors": {
                        "rainfall_impact": rainfall > 50,
                        "temperature_impact": temperature > 35,
                        "wind_impact": wind_speed > 20
                    }
                },
                "step_2_resource_calculation": {
                    "calculated_resources": {
                        "food": {"final_amount": {"food_packets": final_food}},
                        "rescue": {"final_amount": {"rescue_teams": final_rescue}},
                        "medical": {"final_amount": {"medical_staff": final_medical}}
                    }
                },
                "step_3_resource_allocation": {
                    "available_resources": {
                        "food_packets": available_food,
                        "rescue_teams": available_rescue_teams,
                        "medical_staff": available_medical_staff
                    },
                    "allocated_resources": {
                        "food_packets": food_allocated,
                        "rescue_teams": rescue_allocated,
                        "medical_staff": medical_allocated
                    },
                    "efficiency": round((food_allocated / final_food + rescue_allocated / final_rescue + medical_allocated / final_medical) / 3 * 100, 1)
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to run full analysis: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }