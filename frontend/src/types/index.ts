export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Detection {
  class_name: string;
  confidence: number;
  bounding_box: BoundingBox;
}

export interface Violation {
  type: string;
  severity: "high" | "medium" | "low" | "info";
  description: string;
}

export interface InspectionSummary {
  workers_detected: number;
  ppe_compliant: number | null;
  ppe_violations: number;
  hazards_detected: number;
  equipment_detected: number;
}

export interface WorkerPpeStatus {
  status: "COMPLIANT" | "VIOLATION" | "UNKNOWN";
  confidence: number;
  evidence: string;
  bbox: number[] | null;
}

export interface WorkerResult {
  worker_id: number;
  bbox: number[];
  worker_confidence: number;
  ppe: {
    helmet: WorkerPpeStatus;
    vest: WorkerPpeStatus;
    gloves: WorkerPpeStatus;
    boots: WorkerPpeStatus;
    goggles: WorkerPpeStatus;
  };
  overall_status: "COMPLIANT" | "VIOLATION" | "INCONCLUSIVE" | "UNKNOWN";
}

export interface InspectionResponse {
  inspection_id: string;
  status: "COMPLIANT" | "VIOLATION" | "INCONCLUSIVE" | "compliant" | "warning" | "inconclusive";
  safety_score: number | null;
  summary: InspectionSummary;
  workers?: WorkerResult[];
  equipment_detected: Record<string, number>;
  detections: Detection[];
  violations: Violation[];
  processing_time_ms: number;
  model: string;
  confidence_threshold: number;
  annotated_image_base64: string | null;
}
