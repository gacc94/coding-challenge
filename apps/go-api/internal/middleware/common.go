package middleware

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v3"
)

func Logger() fiber.Handler {
	return func(c fiber.Ctx) error {
		start := time.Now()

		err := c.Next()

		status := c.Response().StatusCode()
		method := c.Method()
		path := c.Path()
		latency := time.Since(start)

		log.Printf("[%s] %s %s - %d - %v", time.Now().Format(time.RFC3339), method, path, status, latency)

		return err
	}
}

func Recover() fiber.Handler {
	return func(c fiber.Ctx) error {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("PANIC recovered: %v", r)
				c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Internal server error",
					"code":  "INTERNAL_ERROR",
				})
			}
		}()
		return c.Next()
	}
}
