package config

import (
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
}

func Load() *Config {
	_ = godotenv.Load()

	return &Config{
		Port:          getEnv("PORT", "3001"),
		NodeAPIURL:    getEnv("NODE_API_URL", "http://localhost:3002"),
		JWTSecret:     getEnv("JWT_SECRET", "default-secret-change-in-production"),
		JWTExpiration: getEnv("JWT_EXPIRATION", "3600"),
		AuthUsername:  getEnv("AUTH_USERNAME", "admin"),
		AuthPassword:  getEnv("AUTH_PASSWORD", "secret"),
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
