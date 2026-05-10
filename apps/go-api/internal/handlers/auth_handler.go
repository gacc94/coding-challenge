package handlers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"

	"github.com/interseguro/go-api/internal/config"
	"github.com/interseguro/go-api/internal/models"
)

type AuthHandler struct {
	cfg *config.Config
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	return &AuthHandler{cfg: cfg}
}

func generateJWT(username, secret string) (string, error) {
	claims := jwt.MapClaims{
		"sub": username,
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func (h *AuthHandler) Login(c fiber.Ctx) error {
	var req models.AuthRequest

	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
			"code":  "VALIDATION_ERROR",
		})
	}

	if req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "username and password are required",
			"code":  "VALIDATION_ERROR",
		})
	}

	if len(req.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "password must be at least 6 characters",
			"code":  "VALIDATION_ERROR",
		})
	}

	if req.Username != h.cfg.AuthUsername || req.Password != h.cfg.AuthPassword {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid credentials",
			"code":  "AUTH_INVALID_CREDENTIALS",
		})
	}

	token, err := generateJWT(req.Username, h.cfg.JWTSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
			"code":  "INTERNAL_ERROR",
		})
	}

	return c.JSON(models.AuthResponse{
		Token:     token,
		Type:      "Bearer",
		ExpiresIn: 3600,
	})
}

func (h *AuthHandler) GenerateInternalToken() (string, error) {
	token, err := generateJWT("go-api-internal", h.cfg.JWTSecret)
	if err != nil {
		return "", fmt.Errorf("failed to generate internal token: %w", err)
	}
	return token, nil
}
