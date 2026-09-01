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

export interface InspectionResponse {
  inspection_id: string;
  status: "compliant" | "warning";
  safety_score: number;
  summary: InspectionSummary;
  equipment_detected: Record<string, number>;
  detections: Detection[];
  violations: Violation[];
  processing_time_ms: number;
  model: string;
}
