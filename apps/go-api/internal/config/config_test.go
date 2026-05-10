package config

import (
	"os"
	"testing"
)

func TestLoad(t *testing.T) {
	cfg := Load()

	if cfg.Port == "" {
		t.Error("Port should not be empty")
	}
	if cfg.JWTSecret == "" {
		t.Error("JWTSecret should not be empty")
	}
	if cfg.AuthUsername == "" {
		t.Error("AuthUsername should not be empty")
	}
	if cfg.AuthPassword == "" {
		t.Error("AuthPassword should not be empty")
	}
	if cfg.NodeAPIURL == "" {
		t.Error("NodeAPIURL should not be empty")
	}
}

func TestLoadDefaults(t *testing.T) {
	os.Unsetenv("PORT")
	os.Unsetenv("JWT_SECRET")
	os.Unsetenv("AUTH_USERNAME")
	os.Unsetenv("AUTH_PASSWORD")

	cfg := Load()

	if cfg.Port != "3001" {
		t.Errorf("expected default port 3001, got %s", cfg.Port)
	}
	if cfg.JWTSecret != "default-secret-change-in-production" {
		t.Errorf("expected default JWT secret, got %s", cfg.JWTSecret)
	}
	if cfg.AuthUsername != "admin" {
		t.Errorf("expected default username admin, got %s", cfg.AuthUsername)
	}
	if cfg.AuthPassword != "secret" {
		t.Errorf("expected default password secret, got %s", cfg.AuthPassword)
	}
}

func TestLoadFromEnv(t *testing.T) {
	os.Setenv("PORT", "4000")
	os.Setenv("JWT_SECRET", "test-jwt")
	os.Setenv("AUTH_USERNAME", "user")
	os.Setenv("AUTH_PASSWORD", "pass")
	os.Setenv("NODE_API_URL", "http://test:9999")
	os.Setenv("JWT_EXPIRATION", "7200")
	defer os.Unsetenv("PORT")
	defer os.Unsetenv("JWT_SECRET")
	defer os.Unsetenv("AUTH_USERNAME")
	defer os.Unsetenv("AUTH_PASSWORD")
	defer os.Unsetenv("NODE_API_URL")
	defer os.Unsetenv("JWT_EXPIRATION")

	cfg := Load()

	if cfg.Port != "4000" {
		t.Errorf("expected port 4000, got %s", cfg.Port)
	}
	if cfg.JWTSecret != "test-jwt" {
		t.Errorf("expected JWTSecret test-jwt, got %s", cfg.JWTSecret)
	}
	if cfg.AuthUsername != "user" {
		t.Errorf("expected username user, got %s", cfg.AuthUsername)
	}
	if cfg.AuthPassword != "pass" {
		t.Errorf("expected password pass, got %s", cfg.AuthPassword)
	}
	if cfg.NodeAPIURL != "http://test:9999" {
		t.Errorf("expected NodeAPIURL http://test:9999, got %s", cfg.NodeAPIURL)
	}
	if cfg.JWTExpiration != "7200" {
		t.Errorf("expected JWTExpiration 7200, got %s", cfg.JWTExpiration)
	}
}

func TestGetEnv(t *testing.T) {
	os.Setenv("TEST_KEY", "test-value")
	defer os.Unsetenv("TEST_KEY")

	val := getEnv("TEST_KEY", "default")
	if val != "test-value" {
		t.Errorf("expected test-value, got %s", val)
	}

	val = getEnv("NON_EXISTENT_KEY_XYZ", "fallback")
	if val != "fallback" {
		t.Errorf("expected fallback, got %s", val)
	}

	val = getEnv("TEST_KEY", "default")
	if val != "test-value" {
		t.Errorf("expected test-value on second call, got %s", val)
	}
}
