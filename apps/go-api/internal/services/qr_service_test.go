package services

import (
	"testing"
)

func TestNewQRService(t *testing.T) {
	svc := NewQRService(nil)
	if svc == nil {
		t.Error("QRService should not be nil")
	}
}

func TestValidateMatrix(t *testing.T) {
	tests := []struct {
		name    string
		matrix  [][]float64
		wantErr bool
	}{
		{"valid square", [][]float64{{1, 2}, {3, 4}}, false},
		{"valid rectangular rows>=cols", [][]float64{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}, false},
		{"valid tall matrix", [][]float64{{1}, {2}, {3}}, false},
		{"empty matrix", [][]float64{}, true},
		{"empty row", [][]float64{{}}, true},
		{"inconsistent rows", [][]float64{{1, 2}, {3}}, true},
		{"rows less than cols", [][]float64{{1, 2, 3}, {4, 5, 6}}, true},
		{"single element", [][]float64{{42}}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateMatrix(tt.matrix)
			if (err != nil) != tt.wantErr {
				t.Errorf("validateMatrix() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestProcessMatrix(t *testing.T) {
	svc := NewQRService(nil)

	t.Run("valid with none rotation", func(t *testing.T) {
		resp, err := svc.ProcessMatrix([][]float64{{1, 2, 3}, {4, 5, 8}, {7, 8, 9}}, "none")
		if err != nil {
			t.Fatal(err)
		}
		if resp.Q == nil || resp.R == nil {
			t.Error("Q and R should not be nil")
		}
		if resp.Stats != nil {
			t.Error("Stats should be nil when nodeClient is nil")
		}
	})

	t.Run("valid with rotation", func(t *testing.T) {
		resp, err := svc.ProcessMatrix([][]float64{{1, 2, 3}, {4, 5, 8}, {7, 8, 9}}, "clockwise_90")
		if err != nil {
			t.Fatal(err)
		}
		if resp.Q == nil || resp.R == nil {
			t.Error("Q and R should not be nil")
		}
	})

	t.Run("empty matrix", func(t *testing.T) {
		_, err := svc.ProcessMatrix([][]float64{}, "none")
		if err == nil {
			t.Error("expected error for empty matrix")
		}
	})

	t.Run("invalid rotation", func(t *testing.T) {
		_, err := svc.ProcessMatrix([][]float64{{1, 2}, {3, 4}}, "bad_rotation")
		if err == nil {
			t.Error("expected error for invalid rotation")
		}
	})

	t.Run("singular matrix", func(t *testing.T) {
		_, err := svc.ProcessMatrix([][]float64{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}, "none")
		if err == nil {
			t.Error("expected error for singular matrix")
		}
	})
}

func TestDeepCopy(t *testing.T) {
	original := [][]float64{{1, 2}, {3, 4}}
	copied := deepCopy(original)

	original[0][0] = 999

	if copied[0][0] != 1 {
		t.Error("deepCopy should not be affected by modifications to original")
	}

	if len(copied) != 2 || len(copied[0]) != 2 {
		t.Error("deepCopy should have same dimensions")
	}
}
