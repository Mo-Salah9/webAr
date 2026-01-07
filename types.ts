
export type TransformMode = 'move' | 'rotate' | 'scale' | 'none';

export interface ModelTransform {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
}

export interface ARState {
  isScanning: boolean;
  isDetected: boolean;
  activeMode: TransformMode;
  transform: ModelTransform;
}

export interface GeminiResponse {
  analysis: string;
  suggestions: string[];
}
