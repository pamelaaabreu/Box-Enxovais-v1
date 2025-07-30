package handlers

import (
	"backend/db"
	"backend/models"
	"encoding/json"
	"log"
	"net/http"
	"github.com/lib/pq"
)

func CreateUser(w http.ResponseWriter, r *http.Request) {
	// Permite apenas o método POST
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	var user models.User

	// 1. Tratamento de erro ao decodificar o JSON do corpo da requisição
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		log.Printf("ERRO AO DECODIFICAR JSON: %v", err)
		http.Error(w, "Corpo da requisição inválido", http.StatusBadRequest) // Erro do cliente (400)
		return
	}

	query := `
		INSERT INTO users (name, email, birth_date, cpf, phone, street, neighborhood, number, zip_code, state, city, password)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`

	_, err = db.DB.Exec(query, user.Name, user.Email, user.BirthDate, user.CPF, user.Phone,
		user.Street, user.Neighborhood, user.Number, user.ZipCode, user.State, user.City, user.Password)
	if err != nil {
		log.Printf("ERRO AO INSERIR NO BANCO DE DADOS: %v", err)

		// Verificar se o erro é de constraint UNIQUE
		if pqErr, ok := err.(*pq.Error); ok {
			if pqErr.Code == "23505" { 
				if pqErr.Constraint == "unique_email" {
					w.WriteHeader(http.StatusConflict) 
					json.NewEncoder(w).Encode(map[string]string{"error": "email_duplicado"})
					return
				} else if pqErr.Constraint == "unique_cpf" {
					w.WriteHeader(http.StatusConflict) 
					json.NewEncoder(w).Encode(map[string]string{"error": "cpf_duplicado"})
					return
				}
			}
		}

		http.Error(w, "Erro interno ao tentar criar usuário", http.StatusInternalServerError)
		return
	}
}
