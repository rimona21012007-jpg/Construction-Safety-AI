from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from PIL import Image
import io
import uuid
import base64
from app.ml.inference import process_image
from app.safety.rules import safety_analyzer
from app.ml.model_loader import ml_manager

router = APIRouter()

@router.post("/inspect")
async def inspect_image(
    file: UploadFile = File(...),
    confidence_threshold: float = Form(0.25)
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
        
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_width, image_height = image.size
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image.")

    try:
        # 1. Run inference
        detections, processing_time, annotated_img = process_image(image, confidence_threshold)
        
        # 2. Analyze safety based on new rules
        analysis = safety_analyzer.analyze_detections(detections, image_width, image_height)
        
        inspection_id = str(uuid.uuid4())
        
        # Convert annotated image to base64 for frontend display/inspection
        annotated_b64 = None
        if annotated_img:
            buffered = io.BytesIO()
            annotated_img.save(buffered, format="JPEG")
            annotated_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        # 3. Format response
        return {
            "inspection_id": inspection_id,
            "status": analysis["status"],
            "safety_score": analysis["safety_score"],
            "summary": analysis["summary"],
            "equipment_detected": analysis["equipment"],
            "detections": detections,
            "workers": analysis["workers"],
            "violations": analysis["violations"],
            "processing_time_ms": processing_time,
            "model": ml_manager.model_name,
            "confidence_threshold": confidence_threshold,
            "annotated_image_base64": annotated_b64
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
