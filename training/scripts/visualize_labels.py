import os
import random
import yaml
import cv2
import glob

def visualize_samples(dataset_path, output_dir, num_samples=5):
    os.makedirs(output_dir, exist_ok=True)
    
    with open(os.path.join(dataset_path, "data.yaml"), 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    names = data.get('names', [])
    if isinstance(names, dict):
        names = [names[i] for i in range(len(names))]
        
    img_dir = os.path.join(dataset_path, "images", "train")
    lbl_dir = os.path.join(dataset_path, "labels", "train")
    
    images = glob.glob(os.path.join(img_dir, "*.*"))
    if not images:
        print("No images found to visualize.")
        return
        
    samples = random.sample(images, min(num_samples, len(images)))
    
    colors = [(random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)) for _ in range(len(names))]
    
    for i, img_path in enumerate(samples):
        img_name = os.path.basename(img_path)
        base_name = os.path.splitext(img_name)[0]
        lbl_path = os.path.join(lbl_dir, f"{base_name}.txt")
        
        img = cv2.imread(img_path)
        if img is None:
            continue
            
        h, w, _ = img.shape
        
        if os.path.exists(lbl_path):
            with open(lbl_path, 'r', encoding='utf-8') as f:
                for line in f:
                    parts = line.strip().split()
                    if not parts:
                        continue
                    cls_id = int(parts[0])
                    x_c, y_c, bw, bh = map(float, parts[1:5])
                    
                    # Convert YOLO format back to pixel coordinates
                    x_center = x_c * w
                    y_center = y_c * h
                    width = bw * w
                    height = bh * h
                    
                    x1 = int(x_center - width / 2)
                    y1 = int(y_center - height / 2)
                    x2 = int(x_center + width / 2)
                    y2 = int(y_center + height / 2)
                    
                    label = names[cls_id] if cls_id < len(names) else f"unknown_{cls_id}"
                    color = colors[cls_id] if cls_id < len(colors) else (255, 255, 255)
                    
                    cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(img, label, (x1, max(y1 - 5, 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                    
        out_path = os.path.join(output_dir, f"sample_{i+1}.jpg")
        cv2.imwrite(out_path, img)
        print(f"Saved sample visualization to {out_path}")

if __name__ == "__main__":
    visualize_samples(r"training\datasets\construction_safety", r"training\samples")
