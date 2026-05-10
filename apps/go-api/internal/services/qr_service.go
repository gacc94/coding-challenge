package services

import (
	"fmt"
	"log"

	"github.com/interseguro/go-api/internal/models"
	"github.com/interseguro/go-api/pkg/matrix"
)

type QRService struct {
	nodeClient *NodeClient
}

func NewQRService(nodeClient *NodeClient) *QRService {
	return &QRService{nodeClient: nodeClient}
}

func (s *QRService) ProcessMatrix(data [][]float64, rotation string) (*models.FactorizationResponse, error) {
	if err := validateMatrix(data); err != nil {
		return nil, err
	}

	rotated, err := matrix.Rotate(data, rotation)
	if err != nil {
		return nil, fmt.Errorf("rotation error: %w", err)
	}

	if err := validateMatrix(rotated); err != nil {
		return nil, fmt.Errorf("rotated matrix invalid: %w", err)
	}

	Q, R, err := matrix.FactorizeQR(rotated)
	if err != nil {
		return nil, fmt.Errorf("QR factorization error: %w", err)
	}

	var stats *models.StatsResponse
	if s.nodeClient != nil {
		s, err := s.nodeClient.SendMatrices(Q, R, rotated)
		if err != nil {
			log.Printf("WARN: Could not get stats from Node API: %v", err)
		} else {
			stats = s
		}
	}

	return &models.FactorizationResponse{
		Original: deepCopy(data),
		Rotated:  rotated,
		Rotation: rotation,
		Q:        Q,
		R:        R,
		Stats:    stats,
	}, nil
}

func validateMatrix(data [][]float64) error {
	if len(data) == 0 {
		return fmt.Errorf("matrix cannot be empty")
	}

	cols := len(data[0])
	if cols == 0 {
		return fmt.Errorf("matrix row cannot be empty")
	}

	for i, row := range data {
		if len(row) != cols {
			return fmt.Errorf("row %d has %d elements, expected %d", i, len(row), cols)
		}
	}

	if len(data) < cols {
		return fmt.Errorf("matrix must have rows >= columns for QR factorization: %dx%d", len(data), cols)
	}

	return nil
}

func deepCopy(src [][]float64) [][]float64 {
	dst := make([][]float64, len(src))
	for i, row := range src {
		dst[i] = make([]float64, len(row))
		copy(dst[i], row)
	}
	return dst
}
