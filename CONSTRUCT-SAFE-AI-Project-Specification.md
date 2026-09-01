# CONSTRUCT-SAFE AI
## AI-Powered Construction Site Safety & Visual Inspection System

## 1. Project Goal

Build a complete, production-quality full-stack machine-learning project called **CONSTRUCT-SAFE AI**.

The application demonstrates how computer vision can assist construction and heavy-engineering companies with:

- Construction-site safety monitoring
- PPE compliance
- Worker detection
- Heavy-equipment detection
- Selected visual hazard detection
- AI-assisted inspection reporting

This is an academic/prototype project inspired by real-world engineering workflows. **Do not claim that the system replaces professional safety engineers or provides legally valid safety certification.**

The project must be a **real working application**, not just a UI mockup.

---

## 2. Core User Experience

The user uploads a construction-site or industrial image.

The system should:

1. Validate the image.
2. Send it from the React frontend to the FastAPI backend.
3. Preprocess the image.
4. Run a YOLO-family object-detection model.
5. Detect relevant objects.
6. Apply a configurable safety-rule engine.
7. Identify potential PPE violations and selected visual hazards.
8. Calculate an interpretable project-defined safety assessment score.
9. Return structured results.
10. Display the uploaded image with actual detection bounding boxes.
11. Display an inspection summary.

The first version is **image-based**, not live CCTV/video. The architecture should allow future video/CCTV expansion.

---

## 3. Recommended Technology Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide icons

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic
- Pillow
- PyTorch
- Ultralytics/YOLO ecosystem

### ML

Use a **YOLO-family object-detection model** as the primary computer-vision architecture.

Reason:

The project needs to detect multiple objects and their locations, not merely classify the entire image.

The ML architecture must be modular so the model can later be replaced or fine-tuned without rewriting the API.

---

# 4. ML DATASET STRATEGY

Do not falsely claim that a generic pretrained model accurately understands construction-specific safety violations.

## Phase 1 — Working Prototype

Use a pretrained YOLO model for general object detection where supported.

Clearly document this as:

> Prototype / pretrained inference

Do not fabricate construction-specific detections that the model cannot actually produce.

## Phase 2 — Construction-Specific Training

Prepare the repository so a construction-specific labeled dataset can be used for fine-tuning.

Potential target classes:

```text
person
helmet
safety_vest
safety_boot
gloves
excavator
crane
forklift
truck
concrete_mixer
loader
restricted_zone
open_excavation
safety_barrier
```

The exact classes must match the actual dataset/model being used.

Do not claim training metrics unless the model has actually been trained and evaluated.

If no custom training has been performed, show:

> Model evaluation metrics will be available after custom training.

---

# 5. ML WORKFLOW

Implement:

```text
IMAGE
  ↓
Image Validation
  ↓
Image Preprocessing
  ↓
YOLO Object Detection
  ↓
Bounding Boxes + Classes + Confidence
  ↓
Post Processing
  ↓
PPE / Equipment / Hazard Analysis
  ↓
Safety Rule Engine
  ↓
Safety Assessment
  ↓
Inspection Result
  ↓
React Frontend
```

---

# 6. PPE COMPLIANCE

The system should support PPE analysis.

For each detected worker, determine whether required PPE is visibly detected.

Example:

```text
Worker #1
Helmet: ✓
Safety Vest: ✓
Status: COMPLIANT
```

Example:

```text
Worker #2
Helmet: ✕
Safety Vest: ✓
Status: POTENTIAL VIOLATION
```

Use configurable backend safety rules.

Example:

```python
required_ppe = [
    "helmet",
    "safety_vest"
]
```

Do not hard-code safety logic inside React components.

---

# 7. SAFETY RULE ENGINE

Create a dedicated safety-rule engine.

Suggested architecture:

```text
backend/app/safety/
├── rules.py
├── scoring.py
└── analyzer.py
```

