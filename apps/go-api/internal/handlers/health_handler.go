package handlers

import (
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/interseguro/go-api/internal/config"
	"github.com/interseguro/go-api/internal/models"
)

type HealthHandler struct {
	cfg *config.Config
}

func NewHealthHandler(cfg *config.Config) *HealthHandler {
	return &HealthHandler{cfg: cfg}
}

func (h *HealthHandler) Check(c fiber.Ctx) error {
	return c.JSON(models.HealthResponse{
		Status:    "ok",
		Service:   "go-api",
		Timestamp: time.Now(),
	})
}
