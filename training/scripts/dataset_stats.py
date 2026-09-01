import os
import yaml
import glob
from collections import Counter
from PIL import Image

def analyze_dataset(dataset_path):
    print(f"Analyzing dataset at: {dataset_path}")
    
    yaml_path = os.path.join(dataset_path, "data.yaml")
    
    if not os.path.exists(yaml_path):
        print(f"Error: {yaml_path} not found.")
        # Try to find any yaml file
        yamls = glob.glob(os.path.join(dataset_path, "*.yaml"))
        if yamls:
            yaml_path = yamls[0]
            print(f"Found alternative yaml: {yaml_path}")
        else:
            return
            
    with open(yaml_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
        
    names = data.get('names', [])
    if isinstance(names, dict):
        # Convert to list if it's a dict (YOLO format variant)
        names = [names[i] for i in range(len(names))]
    
    print(f"Found {len(names)} classes:")
    for i, name in enumerate(names):
        print(f"  {i}: {name}")
        
    stats = {}
    total_images = 0
    total_annotations = 0
    corrupt_images = 0
    
    splits = ['train', 'val', 'valid', 'test']
    
    for split in splits:
        img_dir = os.path.join(dataset_path, "images", split)
        lbl_dir = os.path.join(dataset_path, "labels", split)
        
        if not os.path.exists(img_dir):
            continue
            
        images = glob.glob(os.path.join(img_dir, "*.*"))
        labels = glob.glob(os.path.join(lbl_dir, "*.txt"))
        
        stats[split] = {
            "images": len(images),
            "labels": len(labels),
            "class_counts": Counter()
        }
        
        for img_path in images:
            total_images += 1
            try:
                with Image.open(img_path) as img:
                    img.verify()
            except Exception:
                corrupt_images += 1
                
        for lbl_path in labels:
            with open(lbl_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                total_annotations += len(lines)
                for line in lines:
                    parts = line.strip().split()
                    if parts:
                        try:
                            cls_id = int(parts[0])
                            if cls_id < len(names):
                                stats[split]["class_counts"][names[cls_id]] += 1
                            else:
                                stats[split]["class_counts"][f"unknown_{cls_id}"] += 1
                        except ValueError:
                            pass
                            
    print("\n--- Dataset Statistics ---")
    print(f"Total Images: {total_images}")
    print(f"Corrupt Images: {corrupt_images}")
    print(f"Total Annotations: {total_annotations}")
    
    for split, data in stats.items():
        print(f"\nSplit: {split}")
        print(f"  Images: {data['images']}")
        print(f"  Labels files: {data['labels']}")
        print("  Class distribution:")
        for cls_name, count in data["class_counts"].most_common():
            print(f"    {cls_name}: {count}")

if __name__ == "__main__":
    analyze_dataset(r"training\datasets\construction_safety")
