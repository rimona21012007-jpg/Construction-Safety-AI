# Phase 2: Custom Construction-Specific ML Training Plan

This document details the strategy for fine-tuning a custom YOLO model for the CONSTRUCT-SAFE AI project.

## 1. Dataset Name and Source URL
- **Name:** Construction Site Safety Image Dataset (Roboflow Universe)
- **Source URL:** `https://universe.roboflow.com/roboflow-universe-projects/construction-site-safety` 
- *(Also mirrored on Kaggle at: `https://www.kaggle.com/datasets/muhammetaksoy/construction-site-safety-image-dataset-roboflow`)*

## 2. Dataset Size
- **Total Images:** 2,876 images
- **Train Set:** 2,548 images (88.6%)
- **Validation Set:** 121 images (4.2%)
- **Test Set:** 207 images (7.2%)

## 3. Complete List of Classes
The dataset contains exactly 10 annotated classes:
1. `Hardhat`
2. `Mask`
3. `NO-Hardhat`
4. `NO-Mask`
5. `NO-Safety Vest`
6. `Person`
7. `Safety Cone`
8. `Safety Vest`
9. `machinery`
10. `vehicle`

## 4. Exact Annotations Available
- **person:** Annotated as `Person`. (Draws a box around the entire human body).
- **helmet / hardhat:** Annotated as `Hardhat`. (Draws a box around the helmet itself).
- **no-helmet / no-hardhat:** Annotated as `NO-Hardhat`. (Draws a box around a bare human head).
- **safety vest:** Annotated as `Safety Vest`.
- **no-safety vest:** Annotated as `NO-Safety Vest`.
- **other PPE:** Annotated as `Mask` and `NO-Mask`. (Gloves and Boots are NOT annotated in this dataset).
- **construction equipment:** Annotated generally as `machinery` (excavators, cranes) and `vehicle` (dump trucks).
- **hazards:** Annotated as `Safety Cone` (often used to mark open hazards/zones).

**Crucial Distinction: The "NO-Hardhat" Strategy**
`NO-Hardhat` and `NO-Safety Vest` are intended to be treated as **explicit object classes**. We will not infer helmet compliance simply by checking if a `Person` bounding box contains a `Hardhat` bounding box. 
*Reasoning:* Inferring compliance by absence is dangerous in ML. If a model fails to detect a helmet due to occlusion or poor lighting (a false negative), an inference-based system would incorrectly flag a violation. By training explicit `NO-Hardhat` and `NO-Safety Vest` classes, the model actively learns the visual features of bare heads and normal clothing, drastically reducing false positive violations.

## 5. Dataset License
- **License:** CC BY 4.0 (Creative Commons Attribution 4.0 International)
- **Suitability:** Yes, this license explicitly permits sharing, copying, redistributing, remixing, and building upon the material for any purpose, including commercial and academic use, as long as appropriate credit is given to Roboflow. It is fully legally suitable for a GitHub portfolio project and custom model training.

## 6. YOLO11 Suitability
- **Format:** The dataset is available in YOLO PyTorch format (normalized `x_center y_center width height` text files).
- **Suitability:** It is perfectly formatted for immediate use with Ultralytics YOLO11 pipelines without requiring complex bounding-box conversions.

## 7. Duplicate/Overlapping Datasets Considered
- **Construction-PPE (Ultralytics Hub):** Has 1,416 images, but lacks machinery/vehicle classes completely.
- **CHV (Construction Hardhat Vest) Dataset:** Highly cited in academia, but often lacks the specific `NO-Hardhat` negative classes, making violation detection less reliable.
- *Decision:* The Roboflow dataset was chosen because it merges PPE, negative PPE classes, and equipment into a single unified dataset, preventing us from having to train multiple models or manually merge and re-label disjointed datasets.

## 8. Proposed Final Class Mapping
Since the raw dataset has 10 classes, we will map them slightly to align with our backend safety terminology:
1. `Hardhat` → `helmet`
2. `Mask` → `mask` *(Excluded from active scoring, but detected)*
3. `NO-Hardhat` → `no_helmet`
4. `NO-Mask` → `no_mask` *(Excluded from active scoring)*
5. `NO-Safety Vest` → `no_safety_vest`
6. `Person` → `person`
7. `Safety Cone` → `safety_cone`
8. `Safety Vest` → `safety_vest`
9. `machinery` → `machinery`
10. `vehicle` → `vehicle`

