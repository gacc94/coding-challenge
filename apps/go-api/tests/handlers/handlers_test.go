package handlers_test

import (
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v3"

	"github.com/interseguro/go-api/internal/config"
	"github.com/interseguro/go-api/internal/handlers"
	"github.com/interseguro/go-api/internal/services"
)

func setupTestConfig() *config.Config {
	return &config.Config{
		Port:         "3001",
		NodeAPIURL:   "http://127.0.0.1:9",
		JWTSecret:    "test-secret-key",
		AuthUsername: "admin",
		AuthPassword: "secret",
	}
}

func TestHealthCheck(t *testing.T) {
	cfg := setupTestConfig()
	healthHandler := handlers.NewHealthHandler(cfg)

	app := fiber.New()
	app.Get("/health", healthHandler.Check)

	req := httptest.NewRequest("GET", "/health", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}

	if resp.StatusCode != 200 {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}

	var body map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&body)

	if body["status"] != "ok" {
		t.Errorf("expected status ok, got %v", body["status"])
	}
}

func TestLoginSuccess(t *testing.T) {
	cfg := setupTestConfig()
	authHandler := handlers.NewAuthHandler(cfg)

	app := fiber.New()
	app.Post("/api/v1/auth/login", authHandler.Login)

	body := `{"username":"admin","password":"secret"}`
	req := httptest.NewRequest("POST", "/api/v1/auth/login", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := app.Test(req)

	if resp.StatusCode != 200 {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	if result["token"] == nil || result["token"].(string) == "" {
		t.Error("token should not be empty")
	}
}

func TestLoginInvalidCredentials(t *testing.T) {
	cfg := setupTestConfig()
	authHandler := handlers.NewAuthHandler(cfg)

	app := fiber.New()
	app.Post("/api/v1/auth/login", authHandler.Login)

	body := `{"username":"admin","password":"wrong_password"}`
	req := httptest.NewRequest("POST", "/api/v1/auth/login", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := app.Test(req)

	if resp.StatusCode != 401 {
		t.Errorf("expected 401, got %d", resp.StatusCode)
	}
}

func TestLoginMissingFields(t *testing.T) {
	cfg := setupTestConfig()
	authHandler := handlers.NewAuthHandler(cfg)

	app := fiber.New()
	app.Post("/api/v1/auth/login", authHandler.Login)

	body := `{"username":""}`
	req := httptest.NewRequest("POST", "/api/v1/auth/login", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := app.Test(req)

	if resp.StatusCode != 400 {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}

func TestQRFactorizationSuccess(t *testing.T) {
	qrHandler := handlers.NewQRHandler(services.NewQRService(nil))

	app := fiber.New()
	app.Post("/api/v1/qr-factorization", qrHandler.Factorize)

	body := `{"matrix": [[1, 2], [3, 4], [5, 6]], "rotation": "none"}`
	req := httptest.NewRequest("POST", "/api/v1/qr-factorization", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := app.Test(req)

	if resp.StatusCode != 200 {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	if result["Q"] == nil {
		t.Error("Q should not be nil")
	}
	if result["R"] == nil {
		t.Error("R should not be nil")
	}
	if result["stats"] != nil {
		t.Log("stats is nil (expected - Node API not available)")
	}
}

func TestQRFactorizationWithRotation(t *testing.T) {
	qrHandler := handlers.NewQRHandler(services.NewQRService(nil))

	app := fiber.New()
	app.Post("/api/v1/qr-factorization", qrHandler.Factorize)

	body := `{"matrix": [[1, 2], [3, 4], [5, 6]], "rotation": "clockwise_180"}`
	req := httptest.NewRequest("POST", "/api/v1/qr-factorization", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := app.Test(req)

	if resp.StatusCode != 200 {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	if result["rotation"] != "clockwise_180" {
		t.Errorf("expected clockwise_180, got %v", result["rotation"])
	}
}

func TestQRFactorizationEmptyMatrix(t *testing.T) {
	qrHandler := handlers.NewQRHandler(services.NewQRService(nil))

	app := fiber.New()
	app.Post("/api/v1/qr-factorization", qrHandler.Factorize)

	body := `{"matrix": [], "rotation": "none"}`
	req := httptest.NewRequest("POST", "/api/v1/qr-factorization", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := app.Test(req)

	if resp.StatusCode != 400 {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}

func TestQRFactorizationInvalidRotation(t *testing.T) {
	qrHandler := handlers.NewQRHandler(services.NewQRService(nil))

	app := fiber.New()
	app.Post("/api/v1/qr-factorization", qrHandler.Factorize)

	body := `{"matrix": [[1, 2], [3, 4]], "rotation": "invalid"}`
	req := httptest.NewRequest("POST", "/api/v1/qr-factorization", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := app.Test(req)

	if resp.StatusCode != 400 {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}
