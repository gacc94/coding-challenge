package handlers

import (
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/interseguro/go-api/internal/config"
)

func TestAuthLoginSuccess(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:     "test-secret",
		JWTExpiration: "3600",
		AuthUsername:  "admin",
		AuthPassword:  "secret",
	}

	handler := NewAuthHandler(cfg)
	app := fiber.New()
	app.Post("/login", handler.Login)

	body := `{"username":"admin","password":"secret"}`
	req := httptest.NewRequest("POST", "/login", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 200 {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	if result["token"] == nil {
		t.Error("token should not be nil")
	}
	if result["type"] != "Bearer" {
		t.Errorf("expected type Bearer, got %v", result["type"])
	}
}

func TestAuthLoginInvalidCredentials(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:     "test-secret",
		JWTExpiration: "3600",
		AuthUsername:  "admin",
		AuthPassword:  "secret",
	}

	handler := NewAuthHandler(cfg)
	app := fiber.New()
	app.Post("/login", handler.Login)

	body := `{"username":"admin","password":"wrongpass"}`
	req := httptest.NewRequest("POST", "/login", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 401 {
		t.Errorf("expected 401, got %d", resp.StatusCode)
	}
}

func TestAuthLoginInvalidBody(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:     "test-secret",
		JWTExpiration: "3600",
		AuthUsername:  "admin",
		AuthPassword:  "secret",
	}

	handler := NewAuthHandler(cfg)
	app := fiber.New()
	app.Post("/login", handler.Login)

	body := `invalid json`
	req := httptest.NewRequest("POST", "/login", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 400 {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}

func TestAuthLoginMissingFields(t *testing.T) {
	cfg := &config.Config{
		JWTSecret:     "test-secret",
		JWTExpiration: "3600",
		AuthUsername:  "admin",
		AuthPassword:  "secret",
	}

	handler := NewAuthHandler(cfg)
	app := fiber.New()
	app.Post("/login", handler.Login)

	body := `{}`
	req := httptest.NewRequest("POST", "/login", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 400 {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}

func TestGenerateJWT(t *testing.T) {
	token, err := generateJWT("testuser", "test-secret")
	if err != nil {
		t.Fatal(err)
	}
	if token == "" {
		t.Error("token should not be empty")
	}
}

func TestGenerateInternalToken(t *testing.T) {
	cfg := &config.Config{
		JWTSecret: "test-secret",
	}
	handler := NewAuthHandler(cfg)

	token, err := handler.GenerateInternalToken()
	if err != nil {
		t.Fatal(err)
	}
	if token == "" {
		t.Error("token should not be empty")
	}
}
