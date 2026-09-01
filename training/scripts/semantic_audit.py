import os
import glob
from collections import defaultdict
import math

classes = {
    0: 'helmet', 1: 'gloves', 2: 'vest', 3: 'boots', 4: 'goggles', 
    5: 'none', 6: 'Person', 7: 'no_helmet', 8: 'no_goggle', 9: 'no_gloves', 10: 'no_boots'
}

label_dir = r"training\datasets\construction_safety\labels\train"
files = glob.glob(os.path.join(label_dir, "*.txt"))

# Stats to gather
class_areas = defaultdict(list)
co_occurrences = defaultdict(int)
class_counts = defaultdict(int)

def calculate_overlap(box1, box2):
    # box format: x_center, y_center, w, h
    x1, y1, w1, h1 = box1
    x2, y2, w2, h2 = box2
    
    b1_x1, b1_y1 = x1 - w1/2, y1 - h1/2
    b1_x2, b1_y2 = x1 + w1/2, y1 + h1/2
    
    b2_x1, b2_y1 = x2 - w2/2, y2 - h2/2
    b2_x2, b2_y2 = x2 + w2/2, y2 + h2/2
    
    # Intersection
    inter_x1 = max(b1_x1, b2_x1)
    inter_y1 = max(b1_y1, b2_y1)
    inter_x2 = min(b1_x2, b2_x2)
    inter_y2 = min(b1_y2, b2_y2)
    
    if inter_x2 < inter_x1 or inter_y2 < inter_y1:
        return 0.0, 0.0, 0.0
        
    inter_area = (inter_x2 - inter_x1) * (inter_y2 - inter_y1)
    area1 = w1 * h1
    area2 = w2 * h2
    
    # Calculate IoU
    iou = inter_area / float(area1 + area2 - inter_area)
    
    # Calculate Intersection over Area 1 (IoA1) - how much of box1 is covered by box2
    ioa1 = inter_area / float(area1)
    
    # Calculate Intersection over Area 2 (IoA2)
    ioa2 = inter_area / float(area2)
    
    return iou, ioa1, ioa2

none_overlaps_person = 0
none_overlaps_negative = 0
negative_classes = [7, 8, 9, 10]

for f in files:
    with open(f, 'r') as file:
        lines = file.readlines()
        
    img_boxes = []
    present_classes = set()
    
    for line in lines:
        parts = line.strip().split()
        if len(parts) >= 5:
            cls_id = int(parts[0])
            x, y, w, h = map(float, parts[1:5])
            area = w * h
            
            img_boxes.append({
                'cls': cls_id, 'box': (x, y, w, h), 'area': area
            })
            
            class_areas[cls_id].append(area)
            class_counts[cls_id] += 1
            present_classes.add(cls_id)
            
    # Check overlaps in image
    for i in range(len(img_boxes)):
        for j in range(i+1, len(img_boxes)):
            b1 = img_boxes[i]
            b2 = img_boxes[j]
            iou, ioa1, ioa2 = calculate_overlap(b1['box'], b2['box'])
            
            if iou > 0:
                # Check none vs person
                if (b1['cls'] == 5 and b2['cls'] == 6) or (b2['cls'] == 5 and b1['cls'] == 6):
                    none_overlaps_person += 1
                
                # Check none vs negative PPE
                if (b1['cls'] == 5 and b2['cls'] in negative_classes) or (b2['cls'] == 5 and b1['cls'] in negative_classes):
                    none_overlaps_negative += 1

print("--- Class Average Bounding Box Area ---")
for cls_id in sorted(class_areas.keys()):
    avg_area = sum(class_areas[cls_id]) / len(class_areas[cls_id])
    print(f"{classes[cls_id]}: {avg_area:.4f} ({len(class_areas[cls_id])} instances)")

print(f"\\n--- Overlap Analysis ---")
print(f"Instances where 'none' overlaps with 'Person': {none_overlaps_person}")
print(f"Instances where 'none' overlaps with a negative PPE class (no_helmet, no_gloves, etc.): {none_overlaps_negative}")