The engine receives ML detections and produces safety observations.

Potential rules:

```text
Person + no helmet
→ Missing helmet observation

Person + no safety vest
→ Missing safety vest observation

Person inside restricted zone
→ Restricted-area observation

Worker extremely close to heavy equipment
→ Equipment proximity observation

Open excavation without visible barrier
→ Potential excavation hazard
```

Important:

These are **AI-assisted visual observations**, not absolute safety conclusions.

Use wording such as:

- Potential hazard detected
- Potential PPE violation
- AI-assisted observation
- Needs human verification

Avoid:

- Safety guaranteed
- Danger confirmed
- Legally compliant
- Official safety certification

---

# 8. SAFETY SCORE

Create an interpretable prototype safety score.

Example:

```text
Base Score = 100

Missing helmet       -20
Missing vest         -15
Restricted zone      -25
Equipment proximity  -20
Other hazard         -10
```

Clamp the score to:

```text
0–100
```

Call it:

> AI Safety Assessment Score

Explain that it is a **project-defined indicator**, not an official industrial safety rating.

Keep scoring rules configurable in the backend.

Only subtract points for observations that are actually generated by the backend.

---

# 9. API

Create:

```text
GET  /api/health
GET  /api/model-info
POST /api/inspect
```

## GET /api/health

Return:

- backend status
- timestamp if appropriate

## GET /api/model-info

Return:

- model name
- model type
- supported classes
- inference device
- model status

## POST /api/inspect

Accept an image upload.

Workflow:

```text
Validation
→ Preprocessing
→ ML inference
→ Post-processing
→ Safety analysis
→ Safety score
→ JSON response
```

---

# 10. API RESPONSE

Use a structured response similar to:

```json
{
  "inspection_id": "generated-id",
  "status": "warning",
  "safety_score": 72,
  "summary": {
    "workers_detected": 5,
    "ppe_compliant": 3,
    "ppe_violations": 2,
    "hazards_detected": 1,
    "equipment_detected": 3
  },
  "detections": [
    {
      "class_name": "person",
      "confidence": 0.96,
      "bounding_box": {
        "x1": 120,
        "y1": 80,
        "x2": 340,
        "y2": 490
      }
    }
  ],
  "violations": [
    {
      "type": "missing_helmet",
      "severity": "high",
      "description": "Potential worker PPE violation detected."
    }
  ],
  "processing_time_ms": 142,
  "model": "YOLO"
}
```

The frontend must visualize **actual backend results**.

Do not hard-code fake detection data.

---

# 11. FRONTEND DESIGN

The UI should feel like a professional:

> Construction Technology / Engineering AI Platform

It should NOT look like a generic AI-generated landing page.

## Design Principles

- Professional
- Minimal
- Engineering-focused
- Clean typography
- Strong hierarchy
- Excellent spacing
- Neutral background
- One restrained accent color
- Subtle borders
- Minimal shadows
- Subtle animation only where useful

Avoid:

- Excessive gradients
- Excessive glassmorphism
- Huge decorative SVGs
- Cartoon illustrations
- Excessive colorful cards
- Overcrowded dashboards
- Unnecessary animations
- Generic “AI futuristic” visual clichés

---

# 12. HOME PAGE

Create a polished professional hero section.

Suggested heading:

> AI-Powered Construction Site Safety

Supporting text:

> Analyze construction-site images with computer vision to identify workers, PPE compliance, equipment and potential visual safety hazards.

Primary CTA:

> Start Inspection

Secondary CTA:

> How It Works

Include a restrained technical workflow visual:

```text
Image
→ Detection
→ Safety Analysis
→ Inspection Report
```

Do not use fake statistics.

Never display invented accuracy such as “98% accuracy”.

---

# 13. IMAGE INSPECTION PAGE

This is the main application.

## Upload Panel

Include:

- Drag and drop
- Browse image
- Image preview
- Remove image
- Replace image
- Supported formats
- File-size validation

