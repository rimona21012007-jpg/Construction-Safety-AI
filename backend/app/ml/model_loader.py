import os
from ultralytics import YOLO
import logging

logger = logging.getLogger(__name__)

class MLManager:
    def __init__(self):
        self.model = None
        self.model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'construction_ppe_v1.pt')
        self.model_name = "Construction PPE V1" if os.path.exists(self.model_path) else "yolo11n.pt"
        self.device = "cpu"
        
    def load_model(self):
        try:
            logger.info(f"Loading {self.model_name} model from {self.model_path if self.model_name != 'yolo11n.pt' else 'yolo11n.pt'}...")
            if self.model_name != 'yolo11n.pt':
                self.model = YOLO(self.model_path)
            else:
                self.model = YOLO('yolo11n.pt')
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
            "model_type": "Ultralytics YOLO (Construction PPE)",
            "supported_classes": list(self.model.names.values()) if hasattr(self.model, "names") else [],
            "inference_device": self.device,
            "model_status": "loaded",
            "ppe_capable": self.model_name == "Construction PPE V1"
        }

ml_manager = MLManager()
