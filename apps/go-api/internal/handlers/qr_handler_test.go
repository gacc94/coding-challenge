package handlers

import (
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/interseguro/go-api/internal/services"
)

func TestFactorizeInvalidJSON(t *testing.T) {
	qrService := services.NewQRService(nil)
	handler := NewQRHandler(qrService)
	app := fiber.New()
	app.Post("/qr", handler.Factorize)

	body := `invalid json`
	req := httptest.NewRequest("POST", "/qr", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 400 {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	if result["code"] != "VALIDATION_ERROR" {
		t.Errorf("expected VALIDATION_ERROR, got %v", result["code"])
	}
}

func TestFactorizeEmptyMatrix(t *testing.T) {
	qrService := services.NewQRService(nil)
	handler := NewQRHandler(qrService)
	app := fiber.New()
	app.Post("/qr", handler.Factorize)

	body := `{"matrix":[],"rotation":"none"}`
	req := httptest.NewRequest("POST", "/qr", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 400 {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}

func TestFactorizeInvalidRotation(t *testing.T) {
	qrService := services.NewQRService(nil)
	handler := NewQRHandler(qrService)
	app := fiber.New()
	app.Post("/qr", handler.Factorize)

	body := `{"matrix":[[1,2],[3,4]],"rotation":"invalid"}`
	req := httptest.NewRequest("POST", "/qr", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 400 {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}

func TestFactorizeSingularMatrix(t *testing.T) {
	qrService := services.NewQRService(nil)
	handler := NewQRHandler(qrService)
	app := fiber.New()
	app.Post("/qr", handler.Factorize)

	body := `{"matrix":[[1,2,3],[4,5,6],[7,8,9]],"rotation":"none"}`
	req := httptest.NewRequest("POST", "/qr", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 422 {
		t.Errorf("expected 422, got %d", resp.StatusCode)
	}
}

func TestFactorizeSuccess(t *testing.T) {
	qrService := services.NewQRService(nil)
	handler := NewQRHandler(qrService)
	app := fiber.New()
	app.Post("/qr", handler.Factorize)

	body := `{"matrix":[[1,2,3],[4,5,8],[7,8,9]],"rotation":"none"}`
	req := httptest.NewRequest("POST", "/qr", strings.NewReader(body))
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

	if result["Q"] == nil {
		t.Error("Q should not be nil")
	}
	if result["R"] == nil {
		t.Error("R should not be nil")
	}
}

func TestFactorizeRowsLessThanCols(t *testing.T) {
	qrService := services.NewQRService(nil)
	handler := NewQRHandler(qrService)
	app := fiber.New()
	app.Post("/qr", handler.Factorize)

	body := `{"matrix":[[1,2,3],[4,5,6]],"rotation":"none"}`
	req := httptest.NewRequest("POST", "/qr", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 400 {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}

func TestContainsAny(t *testing.T) {
	if !containsAny("hello world", "world") {
		t.Error("expected true")
	}
	if containsAny("hello", "xyz") {
		t.Error("expected false")
	}
	if !containsAny("test rotation_failed data", "rotation_failed") {
		t.Error("expected true for rotation_failed")
	}
	if !containsAny("rank-deficient matrix", "deficient") {
		t.Error("expected true for deficient")
	}
	if !containsAny("MATRIX IS SINGULAR", "singular") {
		t.Error("expected true for singular (case insensitive)")
	}
}
