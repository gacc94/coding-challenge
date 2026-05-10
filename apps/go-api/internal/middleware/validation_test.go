package middleware

import (
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v3"
)

func TestValidateFactorizeRequestValid(t *testing.T) {
	app := fiber.New()
	app.Post("/test", ValidateFactorizeRequest(), func(c fiber.Ctx) error {
		return c.SendStatus(200)
	})

	body := `{"matrix":[[1,2],[3,4]],"rotation":"clockwise_90"}`
	req := httptest.NewRequest("POST", "/test", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 200 {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}
}

func TestValidateFactorizeRequestEmptyMatrix(t *testing.T) {
	app := fiber.New()
	app.Post("/test", ValidateFactorizeRequest(), func(c fiber.Ctx) error {
		return c.SendStatus(200)
	})

	body := `{"matrix":[],"rotation":"none"}`
	req := httptest.NewRequest("POST", "/test", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 400 {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}

func TestValidateFactorizeRequestInvalidRotation(t *testing.T) {
	app := fiber.New()
	app.Post("/test", ValidateFactorizeRequest(), func(c fiber.Ctx) error {
		return c.SendStatus(200)
	})

	body := `{"matrix":[[1,2],[3,4]],"rotation":"invalid_rotation"}`
	req := httptest.NewRequest("POST", "/test", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 400 {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}

func TestValidateFactorizeRequestInvalidJSON(t *testing.T) {
	app := fiber.New()
	app.Post("/test", ValidateFactorizeRequest(), func(c fiber.Ctx) error {
		return c.SendStatus(200)
	})

	body := `not json`
	req := httptest.NewRequest("POST", "/test", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 400 {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}

func TestValidateFactorizeRequestMissingFields(t *testing.T) {
	app := fiber.New()
	app.Post("/test", ValidateFactorizeRequest(), func(c fiber.Ctx) error {
		return c.SendStatus(200)
	})

	body := `{}`
	req := httptest.NewRequest("POST", "/test", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}

	if resp.StatusCode != 400 {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}

func TestValidateFactorizeRequestAllRotations(t *testing.T) {
	rotations := []string{"none", "clockwise_90", "clockwise_180", "clockwise_270", "transpose", "horizontal_flip", "vertical_flip"}

	for _, rot := range rotations {
		app := fiber.New()
		app.Post("/test", ValidateFactorizeRequest(), func(c fiber.Ctx) error {
			return c.SendStatus(200)
		})

		body, _ := json.Marshal(map[string]interface{}{
			"matrix":   [][]float64{{1, 2}, {3, 4}},
			"rotation": rot,
		})

		req := httptest.NewRequest("POST", "/test", strings.NewReader(string(body)))
		req.Header.Set("Content-Type", "application/json")

		resp, err := app.Test(req)
		if err != nil {
			t.Fatal(err)
		}

		if resp.StatusCode != 200 {
			t.Errorf("rotation %s: expected 200, got %d", rot, resp.StatusCode)
		}
	}
}
