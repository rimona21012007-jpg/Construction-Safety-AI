import argparse
from ultralytics import YOLO
import shutil
import os

def parse_args():
    parser = argparse.ArgumentParser(description="Export custom YOLO model")
    parser.add_argument('--model', type=str, required=True, help='Path to trained weights (e.g., best.pt)')
    parser.add_argument('--format', type=str, default='onnx', help='Format to export (e.g., onnx, engine, tflite)')
    parser.add_argument('--deploy_path', type=str, help='Optional path to copy the exported model to')
    
    return parser.parse_args()

def main():
    args = parse_args()
    
    print(f"Loading model from {args.model}")
    model = YOLO(args.model)
    
    print(f"Exporting model to {args.format}...")
    # YOLO returns the path to the exported model
    export_path = model.export(format=args.format)
    print(f"Export complete: {export_path}")
    
    if args.deploy_path:
        os.makedirs(os.path.dirname(args.deploy_path), exist_ok=True)
        shutil.copy(export_path, args.deploy_path)
        print(f"Copied exported model to {args.deploy_path}")

if __name__ == '__main__':
    main()
