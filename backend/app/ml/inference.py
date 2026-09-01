from PIL import Image
from app.ml.model_loader import ml_manager
import time

def process_image(image: Image.Image):
    start_time = time.time()
    
    if ml_manager.model is None:
        raise ValueError("Model is not loaded")

    # Run inference
    results = ml_manager.model(image)
    
    detections = []
    
    # YOLO returns a list of Results objects (one per image in the batch)
    for result in results:
        boxes = result.boxes
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            cls_idx = int(box.cls[0])
            cls_name = ml_manager.model.names[cls_idx]
            
            detections.append({
                "class_name": cls_name,
                "confidence": conf,
                "bounding_box": {
                    "x1": x1,
                    "y1": y1,
                    "x2": x2,
                    "y2": y2
                }
            })
            
    processing_time_ms = int((time.time() - start_time) * 1000)
    
    return detections, processing_time_ms
