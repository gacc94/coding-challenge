package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	NodeAPIURL    string
	JWTSecret     string
	JWTExpiration string
	AuthUsername  string
	AuthPassword  string
	CORSOrigin    string
}

func Load() *Config {
	_ = godotenv.Load()

	cfg := &Config{
		Port:          getEnv("PORT", "3001"),
		NodeAPIURL:    getEnv("NODE_API_URL", "http://localhost:3002"),
		JWTSecret:     getEnv("JWT_SECRET", "default-secret-change-in-production"),
		JWTExpiration: getEnv("JWT_EXPIRATION", "3600"),
		AuthUsername:  getEnv("AUTH_USERNAME", "admin"),
		AuthPassword:  getEnv("AUTH_PASSWORD", "secret"),
		CORSOrigin:    getEnv("CORS_ORIGIN", "*"),
	}

	if cfg.JWTSecret == "default-secret-change-in-production" {
		log.Println("WARNING: Using default JWT_SECRET. Set JWT_SECRET environment variable for production.")
	}

	return cfg
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
