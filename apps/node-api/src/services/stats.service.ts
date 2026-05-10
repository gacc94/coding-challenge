import type {
  StatsResponse,
  MatrixArray,
  MatrixStats,
  DiagonalMatrixInfo,
} from '../types/matrix.types';

export class StatsService {
  calculateStats(matrices: MatrixArray): StatsResponse {
    let globalMax = -Infinity;
    let globalMin = Infinity;
    let globalSum = 0;
    let totalElements = 0;
    const diagonalMatrices: DiagonalMatrixInfo[] = [];

    matrices.forEach((matrix, index) => {
      const { max, min, sum, elements, isDiagonal } = this.analyzeMatrix(matrix);

      globalMax = Math.max(globalMax, max);
      globalMin = Math.min(globalMin, min);
      globalSum += sum;
      totalElements += elements;

      if (isDiagonal) {
        diagonalMatrices.push({
          matrixIndex: index,
          name: this.getMatrixName(index),
          dimensions: `${matrix.length}x${matrix[0].length}`,
        });
      }
    });

    return {
      max: globalMax,
      min: globalMin,
      average: totalElements > 0 ? globalSum / totalElements : 0,
      sum: globalSum,
      totalElements,
      numberOfMatrices: matrices.length,
      diagonalMatrices: {
        count: diagonalMatrices.length,
        matrices: diagonalMatrices,
      },
    };
  }

  private analyzeMatrix(matrix: number[][]): MatrixStats {
    let max = -Infinity;
    let min = Infinity;
    let sum = 0;
    let elements = 0;

    for (const row of matrix) {
      for (const value of row) {
        max = Math.max(max, value);
        min = Math.min(min, value);
        sum += value;
        elements++;
      }
    }

    return {
      max,
      min,
      sum,
      elements,
      isDiagonal: this.isDiagonal(matrix),
    };
  }

  private isDiagonal(matrix: number[][], tolerance = 1e-10): boolean {
    const n = matrix.length;
    if (!matrix.every((row) => row.length === n)) {
      return false;
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j && Math.abs(matrix[i][j]) > tolerance) {
          return false;
        }
      }
    }

    return true;
  }

  private getMatrixName(index: number): string {
    const names = ['Q (Orthogonal)', 'R (Upper Triangular)', 'Rotated Matrix'];
    return names[index] ?? `Matrix ${index + 1}`;
  }
}
