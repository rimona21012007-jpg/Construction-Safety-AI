from typing import List, Dict, Any

def calculate_iou(boxA: List[float], boxB: List[float]) -> float:
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    interArea = max(0, xB - xA) * max(0, yB - yA)
    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    return interArea / float(boxAArea + boxBArea - interArea + 1e-6)

def calculate_intersection_over_small_box(box_small: List[float], box_large: List[float]) -> float:
    xA = max(box_small[0], box_large[0])
    yA = max(box_small[1], box_large[1])
    xB = min(box_small[2], box_large[2])
    yB = min(box_small[3], box_large[3])
    interArea = max(0, xB - xA) * max(0, yB - yA)
    boxSmallArea = max(0, box_small[2] - box_small[0]) * max(0, box_small[3] - box_small[1])
    return interArea / float(boxSmallArea + 1e-6)

def get_box_center(box: List[float]) -> tuple:
    return ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2)

class SafetyAnalyzer:
    def __init__(self):
        pass

    def check_region_overlap(self, worker_box: List[float], ppe_box: List[float], region: str) -> bool:
        # Check if the PPE box is mostly inside the worker box horizontally and vertically
        overlap = calculate_intersection_over_small_box(ppe_box, worker_box)
        if overlap < 0.2:
            return False

        wx1, wy1, wx2, wy2 = worker_box
        worker_height = wy2 - wy1
        
        px, py = get_box_center(ppe_box)
        
        # Determine relative vertical position (0.0 is top of worker, 1.0 is bottom)
        if worker_height <= 0: return False
        rel_y = (py - wy1) / worker_height
        
        if region == "head":
            return rel_y < 0.35
        elif region == "torso":
            return 0.15 < rel_y < 0.70
        elif region == "hands":
            return 0.30 < rel_y < 0.85
        elif region == "feet":
            return rel_y > 0.65
        return False

    def analyze_detections(self, detections: List[Dict[str, Any]], model_classes: List[str]) -> Dict[str, Any]:
        """
        Analyzes raw detections and returns safety observations and scores based on body regions.
        """
        has_ppe_capability = "Hard_hat" in model_classes or "Worker" in model_classes
        
        workers = []
        ppe_items = {
            "head": [],
            "torso": [],
            "hands": [],
            "feet": []
        }
        equipment_counts = {}
        
        for det in detections:
            cls_name = det.get("class_name", "")
            if cls_name == "Worker":
                workers.append(det)
            elif cls_name in ["Hard_hat", "No-Helmet", "Glass", "No-Glass", "Mask", "No-Mask", "Ear-Protection", "No-Ear-Protection"]:
                ppe_items["head"].append(det)
            elif cls_name in ["Vest", "No-Vest"]:
                ppe_items["torso"].append(det)
            elif cls_name in ["Glove", "No-Glove"]:
                ppe_items["hands"].append(det)
            elif cls_name in ["Boots", "No-Boots"]:
                ppe_items["feet"].append(det)
            elif cls_name in ["Circular_Saw", "Fire_Extinguisher", "Welding_Equipment"]:
                equipment_counts[cls_name] = equipment_counts.get(cls_name, 0) + 1

        workers_results = []
        total_score = 0
        valid_score_workers = 0

        for i, worker in enumerate(workers):
            w_box = worker.get("bounding_box", {})
            if not w_box: continue
            w_box_arr = [w_box.get('x1', 0), w_box.get('y1', 0), w_box.get('x2', 0), w_box.get('y2', 0)]
            
            worker_res = {
                "id": f"Worker_{i+1}",
                "bbox": w_box_arr,
                "confidence": worker.get("confidence", 0),
                "ppe": {
                    "helmet": {"status": "UNKNOWN", "confidence": 0, "class": None},
                    "vest": {"status": "UNKNOWN", "confidence": 0, "class": None},
                    "gloves": {"status": "UNKNOWN", "confidence": 0, "class": None},
                    "boots": {"status": "UNKNOWN", "confidence": 0, "class": None},
                    "goggles": {"status": "UNKNOWN", "confidence": 0, "class": None}
                },
                "violations": []
            }
            
            if has_ppe_capability:
                # Check Head
                for item in ppe_items["head"]:
                    i_box = item.get("bounding_box", {})
                    i_box_arr = [i_box.get('x1', 0), i_box.get('y1', 0), i_box.get('x2', 0), i_box.get('y2', 0)]
                    if self.check_region_overlap(w_box_arr, i_box_arr, "head"):
                        cls_name = item.get("class_name")
                        conf = item.get("confidence", 0)
                        
                        if cls_name in ["Hard_hat", "No-Helmet"]:
                            if conf > worker_res["ppe"]["helmet"]["confidence"]:
                                worker_res["ppe"]["helmet"] = {
                                    "status": "COMPLIANT" if cls_name == "Hard_hat" else "VIOLATION",
                                    "confidence": conf,
                                    "class": cls_name
                                }
                        if cls_name in ["Glass", "No-Glass"]:
                            if conf > worker_res["ppe"]["goggles"]["confidence"]:
                                worker_res["ppe"]["goggles"] = {
                                    "status": "COMPLIANT" if cls_name == "Glass" else "VIOLATION",
                                    "confidence": conf,
                                    "class": cls_name
                                }
                
                # Check Torso
                for item in ppe_items["torso"]:
                    i_box = item.get("bounding_box", {})
                    i_box_arr = [i_box.get('x1', 0), i_box.get('y1', 0), i_box.get('x2', 0), i_box.get('y2', 0)]
                    if self.check_region_overlap(w_box_arr, i_box_arr, "torso"):
                        cls_name = item.get("class_name")
                        conf = item.get("confidence", 0)
                        if conf > worker_res["ppe"]["vest"]["confidence"]:
                            worker_res["ppe"]["vest"] = {
                                "status": "COMPLIANT" if cls_name == "Vest" else "VIOLATION",
                                "confidence": conf,
                                "class": cls_name
                            }

                # Check Hands
                for item in ppe_items["hands"]:
                    i_box = item.get("bounding_box", {})
                    i_box_arr = [i_box.get('x1', 0), i_box.get('y1', 0), i_box.get('x2', 0), i_box.get('y2', 0)]
                    if self.check_region_overlap(w_box_arr, i_box_arr, "hands"):
                        cls_name = item.get("class_name")
                        conf = item.get("confidence", 0)
                        if conf > worker_res["ppe"]["gloves"]["confidence"]:
                            worker_res["ppe"]["gloves"] = {
                                "status": "COMPLIANT" if cls_name == "Glove" else "VIOLATION",
                                "confidence": conf,
                                "class": cls_name
                            }

                # Check Feet
                for item in ppe_items["feet"]:
                    i_box = item.get("bounding_box", {})
                    i_box_arr = [i_box.get('x1', 0), i_box.get('y1', 0), i_box.get('x2', 0), i_box.get('y2', 0)]
                    if self.check_region_overlap(w_box_arr, i_box_arr, "feet"):
                        cls_name = item.get("class_name")
                        conf = item.get("confidence", 0)
                        if conf > worker_res["ppe"]["boots"]["confidence"]:
                            worker_res["ppe"]["boots"] = {
                                "status": "COMPLIANT" if cls_name == "Boots" else "VIOLATION",
                                "confidence": conf,
                                "class": cls_name
                            }

                # Calculate worker score
                worker_score = 100
                deductions = 0
                unknowns = 0
                
                for ppe_type, data in worker_res["ppe"].items():
                    if data["status"] == "VIOLATION":
                        deductions += 20
                        worker_res["violations"].append(f"Missing {ppe_type.capitalize()}")
                    elif data["status"] == "UNKNOWN":
                        unknowns += 1
                        
                # If too much is unknown, we can't confidently score them
                if unknowns >= 3:
                    worker_res["score"] = None
                else:
                    worker_res["score"] = max(0, worker_score - deductions)
                    total_score += worker_res["score"]
                    valid_score_workers += 1

            workers_results.append(worker_res)

        final_score = None
        if valid_score_workers > 0:
            final_score = int(total_score / valid_score_workers)

        global_violations = []
        ppe_compliant = 0
        ppe_violations = 0
        
        for w in workers_results:
            if w["score"] == 100:
                ppe_compliant += 1
            elif w["score"] is not None and w["score"] < 100:
                ppe_violations += 1
            
            for v in w["violations"]:
                global_violations.append({
                    "type": "ppe_violation",
                    "severity": "high",
                    "description": f"Worker {w['id']} is {v.lower()}"
                })

        if not has_ppe_capability:
             global_violations.append({
                 "type": "ppe_unknown",
                 "severity": "info",
                 "description": "Current model detects people but is not trained for construction PPE analysis."
             })

        return {
            "safety_score": final_score,
            "status": "inconclusive" if final_score is None else ("compliant" if final_score == 100 else "warning"),
            "workers": workers_results,
            "summary": {
                "workers_detected": len(workers),
                "equipment_detected": sum(equipment_counts.values()),
                "ppe_compliant": ppe_compliant,
                "ppe_violations": ppe_violations,
                "hazards_detected": 0
            },
            "violations": global_violations,
            "equipment": equipment_counts
        }

safety_analyzer = SafetyAnalyzer()
