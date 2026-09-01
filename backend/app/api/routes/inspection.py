from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io
import uuid
from app.ml.inference import process_image
from app.safety.rules import safety_analyzer
from app.ml.model_loader import ml_manager

router = APIRouter()

@router.post("/inspect")
async def inspect_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
        
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image.")

    try:
        # 1. Run inference
        detections, processing_time = process_image(image)
        
        # 2. Analyze safety based on available model classes
        model_classes = list(ml_manager.model.names.values()) if ml_manager.model else []
        analysis = safety_analyzer.analyze_detections(detections, model_classes)
        
        inspection_id = str(uuid.uuid4())
        
        # 3. Format response
        return {
            "inspection_id": inspection_id,
            "status": analysis["status"],
            "safety_score": analysis["safety_score"],
            "summary": analysis["summary"],
            "equipment_detected": analysis["equipment"],
            "detections": detections,
            "violations": analysis["violations"],
            "processing_time_ms": processing_time,
            "model": ml_manager.model_name
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
