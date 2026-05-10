package middleware_test

import (
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"

	"github.com/interseguro/go-api/internal/middleware"
)

const testJWTSecret = "test-secret-key"

func generateTestToken(secret string, expired bool) string {
	claims := jwt.MapClaims{
		"sub": "test-user",
		"iat": time.Now().Unix(),
	}

	if expired {
		claims["exp"] = time.Now().Add(-time.Hour).Unix()
	} else {
		claims["exp"] = time.Now().Add(time.Hour).Unix()
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, _ := token.SignedString([]byte(secret))
	return signed
}

func TestJWTAuthMissingHeader(t *testing.T) {
	app := fiber.New()
	app.Use(middleware.JWTAuth(testJWTSecret))
	app.Get("/test", func(c fiber.Ctx) error { return c.SendString("ok") })

	req := httptest.NewRequest("GET", "/test", nil)
	resp, _ := app.Test(req)

	if resp.StatusCode != 401 {
		t.Errorf("expected 401, got %d", resp.StatusCode)
	}
}

func TestJWTAuthInvalidFormat(t *testing.T) {
	app := fiber.New()
	app.Use(middleware.JWTAuth(testJWTSecret))
	app.Get("/test", func(c fiber.Ctx) error { return c.SendString("ok") })

	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Token abc123")
	resp, _ := app.Test(req)

	if resp.StatusCode != 401 {
		t.Errorf("expected 401, got %d", resp.StatusCode)
	}
}

func TestJWTAuthInvalidToken(t *testing.T) {
	app := fiber.New()
	app.Use(middleware.JWTAuth(testJWTSecret))
	app.Get("/test", func(c fiber.Ctx) error { return c.SendString("ok") })

	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer invalid-token")
	resp, _ := app.Test(req)

	if resp.StatusCode != 401 {
		t.Errorf("expected 401, got %d", resp.StatusCode)
	}
}

func TestJWTAuthExpiredToken(t *testing.T) {
	app := fiber.New()
	app.Use(middleware.JWTAuth(testJWTSecret))
	app.Get("/test", func(c fiber.Ctx) error { return c.SendString("ok") })

	token := generateTestToken(testJWTSecret, true)
	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req)

	if resp.StatusCode != 401 {
		t.Errorf("expected 401 for expired token, got %d", resp.StatusCode)
	}
}

func TestJWTAuthValidToken(t *testing.T) {
	app := fiber.New()
	app.Use(middleware.JWTAuth(testJWTSecret))
	app.Get("/test", func(c fiber.Ctx) error { return c.SendString("ok") })

	token := generateTestToken(testJWTSecret, false)
	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	resp, _ := app.Test(req)

	if resp.StatusCode != 200 {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}
}