Primary button:

> Analyze Site

Loading state:

> Analyzing image...

---

# 14. DETECTION RESULT

After inference, display the uploaded image with actual ML bounding boxes.

Example:

```text
┌──────────────────────────────┐
│                              │
│     CONSTRUCTION IMAGE       │
│                              │
│   ┌───────────┐              │
│   │ WORKER    │              │
│   └───────────┘              │
│                              │
│       ┌──────────┐           │
│       │ EXCAVATOR│           │
│       └──────────┘           │
│                              │
└──────────────────────────────┘
```

Provide:

> Show / Hide Detections

Use actual returned bounding boxes.

---

# 15. INSPECTION DASHBOARD

Display:

## Overall Assessment

```text
Safety Assessment
72 / 100

STATUS
Needs Attention
```

## Detection Summary

```text
Workers          5
PPE Compliant    3
Violations       2
Hazards          1
Equipment        3
```

Only display values calculated from the actual backend response.

---

# 16. PPE COMPLIANCE UI

Example:

```text
Helmet
████████████████░░ 80%

Safety Vest
██████████████░░░░ 70%
```

Percentages must be calculated from real detection data.

Do not hard-code them.

---

# 17. VIOLATION PANEL

Example:

```text
SAFETY OBSERVATIONS

HIGH
Missing helmet
Potential PPE violation detected.

MEDIUM
Missing safety vest
Potential PPE violation detected.

LOW
Equipment proximity warning
Worker appears close to heavy equipment.
```

Each observation should include:

- severity
- type
- description
- related detection if available

---

# 18. EQUIPMENT PANEL

Display detected equipment only if returned by the model.

Example:

```text
Equipment Detected

Excavator       2
Truck           1
Crane           1
Forklift        0
```

---

# 19. TECHNICAL EXPLANATION

Create a dedicated section explaining the system simply.

Workflow:

```text
IMAGE
 ↓
PREPROCESSING
 ↓
YOLO OBJECT DETECTION
 ↓
BOUNDING BOXES
 ↓
PPE / EQUIPMENT ANALYSIS
 ↓
SAFETY RULE ENGINE
 ↓
SAFETY ASSESSMENT
 ↓
INSPECTION REPORT
```

Explain:

## Object Detection

The model identifies objects and their locations in an image.

## Confidence

Confidence represents the model's confidence in an individual detection.

It is **not** the model's overall accuracy.

## Safety Rules

Detected objects are evaluated against project-defined rules.

## Model Evaluation

Proper model evaluation requires a labeled test dataset.

Use metrics such as:

- Precision
- Recall
- F1-score
- mAP
- Confusion Matrix where appropriate
- Inference time

Never invent these metrics.

---

# 20. BACKEND FOLDER STRUCTURE

Create:

```text
backend/
│
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── health.py
│   │       ├── inspection.py
│   │       └── model.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── logging.py
│   │
│   ├── ml/
│   │   ├── model_loader.py
│   │   ├── inference.py
│   │   ├── preprocessing.py
│   │   └── postprocessing.py
│   │
│   ├── safety/
│   │   ├── rules.py
│   │   ├── scoring.py
│   │   └── analyzer.py
│   │
│   ├── schemas/
│   │   └── inspection.py
│   │
│   └── main.py
│
├── models/
│
├── tests/
│
├── requirements.txt
├── .env.example
└── README.md
```

---

# 21. FRONTEND FOLDER STRUCTURE

Create:

```text
frontend/
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   │   └── api.ts
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── assets/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── package.json
├── vite.config.ts
└── README.md
```

Suggested components:

```text
Header
HeroSection
UploadPanel
ImagePreview
InspectionControls
DetectionOverlay
InspectionSummary
SafetyScore
PPECompliance
ViolationList
EquipmentDetected
ProcessingIndicator
TechnicalDetails
Footer
```

---

# 22. ROOT STRUCTURE