*Note: Gloves and Boots are excluded from Phase 2 due to a lack of reliable annotations in the selected dataset.*

## 9. Train/Validation/Test Split
We will use the dataset's native split to ensure comparability with other researchers:
- **Train (88.6%):** Used to compute the loss and update model weights.
- **Validation (4.2%):** Evaluated at the end of every epoch to calculate mAP and trigger Early Stopping if the model begins overfitting.
- **Test (7.2%):** Held out entirely until the final `best.pt` is produced, providing an unbiased evaluation of real-world accuracy.

## 10. YOLO11n Training Configuration
- **Model:** YOLO11n (Nano)
- **Reasoning:** YOLO11n is incredibly lightweight (~6MB weights) and fast, achieving real-time inference on CPUs (like standard laptops). For a student/prototype project, deploying a massive model (YOLO11x) that requires a dedicated GPU for inference is impractical. YOLO11n provides the best balance of speed and acceptable mAP for prototyping.
- **Image Size:** 640x640 (Standard YOLO resolution; prevents losing small objects like distant helmets).
- **Epochs:** 50
- **Batch Size:** 16 (Optimal for standard 16GB VRAM GPUs).
- **Patience:** 15 (Stops training if validation mAP doesn't improve for 15 epochs).
- **Augmentation:** Standard Ultralytics mosaic and HSV augmentation to simulate varying weather and lighting.

## 11. Hardware Requirements
- **Training:** A GPU is highly recommended. Google Colab (Free Tier with NVIDIA T4 16GB) can train this dataset on YOLO11n for 50 epochs in approximately 45-60 minutes.
- **Inference (Deployment):** Standard Local CPU (Intel i5/i7 or Apple Silicon). YOLO11n will run inference in ~50-150ms per image on a CPU, which is perfectly acceptable for our stateless FastAPI upload architecture.

## 12. Evaluation Methodology
The `ultralytics` package automatically computes these metrics during the test phase:
- **Precision (P):** *True Positives / (True Positives + False Positives).* High precision means when the model flags a `NO-Hardhat` violation, it is usually correct (few false alarms).
- **Recall (R):** *True Positives / (True Positives + False Negatives).* High recall means the model catches most of the actual violations in the image (few missed violations).
- **mAP@0.5:** Mean Average Precision at an IoU (Intersection over Union) threshold of 0.5. This measures how well the model finds the objects and gets the bounding box generally right.
- **mAP@0.5:0.95:** Mean Average Precision averaged across strict IoU thresholds (0.5 to 0.95). This measures how perfectly the bounding boxes align with the ground truth.
- **F1-Score:** The harmonic mean of Precision and Recall, evaluated via the F1-Confidence curve to find the optimal confidence threshold for deployment.

## 13. Integration into Phase 1 Backend
1. The training pipeline exports `best.pt`.
2. We copy `best.pt` to `backend/models/custom_safety_model.pt`.
3. We update `backend/app/ml/model_loader.py` to point to the new file.
4. When `backend/app/safety/rules.py` calls `ml_manager.model.names`, it will now see classes like `helmet`, `no_helmet`, and `safety_vest`.
5. The `rules.py` logic automatically detects these classes and begins applying exact scoring logic (e.g., deducting points for `no_helmet` detections) instead of displaying the "Unknown PPE" warning. The React frontend requires zero changes, as it dynamically renders whatever the backend provides.

## 14. Potential Limitations & Dataset Biases
- **Class Imbalance:** `Person` and `Hardhat` annotations usually vastly outnumber `NO-Hardhat` annotations, meaning the model might be slightly biased towards assuming a worker is compliant.
- **Generic Equipment:** The dataset merges multiple vehicle types into `vehicle` and `machinery`. We cannot distinguish a dump truck from a concrete mixer.
- **Weather/Lighting:** If the dataset was collected primarily in daylight/sunny conditions, the model may perform poorly on night-shift or highly shadowed construction site images.
