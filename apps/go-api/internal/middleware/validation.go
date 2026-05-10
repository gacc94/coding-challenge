package middleware

import (
	"fmt"

	"github.com/gofiber/fiber/v3"
	"github.com/interseguro/go-api/pkg/matrix"
)

func ValidateFactorizeRequest() fiber.Handler {
	return func(c fiber.Ctx) error {
		var req struct {
			Matrix   interface{} `json:"matrix"`
			Rotation string      `json:"rotation"`
		}

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

		matrixSlice, ok := req.Matrix.([]interface{})
		if !ok {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Matrix must be a 2D array",
				"code":  "VALIDATION_ERROR",
			})
		}

		if len(matrixSlice) == 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Matrix must be a non-empty array",
				"code":  "VALIDATION_ERROR",
			})
		}

		if req.Rotation == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Rotation is required",
				"code":  "VALIDATION_ERROR",
			})
		}

		if !matrix.IsValidRotation(req.Rotation) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fmt.Sprintf(
					"Invalid rotation type: '%s'. Allowed: %v",
					req.Rotation,
					matrix.ValidRotations,
				),
				"code": "VALIDATION_ERROR",
			})
		}

		return c.Next()
	}
}
