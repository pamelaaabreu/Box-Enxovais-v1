package middlewares

import (
	"backend/models"
	"backend/services"
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	contextKeyUserID contextKey = "userID"
	contextKeyRole   contextKey = "role"
)

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			services.Error(w, http.StatusUnauthorized, "Token de autenticação não fornecido", nil, false)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			services.Error(w, http.StatusUnauthorized, "Formato de token inválido", nil, false)
			return
		}

		tokenString := parts[1]

		secret := os.Getenv("JWT_SECRET")

		token, err := jwt.ParseWithClaims(tokenString, &models.Claims{}, func(token *jwt.Token) (any, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("método de assinatura inesperado: %v", token.Header["alg"])
			}
			return []byte(secret), nil
		})

		if err != nil {
			if errors.Is(err, jwt.ErrTokenExpired) {
				services.Error(w, http.StatusUnauthorized, "Token expirado", nil, false)
				return
			}
			services.Error(w, http.StatusUnauthorized, "Token inválido", err, false)
			return
		}

		if claims, ok := token.Claims.(*models.Claims); ok && token.Valid {
			ctx := context.WithValue(r.Context(), contextKeyUserID, claims.UserID)
			ctx = context.WithValue(ctx, contextKeyRole, claims.Role)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		services.Error(w, http.StatusUnauthorized, "Token de autenticação inválido", nil, false)
	}
}

// func AuthMiddleware(next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		authHeader := r.Header.Get("Authorization")
// 		if authHeader == "" {
// 			http.Error(w, "Token de autenticação não fornecido", http.StatusUnauthorized)
// 			return
// 		}

// 		parts := strings.Split(authHeader, " ")
// 		if len(parts) != 2 || parts[0] != "Bearer" {
// 			http.Error(w, "Formato de token inválido", http.StatusUnauthorized)
// 			return
// 		}

// 		tokenString := parts[1]

// 		secret := os.Getenv("JWT_SECRET")

// 		token, err := jwt.ParseWithClaims(tokenString, &models.Claims{}, func(token *jwt.Token) (interface{}, error) {
// 			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
// 				return nil, fmt.Errorf("método de assinatura inesperado: %v", token.Header["alg"])
// 			}
// 			return []byte(secret), nil
// 		})

// 		if err != nil {
// 			if errors.Is(err, jwt.ErrTokenExpired) {
// 				http.Error(w, "Token expirado", http.StatusUnauthorized)
// 				return
// 			}
// 			http.Error(w, "Token inválido", http.StatusUnauthorized)
// 			return
// 		}

// 		if claims, ok := token.Claims.(*models.Claims); ok && token.Valid {
// 			ctx := context.WithValue(r.Context(), contextKeyUserID, claims.UserID)
// 			ctx = context.WithValue(ctx, contextKeyRole, claims.Role)
// 			next.ServeHTTP(w, r.WithContext(ctx))
// 			return
// 		}

// 		http.Error(w, "Token de autenticação inválido", http.StatusUnauthorized)
// 	})
// }
