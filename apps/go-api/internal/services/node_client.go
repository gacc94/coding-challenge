package services

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-resty/resty/v2"
	"github.com/golang-jwt/jwt/v5"

	"github.com/interseguro/go-api/internal/models"
)

type NodeClient struct {
	client    *resty.Client
	jwtSecret string
}

func NewNodeClient(baseURL, jwtSecret string) *NodeClient {
	client := resty.New().
		SetBaseURL(baseURL).
		SetTimeout(10 * time.Second).
		SetRetryCount(2).
		SetRetryWaitTime(500 * time.Millisecond).
		AddRetryCondition(func(r *resty.Response, err error) bool {
			return err != nil || r.StatusCode() >= 500
		})

	return &NodeClient{
		client:    client,
		jwtSecret: jwtSecret,
	}
}

func (c *NodeClient) SendMatrices(Q, R, rotated [][]float64) (*models.StatsResponse, error) {
	token, err := generateJWT(c.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("failed to generate internal JWT: %w", err)
	}

	body := models.StatsRequest{
		Matrices: [][][]float64{Q, R, rotated},
	}

	resp, err := c.client.R().
		SetHeader("Content-Type", "application/json").
		SetHeader("Authorization", "Bearer "+token).
		SetBody(body).
		Post("/api/v1/stats")

	if err != nil {
		return nil, fmt.Errorf("node API request failed: %w", err)
	}

	if resp.StatusCode() != 200 {
		return nil, fmt.Errorf("node API returned status %d: %s", resp.StatusCode(), resp.String())
	}

	var stats models.StatsResponse
	if err := json.Unmarshal(resp.Body(), &stats); err != nil {
		return nil, fmt.Errorf("failed to parse node API response: %w", err)
	}

	return &stats, nil
}

func generateJWT(secret string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": "go-api-internal",
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(time.Hour).Unix(),
	})
	return token.SignedString([]byte(secret))
}
