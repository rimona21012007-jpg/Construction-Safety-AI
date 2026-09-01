from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import health, inspection, model
from app.ml.model_loader import ml_manager
import uvicorn
import contextlib

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML model on startup
    ml_manager.load_model()
    yield
    # Cleanup on shutdown if needed

app = FastAPI(
    title="CONSTRUCT-SAFE AI",
    description="AI-Powered Construction Site Safety & Visual Inspection API",
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

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(model.router, prefix="/api", tags=["model"])
app.include_router(inspection.router, prefix="/api", tags=["inspection"])

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
