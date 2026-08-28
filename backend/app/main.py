from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.session import Base, engine
from app.routers import health, analyze, history, samples, speakers, soc, telephony, threat_intel, multilingual
from app.routers import settings as settings_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    print(f"[{settings.APP_NAME}] Database tables initialized successfully at {settings.DATABASE_URL}")
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks",
    lifespan=lifespan
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(health.router, prefix="/api")
app.include_router(analyze.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(samples.router, prefix="/api")
app.include_router(speakers.router, prefix="/api")
app.include_router(soc.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")
app.include_router(telephony.router, prefix="/api")
app.include_router(threat_intel.router, prefix="/api")
app.include_router(multilingual.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "health_check": "/api/health",
        "analyze_file": "/api/analyze/file",
        "history": "/api/history",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
