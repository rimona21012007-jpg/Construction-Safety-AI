import argparse
from ultralytics import YOLO
import os

def parse_args():
    parser = argparse.ArgumentParser(description="Train custom YOLO model for PPE detection")
    parser.add_argument('--model', type=str, default='yolo11n.pt', help='Path to base model')
    parser.add_argument('--data', type=str, default='../configs/dataset.yaml', help='Path to dataset yaml')
    parser.add_argument('--epochs', type=int, default=50, help='Number of epochs')
    parser.add_argument('--batch', type=int, default=16, help='Batch size')
    parser.add_argument('--img_size', type=int, default=640, help='Image size')
    parser.add_argument('--device', type=str, default='', help='Device (cuda/cpu)')
    parser.add_argument('--workers', type=int, default=8, help='DataLoader workers')
    parser.add_argument('--patience', type=int, default=15, help='Early stopping patience')
    parser.add_argument('--project', type=str, default='../runs', help='Output project directory')
    parser.add_argument('--name', type=str, default='ppe_training', help='Experiment name')
    
    return parser.parse_args()

def main():
    args = parse_args()
    
    # Load a model
    model = YOLO(args.model)  # load a pretrained model
    
    # Train the model
    # We use YOLO's auto-balancing (e.g. focal loss or class weights can be implicitly handled, 
    # but ultralytics generally handles moderate imbalance well. We will rely on mAP evaluation).
    results = model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.img_size,
        batch=args.batch,
        patience=args.patience,
        device=args.device if args.device else None,
        workers=args.workers,
        project=args.project,
        name=args.name,
        verbose=True
    )
    
    print("Training complete. Results saved to:", os.path.join(args.project, args.name))

if __name__ == '__main__':
    main()
