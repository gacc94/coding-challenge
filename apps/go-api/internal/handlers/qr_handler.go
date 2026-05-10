package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v3"

	"github.com/interseguro/go-api/internal/models"
	"github.com/interseguro/go-api/internal/services"
)

type QRHandler struct {
	qrService *services.QRService
}

func NewQRHandler(qrService *services.QRService) *QRHandler {
	return &QRHandler{qrService: qrService}
}

func (h *QRHandler) Factorize(c fiber.Ctx) error {
	var req models.FactorizationRequest

	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
			"code":  "VALIDATION_ERROR",
		})
	}

	if req.Matrix == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Matrix is required",
			"code":  "VALIDATION_ERROR",
		})
	}

	if len(req.Matrix) == 0 || len(req.Matrix[0]) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Matrix must be a non-empty 2D array",
			"code":  "VALIDATION_ERROR",
		})
	}

	result, err := h.qrService.ProcessMatrix(req.Matrix, req.Rotation)
	if err != nil {
		errMsg := err.Error()
		if containsAny(errMsg, "rotation", "invalid", "empty", "inconsistent", "rows >= columns") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": errMsg,
				"code":  "VALIDATION_ERROR",
			})
		}
		if containsAny(errMsg, "rank-deficient", "singular") {
			return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
				"error": errMsg,
				"code":  "QR_FACTORIZATION_ERROR",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": errMsg,
			"code":  "INTERNAL_ERROR",
		})
	}

	return c.Status(fiber.StatusOK).JSON(result)
}

func containsAny(s string, substrs ...string) bool {
	s = strings.ToLower(s)
	for _, sub := range substrs {
		if strings.Contains(s, sub) {
			return true
		}
	}
	return false
}
