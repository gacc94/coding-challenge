package main

import (
	"embed"
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"

	"github.com/interseguro/go-api/internal/config"
	"github.com/interseguro/go-api/internal/handlers"
	"github.com/interseguro/go-api/internal/middleware"
	"github.com/interseguro/go-api/internal/services"
)

//go:embed docs/*
var swaggerFiles embed.FS

// @title           Coding Challenge API (Go)
// @version         1.0
// @description     API para rotación de matrices y factorización QR. Recibe una matriz rectangular y tipo de rotación, realiza QR con gonum/mat Householder y retorna Q, R, matriz rotada y estadísticas.
// @contact.name    División TI - Interseguro
// @contact.email   desarrolloti@interseguro.pe
// @host            localhost:3001
// @BasePath        /
// @securityDefinitions.apikey BearerAuth
// @in              header
// @name            Authorization
// @description     JWT Bearer token obtenido en /api/v1/auth/login

func main() {
	cfg := config.Load()

	nodeClient := services.NewNodeClient(cfg.NodeAPIURL, cfg.JWTSecret)
	qrService := services.NewQRService(nodeClient)

	authHandler := handlers.NewAuthHandler(cfg)
	qrHandler := handlers.NewQRHandler(qrService)
	healthHandler := handlers.NewHealthHandler(cfg)

	app := fiber.New(fiber.Config{
		AppName:      "go-api",
		ServerHeader: "go-api",
	})

	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"https://coding-challenge-gacc.netlify.app",
			"http://localhost:4200",
			"http://localhost",
		},
		AllowMethods:  []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:  []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders: []string{"Content-Length"},
		MaxAge:        86400,
	}))

	app.Use(middleware.Recover())
	app.Use(middleware.Logger())

	app.Get("/swagger", func(c fiber.Ctx) error {
		return c.Redirect().To("/swagger/index.html")
	})

	app.Get("/swagger/doc.json", func(c fiber.Ctx) error {
		data, err := swaggerFiles.ReadFile("docs/swagger.json")
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "swagger.json not found"})
		}
		c.Set("Content-Type", "application/json")
		return c.Send(data)
	})
	app.Get("/swagger/index.html", func(c fiber.Ctx) error {
		data, err := swaggerFiles.ReadFile("docs/index.html")
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "index.html not found"})
		}
		c.Set("Content-Type", "text/html; charset=utf-8")
		return c.Send(data)
	})

	// Health
	app.Get("/health", healthHandler.Check)

	// Auth
	app.Post("/api/v1/auth/login", authHandler.Login)

	// QR Factorization (protegido con JWT)
	api := app.Group("/api/v1", middleware.JWTAuth(cfg.JWTSecret))
	api.Post("/qr-factorization", middleware.ValidateFactorizeRequest(), qrHandler.Factorize)

	log.Printf("🚀 Go API (Fiber v3) running on http://localhost:%s", cfg.Port)
	log.Printf("📚 Swagger UI: http://localhost:%s/swagger/index.html", cfg.Port)
	log.Printf("📄 OpenAPI JSON: http://localhost:%s/swagger/doc.json", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
