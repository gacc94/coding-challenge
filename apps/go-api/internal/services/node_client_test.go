package services

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang-jwt/jwt/v5"
)

func TestNodeClientNew(t *testing.T) {
	client := NewNodeClient("http://test:9999", "secret")
	if client == nil {
		t.Error("NodeClient should not be nil")
	}
}

func TestSendMatricesToMockServer(t *testing.T) {
	var receivedBody map[string]interface{}

	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			t.Errorf("expected POST, got %s", r.Method)
		}

		token := r.Header.Get("Authorization")
		if token == "" || len(token) < 8 {
			t.Error("Authorization header missing or too short")
		}

		json.NewDecoder(r.Body).Decode(&receivedBody)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"max":              10.0,
			"min":              -5.0,
			"average":          2.5,
			"sum":              25.0,
			"totalElements":    10,
			"numberOfMatrices": 3,
			"diagonalMatrices": map[string]interface{}{
				"count":    0,
				"matrices": []interface{}{},
			},
		})
	}))
	defer mockServer.Close()

	client := NewNodeClient(mockServer.URL, "test-secret")

	Q := [][]float64{{0.5, -0.5}, {0.5, 0.5}}
	R := [][]float64{{2.0, 0.0}, {0.0, 1.0}}
	rotated := [][]float64{{3, 1}, {4, 2}}

	stats, err := client.SendMatrices(Q, R, rotated)
	if err != nil {
		t.Fatal(err)
	}

	if stats == nil {
		t.Fatal("stats should not be nil")
	}
	if stats.Max != 10.0 {
		t.Errorf("expected max 10.0, got %f", stats.Max)
	}
	if stats.Min != -5.0 {
		t.Errorf("expected min -5.0, got %f", stats.Min)
	}
	if receivedBody == nil {
		t.Error("request body should have been received by mock server")
	}
}

func TestNodeClientGenerateJWT(t *testing.T) {
	token, err := generateJWT("test-secret")
	if err != nil {
		t.Fatal(err)
	}
	if token == "" {
		t.Error("token should not be empty")
	}

	parsed, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return []byte("test-secret"), nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if !parsed.Valid {
		t.Error("token should be valid")
	}
}

func TestNodeClientServerError(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(500)
	}))
	defer mockServer.Close()

	client := NewNodeClient(mockServer.URL, "test-secret")

	_, err := client.SendMatrices(nil, nil, nil)
	if err == nil {
		t.Error("expected error for 500 response")
	}
}

func TestNodeClientCannotConnect(t *testing.T) {
	client := NewNodeClient("http://localhost:19999", "test-secret")

	_, err := client.SendMatrices([][]float64{{1}}, [][]float64{{1}}, [][]float64{{1}})
	if err == nil {
		t.Error("expected error for unreachable server")
	}
}
