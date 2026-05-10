package middleware

import (
	"io"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
)

func TestLogger(t *testing.T) {
	app := fiber.New()
	app.Use(Logger())
	app.Get("/test", func(c fiber.Ctx) error {
		return c.SendStatus(200)
	})

	req := httptest.NewRequest("GET", "/test", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 200 {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}
}

func TestRecover(t *testing.T) {
	app := fiber.New()
	app.Use(Recover())
	app.Get("/panic", func(c fiber.Ctx) error {
		panic("test panic")
	})

	req := httptest.NewRequest("GET", "/panic", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != 500 {
		t.Errorf("expected 500, got %d: %s", resp.StatusCode, string(body))
	}
}

func TestRecoverNoPanic(t *testing.T) {
	app := fiber.New()
	app.Use(Recover())
	app.Get("/ok", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	req := httptest.NewRequest("GET", "/ok", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 200 {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}
}
