import type { RotationType } from './rotation.types';

export interface FactorizationRequest {
  matrix: number[][];
  rotation: RotationType;
}

export interface FactorizationResponse {
  original: number[][];
  rotated: number[][];
  rotation: string;
  Q: number[][];
  R: number[][];
  stats: StatsResponse | null;
}

export interface StatsResponse {
  max: number;
  min: number;
  average: number;
  sum: number;
  totalElements: number;
  numberOfMatrices: number;
  diagonalMatrices: DiagonalResult;
}

export interface DiagonalResult {
  count: number;
  matrices: DiagonalMatrixInfo[];
}

export interface DiagonalMatrixInfo {
  matrixIndex: number;
  name: string;
  dimensions: string;
}