Final repository:

```text
construct-safe-ai/
│
├── frontend/
├── backend/
│
├── docs/
│   ├── architecture.md
│   ├── ml-workflow.md
│   └── project-presentation.md
│
├── .gitignore
├── README.md
└── LICENSE
```

---

# 23. NO DATABASE

Do NOT implement a database.

The first version is stateless:

```text
Upload
 ↓
Analyze
 ↓
Return result
 ↓
Display result
```

Do not permanently store uploaded images.

Do not implement authentication.

Do not store user information.

A database can be added in a future version for:

- user accounts
- inspection history
- analytics
- audit records

But it is intentionally excluded from version 1.

---

# 24. PRIVACY

Process uploaded images temporarily.

Clean up temporary files after inference when appropriate.

Do not permanently save construction-site images by default.

Document this design decision in the README.

---

# 25. PERFORMANCE

Implement:

- Load the ML model once during application startup.
- Never reload the model for every request.
- Use inference/no-gradient mode.
- Resize images appropriately.
- Validate file size.
- Validate MIME type and image contents.
- Avoid unnecessary disk operations.
- Return inference timing.
- Optimize frontend bundle.
- Make inference work on a normal development laptop without requiring a GPU.

---

# 26. ERROR HANDLING

Handle:

- Missing image
- Invalid image
- Corrupted image
- Unsupported format
- Oversized file
- Backend unavailable
- Model unavailable
- Inference failure
- Timeout
- Malformed response

Frontend should show clean user-friendly messages.

Never expose raw Python stack traces.

---

# 27. GITHUB READINESS

Make the entire repository GitHub-ready.

Create:

- `.gitignore`
- Root README
- Frontend README
- Backend README
- `.env.example`
- Clear installation instructions
- API documentation
- Architecture documentation
- ML workflow documentation
- Deployment instructions

Never commit:

```text
.env
node_modules/
.venv/
venv/
uploaded images
secrets
API keys
unnecessary model checkpoints
```

If model weights are too large for normal GitHub use, document how to obtain them instead of committing them blindly.

---

# 28. ROOT README

Include:

```text
CONSTRUCT-SAFE AI

Project Overview
Problem Statement
Objectives
Key Features
Technology Stack
System Architecture
ML Workflow
Dataset Strategy
Model Architecture
Safety Rule Engine
API Documentation
Folder Structure
Installation
Frontend Setup
Backend Setup
Running the Project
Testing
Model Evaluation
Deployment
Limitations
Future Scope
```

Also include:

## Viva / Presentation Explanation

Explain:

- Why computer vision?
- Why object detection?
- Why YOLO?
- What is a bounding box?
- What is confidence?
- What is mAP?
- Why no database?
- Why FastAPI?
- Why React?
- What are the limitations?
- What is future scope?

---

# 29. DEPLOYMENT

The project must be deployment-ready.

Important:

GitHub is used for source-code hosting.

Do NOT claim GitHub Pages can run the Python FastAPI ML backend.

Deployment architecture:

```text
GitHub Repository
       │
       ├───────────────┐
       ▼               ▼
 Frontend Hosting   Backend Hosting
       │               │
       └───────┬───────┘
               ▼
       Working Application
```

Frontend must use:

```text
VITE_API_URL
```

Example local configuration:

```text
VITE_API_URL=http://localhost:8000
```

Backend should use environment variables for configuration.

Never commit secrets.

Document suitable deployment options for:

- React frontend
- FastAPI backend

---

# 30. FUTURE SCOPE

Document, but do not necessarily implement, these future phases:

## Phase 2
Construction-specific dataset.

## Phase 3
Fine-tuned PPE/hazard detection model.

## Phase 4
Video/CCTV analysis.

## Phase 5
Real-time worker tracking.

## Phase 6
Drone image inspection.

## Phase 7
Equipment anomaly detection.

## Phase 8
Automated safety alerts.

