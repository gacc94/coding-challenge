package matrix_test

import (
	"math"
	"testing"

	"github.com/interseguro/go-api/pkg/matrix"
)

func TestRotateNone(t *testing.T) {
	input := [][]float64{{1, 2}, {3, 4}}
	result, err := matrix.Rotate(input, matrix.RotationNone)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(result) != 2 || result[0][0] != 1 || result[0][1] != 2 {
		t.Errorf("none rotation should preserve matrix, got %v", result)
	}
}

func TestRotateClockwise90(t *testing.T) {
	input := [][]float64{{1, 2}, {3, 4}, {5, 6}}
	result, err := matrix.Rotate(input, matrix.RotationClockwise90)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := [][]float64{{5, 3, 1}, {6, 4, 2}}
	if !matricesEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func TestRotateClockwise180(t *testing.T) {
	input := [][]float64{{1, 2}, {3, 4}, {5, 6}}
	result, err := matrix.Rotate(input, matrix.RotationClockwise180)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := [][]float64{{6, 5}, {4, 3}, {2, 1}}
	if !matricesEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func TestRotateClockwise270(t *testing.T) {
	input := [][]float64{{1, 2}, {3, 4}, {5, 6}}
	result, err := matrix.Rotate(input, matrix.RotationClockwise270)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := [][]float64{{2, 4, 6}, {1, 3, 5}}
	if !matricesEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func TestRotateTranspose(t *testing.T) {
	input := [][]float64{{1, 2, 3}, {4, 5, 6}}
	result, err := matrix.Rotate(input, matrix.RotationTranspose)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := [][]float64{{1, 4}, {2, 5}, {3, 6}}
	if !matricesEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func TestRotateHorizontalFlip(t *testing.T) {
	input := [][]float64{{1, 2, 3}, {4, 5, 6}}
	result, err := matrix.Rotate(input, matrix.RotationHorizontalFlip)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := [][]float64{{3, 2, 1}, {6, 5, 4}}
	if !matricesEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func TestRotateVerticalFlip(t *testing.T) {
	input := [][]float64{{1, 2, 3}, {4, 5, 6}}
	result, err := matrix.Rotate(input, matrix.RotationVerticalFlip)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	expected := [][]float64{{4, 5, 6}, {1, 2, 3}}
	if !matricesEqual(result, expected) {
		t.Errorf("expected %v, got %v", expected, result)
	}
}

func TestRotateInvalid(t *testing.T) {
	_, err := matrix.Rotate([][]float64{{1}}, "invalid")
	if err == nil {
		t.Error("expected error for invalid rotation type")
	}
}

func TestFactorizeQR2x2(t *testing.T) {
	A := [][]float64{{4, 3}, {6, 3}}
	Q, R, err := matrix.FactorizeQR(A)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(Q) != 2 || len(Q[0]) != 2 {
		t.Errorf("Q dimensions wrong: %dx%d", len(Q), len(Q[0]))
	}
	if len(R) != 2 || len(R[0]) != 2 {
		t.Errorf("R dimensions wrong: %dx%d", len(R), len(R[0]))
	}

	reconstructed := multiplyMatrices(Q, R)
	tolerance := 1e-10
	for i := range A {
		for j := range A[i] {
			if math.Abs(reconstructed[i][j]-A[i][j]) > tolerance {
				t.Errorf("A != Q*R at [%d][%d]: expected %f, got %f", i, j, A[i][j], reconstructed[i][j])
			}
		}
	}
}

func TestFactorizeQR3x2(t *testing.T) {
	A := [][]float64{{1, 2}, {3, 4}, {5, 6}}
	Q, R, err := matrix.FactorizeQR(A)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(Q) != 3 || len(Q[0]) != 2 {
		t.Errorf("Q dimensions wrong: %dx%d", len(Q), len(Q[0]))
	}
	if len(R) != 2 || len(R[0]) != 2 {
		t.Errorf("R dimensions wrong: %dx%d", len(R), len(R[0]))
	}
}

func TestFactorizeQRIdentity(t *testing.T) {
	A := [][]float64{{1, 0, 0}, {0, 1, 0}, {0, 0, 1}}
	Q, R, err := matrix.FactorizeQR(A)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	reconstructed := multiplyMatrices(Q, R)
	tolerance := 1e-6
	for i := range A {
		for j := range A[i] {
			if math.Abs(reconstructed[i][j]-A[i][j]) > tolerance {
				t.Errorf("A != Q*R at [%d][%d]: expected %f, got %f", i, j, A[i][j], reconstructed[i][j])
			}
		}
	}
}

func TestFactorizeQRInvalidDimensions(t *testing.T) {
	A := [][]float64{{1, 2, 3}, {4, 5, 6}}
	_, _, err := matrix.FactorizeQR(A)
	if err == nil {
		t.Error("expected error for matrix with rows < cols")
	}
}

func TestIsValidRotation(t *testing.T) {
	if !matrix.IsValidRotation("clockwise_90") {
		t.Error("clockwise_90 should be valid")
	}
	if matrix.IsValidRotation("invalid") {
		t.Error("invalid should not be valid")
	}
}

func TestValidRotationsContainsAllTypes(t *testing.T) {
	expected := []string{"none", "clockwise_90", "clockwise_180", "clockwise_270", "transpose", "horizontal_flip", "vertical_flip"}
	if len(matrix.ValidRotations) != len(expected) {
		t.Errorf("expected %d valid rotations, got %d", len(expected), len(matrix.ValidRotations))
	}
}

func matricesEqual(a, b [][]float64) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if len(a[i]) != len(b[i]) {
			return false
		}
		for j := range a[i] {
			if math.Abs(a[i][j]-b[i][j]) > 1e-10 {
				return false
			}
		}
	}
	return true
}

func multiplyMatrices(A, B [][]float64) [][]float64 {
	ra, ca := len(A), len(A[0])
	rb, cb := len(B), len(B[0])
	if ca != rb {
		panic("incompatible matrix dimensions")
	}

	result := make([][]float64, ra)
	for i := 0; i < ra; i++ {
		result[i] = make([]float64, cb)
		for j := 0; j < cb; j++ {
			var sum float64
			for k := 0; k < ca; k++ {
				sum += A[i][k] * B[k][j]
			}
			result[i][j] = sum
		}
	}
	return result
}
