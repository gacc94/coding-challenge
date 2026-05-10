package models

import "time"

// ErrorResponse representa la estructura estándar de error
type ErrorResponse struct {
	Error   string                 `json:"error"`
	Code    string                 `json:"code"`
	Status  int                    `json:"status"`
	Details map[string]interface{} `json:"details,omitempty"`
}

// AuthRequest representa las credenciales de login
// @Description Credenciales de autenticación
type AuthRequest struct {
	Username string `json:"username" example:"admin"`
	Password string `json:"password" example:"secret"`
}

// AuthResponse representa la respuesta del login
// @Description Token JWT generado
type AuthResponse struct {
	Token     string `json:"token" example:"eyJhbGciOiJIUzI1NiIs..."`
	Type      string `json:"type" example:"Bearer"`
	ExpiresIn int    `json:"expiresIn" example:"3600"`
}

// FactorizationRequest representa la petición de factorización QR
// @Description Matriz rectangular y tipo de rotación
type FactorizationRequest struct {
	Matrix   [][]float64 `json:"matrix" example:"[[1,2],[3,4],[5,6]]"`
	Rotation string      `json:"rotation" example:"clockwise_90" enums:"none,clockwise_90,clockwise_180,clockwise_270,transpose,horizontal_flip,vertical_flip"`
}

// FactorizationResponse representa la respuesta completa
// @Description Resultado de rotación + factorización QR + estadísticas
type FactorizationResponse struct {
	Original [][]float64     `json:"original"`
	Rotated  [][]float64     `json:"rotated"`
	Rotation string          `json:"rotation"`
	Q        [][]float64     `json:"Q"`
	R        [][]float64     `json:"R"`
	Stats    *StatsResponse  `json:"stats"`
	Error    *ErrorResponse  `json:"error,omitempty"`
}

// StatsRequest enviado a la API Node.js
// @Description Matrices para calcular estadísticas
type StatsRequest struct {
	Matrices [][][]float64 `json:"matrices"`
}

// StatsResponse recibida desde la API Node.js
// @Description Estadísticas calculadas sobre las matrices
type StatsResponse struct {
	Max              float64        `json:"max"`
	Min              float64        `json:"min"`
	Average          float64        `json:"average"`
	Sum              float64        `json:"sum"`
	TotalElements    int            `json:"totalElements"`
	NumberOfMatrices int            `json:"numberOfMatrices"`
	DiagonalMatrices DiagonalResult `json:"diagonalMatrices"`
}

// DiagonalResult representa el resultado de verificación de matrices diagonales
// @Description Matrices que son diagonales
type DiagonalResult struct {
	Count    int                   `json:"count"`
	Matrices []DiagonalMatrixInfo  `json:"matrices"`
}

// DiagonalMatrixInfo contiene info de una matriz diagonal encontrada
// @Description Información de matriz diagonal
type DiagonalMatrixInfo struct {
	MatrixIndex int    `json:"matrixIndex" example:"1"`
	Name        string `json:"name" example:"R (Upper Triangular)"`
	Dimensions  string `json:"dimensions" example:"2x2"`
}

// HealthResponse representa la respuesta del health check
type HealthResponse struct {
	Status    string    `json:"status" example:"ok"`
	Service   string    `json:"service" example:"go-api"`
	Timestamp time.Time `json:"timestamp"`
}
