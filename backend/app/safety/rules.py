import os
from typing import List, Dict, Any
import math

class SafetyAnalyzer:
    def __init__(self):
        # Configurable UNKNOWN >50% threshold for inconclusive
        self.inconclusive_threshold = float(os.environ.get("UNKNOWN_INCONCLUSIVE_THRESHOLD", 0.50))

    def calculate_iou(self, boxA: List[float], boxB: List[float]) -> float:
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[2], boxB[2])
        yB = min(boxA[3], boxB[3])
        interArea = max(0, xB - xA) * max(0, yB - yA)
        boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
        boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
        return interArea / float(boxAArea + boxBArea - interArea + 1e-6)

    def calculate_intersection_over_ppe(self, worker_box: List[float], ppe_box: List[float]) -> float:
        xA = max(worker_box[0], ppe_box[0])
        yA = max(worker_box[1], ppe_box[1])
        xB = min(worker_box[2], ppe_box[2])
        yB = min(worker_box[3], ppe_box[3])
        interArea = max(0, xB - xA) * max(0, yB - yA)
        ppeArea = max(0, ppe_box[2] - ppe_box[0]) * max(0, ppe_box[3] - ppe_box[1])
        return interArea / float(ppeArea + 1e-6)

    def get_box_center(self, box: List[float]) -> tuple:
        return ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2)
        
    def estimate_region(self, worker_box: List[float], region_type: str) -> List[float]:
        wx1, wy1, wx2, wy2 = worker_box
        w = wx2 - wx1
        h = wy2 - wy1
        if region_type == "head":
            return [wx1, wy1 - 0.1*h, wx2, wy1 + 0.35*h]
        elif region_type == "face":
            return [wx1 + 0.15*w, wy1 + 0.05*h, wx2 - 0.15*w, wy1 + 0.3*h]
        elif region_type == "torso":
            return [wx1, wy1 + 0.15*h, wx2, wy1 + 0.7*h]
        elif region_type == "hands":
            return [wx1 - 0.2*w, wy1 + 0.3*h, wx2 + 0.2*w, wy1 + 0.85*h]
        elif region_type == "feet":
            return [wx1, wy1 + 0.65*h, wx2, wy2 + 0.1*h]
        return worker_box

    def check_visibility(self, worker_box: List[float], region_type: str, img_w: int, img_h: int) -> bool:
        wx1, wy1, wx2, wy2 = worker_box
        w = wx2 - wx1
        h = wy2 - wy1
        
        # If worker is too small for reliable analysis
        if w < 0.02 * img_w or h < 0.05 * img_h:
            return False

        margin_y = 0.01 * img_h

        if region_type == "head" or region_type == "face":
            if wy1 <= margin_y:
                return False
        elif region_type == "feet":
            if wy2 >= img_h - margin_y:
                return False
        elif region_type == "hands":
            if wy2 >= img_h - margin_y and h < 0.4 * img_h:
                return False
            
        return True

    def associate_ppe(self, worker_box: List[float], ppe_items: List[Dict], region_type: str) -> Dict:
        best_match = None
        best_score = -1
        
        est_region = self.estimate_region(worker_box, region_type)
        wx1, wy1, wx2, wy2 = worker_box
        w_diag = math.sqrt((wx2-wx1)**2 + (wy2-wy1)**2)
        
        for item in ppe_items:
            ppe_box = item.get("bounding_box")
            if not ppe_box: continue
            p_arr = [ppe_box['x1'], ppe_box['y1'], ppe_box['x2'], ppe_box['y2']]
            
            # Intersection over PPE box (ppe must be mostly inside worker, or near them)
            overlap = self.calculate_intersection_over_ppe(worker_box, p_arr)
            region_overlap = self.calculate_intersection_over_ppe(est_region, p_arr)
            
            px, py = self.get_box_center(p_arr)
            cx, cy = self.get_box_center(est_region)
            dist = math.sqrt((px-cx)**2 + (py-cy)**2)
            norm_dist = dist / (w_diag + 1e-6)
            
            # Score combines confidence, overlap, and normalized distance
            # Closer to center = better, higher overlap = better, higher conf = better
            if overlap > 0.1 or region_overlap > 0.1 or norm_dist < 0.3:
                score = (overlap * 0.4) + (region_overlap * 0.4) + (item["confidence"] * 0.2) - (norm_dist * 0.5)
                if score > best_score:
                    best_score = score
                    best_match = item
                    
        return best_match

    def analyze_detections(self, detections: List[Dict[str, Any]], img_w: int, img_h: int) -> Dict[str, Any]:
        workers = []
        ppe_lists = {
            "helmet": [],
            "vest": [],
            "gloves": [],
            "boots": [],
            "goggles": []
        }
        equipment_counts = {}
        
        # Categorize
        for det in detections:
            c = det.get("class_name", "")
            if c == "Person":
                workers.append(det)
            elif c == "helmet":
                ppe_lists["helmet"].append(det)
            elif c == "vest":
                ppe_lists["vest"].append(det)
            elif c == "gloves":
                ppe_lists["gloves"].append(det)
            elif c == "boots":
                ppe_lists["boots"].append(det)
            elif c == "goggles":
                ppe_lists["goggles"].append(det)
            else:
                equipment_counts[c] = equipment_counts.get(c, 0) + 1

        workers_results = []
        total_score = 0
        valid_workers = 0
        global_violations = []

        ppe_mapping = {
            "helmet": "head",
            "vest": "torso",
            "gloves": "hands",
            "boots": "feet",
            "goggles": "face"
        }

        for i, worker in enumerate(workers):
            w_box = worker.get("bounding_box", {})
            w_arr = [w_box.get('x1',0), w_box.get('y1',0), w_box.get('x2',0), w_box.get('y2',0)]
            
            res = {
                "worker_id": i + 1,
                "bbox": w_arr,
                "worker_confidence": worker.get("confidence", 0),
                "ppe": {},
                "overall_status": "UNKNOWN"
            }
            
            violations = 0
            unknowns = 0
            
            for ppe_name, region in ppe_mapping.items():
                is_visible = self.check_visibility(w_arr, region, img_w, img_h)
                match = self.associate_ppe(w_arr, ppe_lists[ppe_name], region)
                
                if match:
                    res["ppe"][ppe_name] = {
                        "status": "COMPLIANT",
                        "confidence": match["confidence"],
                        "evidence": f"{ppe_name} associated with visible {region} region",
                        "bbox": match["bounding_box"]
                    }
                else:
                    if is_visible:
                        res["ppe"][ppe_name] = {
                            "status": "VIOLATION",
                            "confidence": 0.0,
                            "evidence": f"{region} sufficiently visible but no {ppe_name} detected",
                            "bbox": None
                        }
                        violations += 1
                        global_violations.append({
                            "type": "ppe_violation",
                            "severity": "high",
                            "description": f"Worker {i+1} is missing {ppe_name}"
                        })
                    else:
                        res["ppe"][ppe_name] = {
                            "status": "UNKNOWN",
                            "confidence": 0.0,
                            "evidence": f"{region} insufficiently visible or ambiguous",
                            "bbox": None
                        }
                        unknowns += 1

            total_ppe_checks = len(ppe_mapping)
            if (unknowns / total_ppe_checks) >= self.inconclusive_threshold:
                res["overall_status"] = "INCONCLUSIVE"
            elif violations > 0:
                res["overall_status"] = "VIOLATION"
                worker_score = max(0, 100 - (violations * 20))
                total_score += worker_score
                valid_workers += 1
            else:
                res["overall_status"] = "COMPLIANT"
                total_score += 100
                valid_workers += 1
                
            workers_results.append(res)

        final_score = None
        if valid_workers > 0:
            final_score = int(total_score / valid_workers)

        return {
            "safety_score": final_score,
            "status": "INCONCLUSIVE" if final_score is None else ("COMPLIANT" if final_score == 100 else "VIOLATION"),
            "workers": workers_results,
            "summary": {
                "workers_detected": len(workers),
                "equipment_detected": sum(equipment_counts.values()),
                "ppe_compliant": sum(1 for w in workers_results if w["overall_status"] == "COMPLIANT"),
                "ppe_violations": sum(1 for w in workers_results if w["overall_status"] == "VIOLATION"),
                "hazards_detected": 0
            },
            "violations": global_violations,
            "equipment": equipment_counts
        }

safety_analyzer = SafetyAnalyzer()
