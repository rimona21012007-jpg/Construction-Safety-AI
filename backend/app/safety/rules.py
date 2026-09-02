from typing import List, Dict, Any

def calculate_iou(boxA: List[float], boxB: List[float]) -> float:
    # Determine the (x, y)-coordinates of the intersection rectangle
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    # Compute the area of intersection rectangle
    interArea = max(0, xB - xA) * max(0, yB - yA)

    # Compute the area of both the prediction and ground-truth rectangles
    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

    # Compute the intersection over union
    # We add a small epsilon to the denominator to prevent division by zero
    iou = interArea / float(boxAArea + boxBArea - interArea + 1e-6)
    return iou

def calculate_intersection_over_small_box(box_small: List[float], box_large: List[float]) -> float:
    # Calculates how much of the small box is inside the large box
    xA = max(box_small[0], box_large[0])
    yA = max(box_small[1], box_large[1])
    xB = min(box_small[2], box_large[2])
    yB = min(box_small[3], box_large[3])

    interArea = max(0, xB - xA) * max(0, yB - yA)
    boxSmallArea = max(0, box_small[2] - box_small[0]) * max(0, box_small[3] - box_small[1])
    
    return interArea / float(boxSmallArea + 1e-6)

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
        has_ppe_capability = "helmet" in model_classes or "safety_vest" in model_classes or "vest" in model_classes

        base_score = 100
        score_deductions = 0
        
        # Separate detections
        persons = []
        helmets = []
        vests = []
        
        for det in detections:
            cls_name = det.get("class_name", "").lower()
            if cls_name == "person":
                persons.append(det)
            elif cls_name in ["helmet"]:
                helmets.append(det)
            elif cls_name in ["vest", "safety_vest"]:
                vests.append(det)
            elif cls_name in ["truck", "excavator", "crane", "forklift", "concrete_mixer"]:
                equipment_counts[cls_name] = equipment_counts.get(cls_name, 0) + 1

        workers_detected = len(persons)
        ppe_compliant = 0
        ppe_violations = 0

        for i, person in enumerate(persons):
            p_box = person.get("bounding_box", {})
            if not p_box:
                continue
                
            p_box_arr = [p_box.get('x1', 0), p_box.get('y1', 0), p_box.get('x2', 0), p_box.get('y2', 0)]
            
            if not has_ppe_capability:
                # Honest ML assessment: We can't verify PPE
                violations.append({
                    "type": "ppe_unknown",
                    "severity": "info",
                    "description": "Construction-specific PPE analysis requires a fine-tuned safety model. Unable to verify helmet/vest."
                })
            else:
                # Check for PPE overlap using bounding boxes
                has_helmet = False
                has_vest = False
                
                # Check helmets (must be inside or overlapping heavily with person)
                for h in helmets:
                    h_box = h.get("bounding_box", {})
                    h_box_arr = [h_box.get('x1', 0), h_box.get('y1', 0), h_box.get('x2', 0), h_box.get('y2', 0)]
                    # A helmet should be mostly contained within the person's bounding box
                    overlap = calculate_intersection_over_small_box(h_box_arr, p_box_arr)
                    if overlap > 0.5:
                        has_helmet = True
                        break
                        
                # Check vests
                for v in vests:
                    v_box = v.get("bounding_box", {})
                    v_box_arr = [v_box.get('x1', 0), v_box.get('y1', 0), v_box.get('x2', 0), v_box.get('y2', 0)]
                    overlap = calculate_intersection_over_small_box(v_box_arr, p_box_arr)
                    if overlap > 0.5:
                        has_vest = True
                        break
                
                # Record violations
                if not has_helmet:
                    violations.append({
                        "type": "missing_helmet",
                        "severity": "high",
                        "description": f"Worker #{i+1} detected without a safety helmet."
                    })
                if not has_vest:
                    violations.append({
                        "type": "missing_vest",
                        "severity": "medium",
                        "description": f"Worker #{i+1} detected without a high-visibility vest."
                    })
                    
                if has_helmet and has_vest:
                    ppe_compliant += 1
                else:
                    ppe_violations += 1

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
                "ppe_compliant": ppe_compliant if has_ppe_capability else None,
                "ppe_violations": ppe_violations if has_ppe_capability else None,
                "hazards_detected": len(hazards),
                "equipment_detected": sum(equipment_counts.values())
            },
            "violations": unique_violations,
            "equipment": equipment_counts
        }

safety_analyzer = SafetyAnalyzer()
