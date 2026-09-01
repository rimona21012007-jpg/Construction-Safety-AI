from typing import List, Dict, Any

class SafetyAnalyzer:
    def __init__(self):
        # We define what classes our current model can detect.
        # For Phase 1 (pretrained YOLO), we don't have PPE classes.
        # This will be updated when a custom model is loaded.
        pass

    def analyze_detections(self, detections: List[Dict[str, Any]], model_classes: List[str]) -> Dict[str, Any]:
        """
        Analyzes raw detections and returns safety observations and scores.
        """
        
        workers_detected = 0
        equipment_counts = {}
        hazards = []
        violations = []
        
        # Determine if this model is capable of PPE detection
        has_ppe_capability = "helmet" in model_classes or "safety_vest" in model_classes

        base_score = 100
        score_deductions = 0

        for det in detections:
            cls_name = det.get("class_name", "").lower()
            
            if cls_name == "person":
                workers_detected += 1
                
                if not has_ppe_capability:
                    # Honest ML assessment: We can't verify PPE
                    violations.append({
                        "type": "ppe_unknown",
                        "severity": "info",
                        "description": "Construction-specific PPE analysis requires a fine-tuned safety model. Unable to verify helmet/vest."
                    })
                else:
                    # In future phases, we would check for overlap with helmet/vest bounding boxes
                    pass
                    
            elif cls_name in ["truck", "excavator", "crane", "forklift", "concrete_mixer"]:
                equipment_counts[cls_name] = equipment_counts.get(cls_name, 0) + 1

        # Deduplicate violations for 'ppe_unknown' to avoid spamming the UI
        unique_violations = []
        ppe_unknown_added = False
        for v in violations:
            if v["type"] == "ppe_unknown":
                if not ppe_unknown_added:
                    unique_violations.append(v)
                    ppe_unknown_added = True
            else:
                unique_violations.append(v)
                # Deduct score for actual violations (not 'info' level unknown PPE)
                if v["severity"] == "high":
                    score_deductions += 20
                elif v["severity"] == "medium":
                    score_deductions += 15
                elif v["severity"] == "low":
                    score_deductions += 10

        for h in hazards:
            score_deductions += 25

        final_score = max(0, base_score - score_deductions)

        return {
            "safety_score": final_score,
            "status": "warning" if score_deductions > 0 or not has_ppe_capability else "compliant",
            "summary": {
                "workers_detected": workers_detected,
                "ppe_compliant": 0 if not has_ppe_capability else None, # Null/0 if unknown
                "ppe_violations": 0,
                "hazards_detected": len(hazards),
                "equipment_detected": sum(equipment_counts.values())
            },
            "violations": unique_violations,
            "equipment": equipment_counts
        }

safety_analyzer = SafetyAnalyzer()
