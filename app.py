import sys, subprocess
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.ml_model import load_model
from backend.routes import report, sos, rescue_agencies

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    subprocess.Popen([sys.executable, "backend/ML/disaster_response_api.py"])
    yield
    print("🛑 Application shutting down")

app = FastAPI(
    title="Disaster Tweet Classifier API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(report.router)
app.include_router(sos.router)
app.include_router(rescue_agencies.router, prefix="/rescue-agencies", tags=["rescue-agencies"])

@app.get("/")
async def root():
    return {
        "message": "Disaster Management API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "sos": "/sos",
            "reports": "/reports",
            "rescue_agencies": "/rescue-agencies"
        }
    }

@app.get("/favicon.ico")
async def favicon():
    return {"message": "No favicon available"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Disaster Management API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)