## Phase 9
IoT integration.

## Phase 10
Enterprise safety analytics dashboard.

---

# 31. ADVANCED EQUIPMENT INSPECTION EXTENSION

Design the architecture so an equipment/component inspection model can later be added.

Example:

```text
Construction Site Mode
→ Worker + PPE + Equipment + Hazard Detection

Equipment Inspection Mode
→ Surface anomaly / defect detection
```

Do not fake defect detection if the required trained model/dataset is unavailable.

Keep this as an extension point.

---

# 32. ENGINEERING TERMINOLOGY

Use technically responsible wording.

Use:

> AI-assisted visual safety inspection

instead of:

> AI guarantees site safety

Use:

> Potential hazard detected

instead of:

> Danger confirmed

Use:

> Model confidence

instead of:

> Prediction accuracy

Use:

> AI Safety Assessment Score

instead of:

> Official safety rating

Use:

> Potential PPE violation

instead of:

> Worker is definitely unsafe

This distinction is important for an engineering project.

---

# 33. PROJECT EXPLANATION FOR STAFF

The project should be explainable using this short description:

> CONSTRUCT-SAFE AI is an AI-assisted construction-site visual inspection system that uses computer vision to detect workers, PPE and equipment from site images. A configurable safety-rule engine analyzes the detections to identify potential PPE violations and selected visual hazards, then generates an interpretable inspection summary.

Core workflow:

```text
Construction Image
        ↓
YOLO Object Detection
        ↓
Workers / PPE / Equipment
        ↓
Safety Rule Engine
        ↓
Potential Violations
        ↓
AI Safety Assessment
        ↓
Inspection Report
```

---

# 34. IMPORTANT ML HONESTY REQUIREMENTS

Never:

- fabricate training results
- fabricate accuracy
- fabricate precision/recall
- fabricate mAP
- fabricate detections
- pretend a pretrained model understands classes it was not trained for
- claim legal safety certification

If a feature cannot work without a custom-trained model, implement the architecture and clearly document what is required.

The project should prefer **technical honesty over visual impressiveness**.

---

# 35. FINAL QUALITY CHECK

Before considering the project complete, verify:

## Frontend

- [ ] Starts successfully
- [ ] Responsive
- [ ] Professional UI
- [ ] Image upload works
- [ ] Preview works
- [ ] Loading state works
- [ ] Error states work
- [ ] Results render correctly
- [ ] Actual bounding boxes render correctly

## Backend

- [ ] Starts successfully
- [ ] `/api/health` works
- [ ] `/api/model-info` works
- [ ] `/api/inspect` works
- [ ] CORS configured correctly
- [ ] Image validation works
- [ ] Model loads once
- [ ] Inference works
- [ ] JSON response is valid
- [ ] Temporary files are cleaned

## ML

- [ ] Real model inference
- [ ] No fake predictions
- [ ] No fake accuracy metrics
- [ ] Confidence correctly explained
- [ ] Supported classes documented
- [ ] Custom training path documented
- [ ] Model evaluation procedure documented

## GitHub

- [ ] Clean repository
- [ ] No `node_modules`
- [ ] No virtual environment
- [ ] No `.env`
- [ ] No secrets
- [ ] No unnecessary uploaded images
- [ ] Clear README
- [ ] Clear installation instructions
- [ ] Clear architecture documentation
- [ ] Deployment instructions included

---

# 36. FINAL PRODUCT STANDARD

The finished application should feel like a small but credible:

**Construction Technology / Industrial AI Product**

It should demonstrate:

- Computer vision
- Object detection
- ML inference
- Image preprocessing
- Safety-rule reasoning
- REST API development
- React frontend development
- Backend architecture
- Model evaluation concepts
- Deployment readiness

The project must be modular, maintainable, visually polished, technically honest, and easy for a student to explain during a project viva or interview.

Build the actual working project, not just a prototype UI.
