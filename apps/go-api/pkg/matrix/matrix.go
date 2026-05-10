package matrix

import (
	"fmt"
	"math"
)

// RotationType enum
const (
	RotationNone           = "none"
	RotationClockwise90    = "clockwise_90"
	RotationClockwise180   = "clockwise_180"
	RotationClockwise270   = "clockwise_270"
	RotationTranspose      = "transpose"
	RotationHorizontalFlip = "horizontal_flip"
	RotationVerticalFlip   = "vertical_flip"
)

var ValidRotations = []string{
	RotationNone,
	RotationClockwise90,
	RotationClockwise180,
	RotationClockwise270,
	RotationTranspose,
	RotationHorizontalFlip,
	RotationVerticalFlip,
}

func IsValidRotation(r string) bool {
	for _, v := range ValidRotations {
		if v == r {
			return true
		}
	}
	return false
}

// Rotate aplica la rotación especificada a una matriz 2D
func Rotate(data [][]float64, rotationType string) ([][]float64, error) {
	switch rotationType {
	case RotationNone:
		return deepCopy(data), nil
	case RotationClockwise90:
		return rotateClockwise90(data), nil
	case RotationClockwise180:
		return rotateClockwise180(data), nil
	case RotationClockwise270:
		return rotateClockwise270(data), nil
	case RotationTranspose:
		return transposeMatrix(data), nil
	case RotationHorizontalFlip:
		return horizontalFlip(data), nil
	case RotationVerticalFlip:
		return verticalFlip(data), nil
	default:
		return nil, fmt.Errorf("invalid rotation type: %s", rotationType)
	}
}

func deepCopy(src [][]float64) [][]float64 {
	dst := make([][]float64, len(src))
	for i, row := range src {
		dst[i] = make([]float64, len(row))
		copy(dst[i], row)
	}
	return dst
}

func rotateClockwise90(matrix [][]float64) [][]float64 {
	rows := len(matrix)
	cols := len(matrix[0])
	result := make([][]float64, cols)
	for i := 0; i < cols; i++ {
		result[i] = make([]float64, rows)
		for j := 0; j < rows; j++ {
			result[i][j] = matrix[rows-1-j][i]
		}
	}
	return result
}

func rotateClockwise180(matrix [][]float64) [][]float64 {
	rows := len(matrix)
	cols := len(matrix[0])
	result := make([][]float64, rows)
	for i := 0; i < rows; i++ {
		result[i] = make([]float64, cols)
		for j := 0; j < cols; j++ {
			result[i][j] = matrix[rows-1-i][cols-1-j]
		}
	}
	return result
}

func rotateClockwise270(matrix [][]float64) [][]float64 {
	rows := len(matrix)
	cols := len(matrix[0])
	result := make([][]float64, cols)
	for i := 0; i < cols; i++ {
		result[i] = make([]float64, rows)
		for j := 0; j < rows; j++ {
			result[i][j] = matrix[j][cols-1-i]
		}
	}
	return result
}

func transposeMatrix(matrix [][]float64) [][]float64 {
	rows := len(matrix)
	cols := len(matrix[0])
	result := make([][]float64, cols)
	for i := 0; i < cols; i++ {
		result[i] = make([]float64, rows)
		for j := 0; j < rows; j++ {
			result[i][j] = matrix[j][i]
		}
	}
	return result
}

func horizontalFlip(matrix [][]float64) [][]float64 {
	rows := len(matrix)
	cols := len(matrix[0])
	result := make([][]float64, rows)
	for i := 0; i < rows; i++ {
		result[i] = make([]float64, cols)
		for j := 0; j < cols; j++ {
			result[i][j] = matrix[i][cols-1-j]
		}
	}
	return result
}

func verticalFlip(matrix [][]float64) [][]float64 {
	rows := len(matrix)
	cols := len(matrix[0])
	result := make([][]float64, rows)
	for i := 0; i < rows; i++ {
		result[i] = make([]float64, cols)
		copy(result[i], matrix[rows-1-i])
	}
	return result
}

// FactorizeQR realiza factorización QR usando Gram-Schmidt Modificado.
// Para matrices m×n donde m ≥ n. Retorna Q (m×n ortonormal) y R (n×n triangular superior).
func FactorizeQR(data [][]float64) (Q, R [][]float64, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic during QR factorization: %v", r)
		}
	}()

	rows := len(data)
	cols := len(data[0])

	if rows < cols {
		return nil, nil, fmt.Errorf("matrix must have rows >= columns for QR factorization: %dx%d", rows, cols)
	}

	V := make([][]float64, cols)
	for j := 0; j < cols; j++ {
		V[j] = make([]float64, rows)
		for i := 0; i < rows; i++ {
			V[j][i] = data[i][j]
		}
	}

	Q = make([][]float64, rows)
	for i := 0; i < rows; i++ {
		Q[i] = make([]float64, cols)
	}

	R = make([][]float64, cols)
	for i := 0; i < cols; i++ {
		R[i] = make([]float64, cols)
	}

	for j := 0; j < cols; j++ {
		for i := 0; i < j; i++ {
			R[i][j] = dotProduct(V[j], col(Q, i))
			for k := 0; k < rows; k++ {
				V[j][k] -= R[i][j] * Q[k][i]
			}
		}

		R[j][j] = euclideanNorm(V[j])
		if R[j][j] < 1e-12 {
			return nil, nil, fmt.Errorf("matrix is rank-deficient or nearly singular")
		}

		for k := 0; k < rows; k++ {
			Q[k][j] = V[j][k] / R[j][j]
		}
	}

	return Q, R, nil
}

func dotProduct(v1, v2 []float64) float64 {
	var sum float64
	for i := range v1 {
		sum += v1[i] * v2[i]
	}
	return sum
}

func euclideanNorm(v []float64) float64 {
	var sum float64
	for _, x := range v {
		sum += x * x
	}
	return math.Sqrt(sum)
}

func col(matrix [][]float64, j int) []float64 {
	result := make([]float64, len(matrix))
	for i := range matrix {
		result[i] = matrix[i][j]
	}
	return result
}
