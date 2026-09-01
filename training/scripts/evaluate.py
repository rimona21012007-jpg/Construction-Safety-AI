import argparse
from ultralytics import YOLO
import os

def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate custom YOLO model on test set")
    parser.add_argument('--model', type=str, required=True, help='Path to trained weights (e.g., best.pt)')
    parser.add_argument('--data', type=str, default='../configs/dataset.yaml', help='Path to dataset yaml')
    parser.add_argument('--img_size', type=int, default=640, help='Image size')
    parser.add_argument('--project', type=str, default='../runs', help='Output project directory')
    parser.add_argument('--name', type=str, default='ppe_eval', help='Experiment name')
    
    return parser.parse_args()

def main():
    args = parse_args()
    
    # Load the trained model
    model = YOLO(args.model)
    
    # Evaluate on the test split
    print(f"Evaluating model {args.model} on test set...")
    metrics = model.val(
        data=args.data,
        split='test',
        imgsz=args.img_size,
        project=args.project,
        name=args.name,
        verbose=True
    )
    
    print("\n--- Test Metrics ---")
    print(f"mAP50-95: {metrics.box.map}")
    print(f"mAP50: {metrics.box.map50}")
    
    # Extract per-class metrics
    class_indices = metrics.box.ap_class_index
    precision = metrics.box.p
    recall = metrics.box.r
    ap50 = metrics.box.ap50
    ap = metrics.box.ap
    
    names = model.names
    
    print("\n--- Per-Class Metrics ---")
    print(f"{'Class':<15} {'Precision':<12} {'Recall':<12} {'mAP@0.5':<12} {'mAP@0.5:0.95':<12}")
    
    # Safely iterate based on the returned numpy arrays
    for i, c in enumerate(class_indices):
        name = names[c]
        p = precision[i]
        r = recall[i]
        map50 = ap50[i]
        map_all = ap[i]
        print(f"{name:<15} {p:<12.4f} {r:<12.4f} {map50:<12.4f} {map_all:<12.4f}")
        
    # F1 Score is not directly in `metrics.box`, but we can estimate or compute it from precision and recall:
    # However, ultralytics automatically generates F1_curve.png in the output directory.
    print(f"\nEvaluation complete. Detailed results and curves saved to: {os.path.join(args.project, args.name)}")

if __name__ == '__main__':
    main()
