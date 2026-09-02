from ultralytics import YOLO

def main():
    # Load the base YOLO11n model
    model = YOLO('yolo11n.pt')
    
    # Train the model with specific optimizations for small construction PPE
    # 1. Increased image size (imgsz=1280) to help detect small objects like goggles/gloves
    # 2. Adjusted mosaic and copy_paste augmentations
    
    results = model.train(
        data='configs/dataset.yaml',
        epochs=100,
        imgsz=1280,
        batch=16,
        name='ppe_training_v4',
        
        # Augmentations for small objects
        mosaic=1.0,
        mixup=0.2,
        copy_paste=0.1,
        degrees=10.0,
        shear=2.0,
        
        # Optimization
        optimizer='auto',
        patience=20,
        save=True
    )

if __name__ == '__main__':
    main()
