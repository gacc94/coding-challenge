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

export interface MatrixStats {
  max: number;
  min: number;
  sum: number;
  elements: number;
  isDiagonal: boolean;
}

export type MatrixArray = number[][][];

export interface StatsRequestBody {
  matrices: MatrixArray;
}
