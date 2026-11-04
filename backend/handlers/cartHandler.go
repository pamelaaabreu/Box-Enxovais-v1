package handlers

import (
	"backend/db"
	middlewares "backend/middleware"
	"backend/repositories"
	"backend/services"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"strconv"
)

func CartHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	userID, ok := middlewares.GetUserIDFromContext(r.Context())
	if !ok {
		services.Error(w, 401, "Faça login para acessar o carrinho", nil, false)
		return
	}
	operation := "get"
	var id, quantity int64
	if r.PathValue("id") != "" {
		var err error
		id, err = strconv.ParseInt(r.PathValue("id"), 10, 64)
		if err != nil || id <= 0 {
			services.Error(w, 400, "Item inválido", nil, false)
			return
		}
	}
	switch r.Method {
	case http.MethodPost:
		var body struct {
			ProductID int64 `json:"productId"`
			Quantity  int64 `json:"quantity"`
		}
		if !decodeCartBody(w, r, &body) || body.ProductID <= 0 || body.Quantity < 1 || body.Quantity > 1000000 {
			services.Error(w, 400, "Produto ou quantidade inválidos", nil, false)
			return
		}
		operation = "add"
		id = body.ProductID
		quantity = body.Quantity
	case http.MethodPatch:
		var body struct {
			Quantity int64 `json:"quantity"`
		}
		if !decodeCartBody(w, r, &body) || body.Quantity < 1 || body.Quantity > 1000000 {
			services.Error(w, 400, "Quantidade inválida", nil, false)
			return
		}
		operation = "update"
		quantity = body.Quantity
	case http.MethodDelete:
		operation = "clear"
		if id > 0 {
			operation = "remove"
		}
	}
	cart, err := (repositories.CartRepository{DB: db.DB}).Apply(r.Context(), userID, operation, id, quantity)
	if err != nil {
		status := 500
		message := "Não foi possível atualizar o carrinho. Tente novamente."
		switch {
		case errors.Is(err, repositories.ErrCartItemNotFound):
			status = 404
			message = err.Error()
		case errors.Is(err, repositories.ErrCartProduct), errors.Is(err, repositories.ErrCartQuantity):
			status = 409
			message = err.Error()
		default:
			log.Printf("cart operation failed: %v", err)
		}
		services.Error(w, status, message, nil, false)
		return
	}
	services.Success(w, 200, "", cart)
}
func decodeCartBody(w http.ResponseWriter, r *http.Request, target any) bool {
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 4096))
	decoder.DisallowUnknownFields()
	if decoder.Decode(target) != nil {
		return false
	}
	return decoder.Decode(&struct{}{}) == io.EOF
}
