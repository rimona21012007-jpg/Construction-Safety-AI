import os
from ultralytics import YOLO
import logging

logger = logging.getLogger(__name__)

class MLManager:
    def __init__(self):
        self.model = None
        self.model_name = "yolo11n.pt"  # Use latest standard YOLO model
        self.device = "cpu"
        
    def load_model(self):
        try:
            logger.info(f"Loading {self.model_name} model...")
            self.model = YOLO(self.model_name)
            self.device = self.model.device.type if hasattr(self.model, 'device') else "cpu"
            logger.info(f"Model loaded successfully on {self.device}")
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            self.model = None

    def get_model_info(self):
        if not self.model:
            return {"status": "unavailable"}
            
        return {
            "model_name": self.model_name,
            "model_type": "Ultralytics YOLO (Pre-trained Prototype)",
            "supported_classes": list(self.model.names.values()) if hasattr(self.model, "names") else [],
            "inference_device": self.device,
            "model_status": "loaded"
        }

ml_manager = MLManager()
