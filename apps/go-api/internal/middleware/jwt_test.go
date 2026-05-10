package middleware

import (
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

func TestJWTAuthValidToken(t *testing.T) {
	secret := "test-secret"
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": "admin",
	})
	tokenString, _ := token.SignedString([]byte(secret))

	app := fiber.New()
	app.Post("/test", JWTAuth(secret), func(c fiber.Ctx) error {
		return c.SendStatus(200)
	})

	body := `{"test":true}`
	req := httptest.NewRequest("POST", "/test", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+tokenString)

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 200 {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}
}

func TestJWTAuthMissingHeader(t *testing.T) {
	app := fiber.New()
	app.Post("/test", JWTAuth("secret"), func(c fiber.Ctx) error {
		return c.SendStatus(200)
	})

	body := `{"test":true}`
	req := httptest.NewRequest("POST", "/test", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 401 {
		t.Errorf("expected 401, got %d", resp.StatusCode)
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	if result["code"] != "AUTH_MISSING_TOKEN" {
		t.Errorf("expected AUTH_MISSING_TOKEN, got %v", result["code"])
	}
}

func TestJWTAuthInvalidFormat(t *testing.T) {
	app := fiber.New()
	app.Post("/test", JWTAuth("secret"), func(c fiber.Ctx) error {
		return c.SendStatus(200)
	})

	body := `{"test":true}`
	req := httptest.NewRequest("POST", "/test", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Basic abc123")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 401 {
		t.Errorf("expected 401, got %d", resp.StatusCode)
	}

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	if result["code"] != "AUTH_INVALID_FORMAT" {
		t.Errorf("expected AUTH_INVALID_FORMAT, got %v", result["code"])
	}
}

func TestJWTAuthInvalidToken(t *testing.T) {
	app := fiber.New()
	app.Post("/test", JWTAuth("secret"), func(c fiber.Ctx) error {
		return c.SendStatus(200)
	})

	body := `{"test":true}`
	req := httptest.NewRequest("POST", "/test", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer invalid.token.here")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 401 {
		t.Errorf("expected 401, got %d", resp.StatusCode)
	}
}
