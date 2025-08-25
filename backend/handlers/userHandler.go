package handlers

import (
	"backend/db"
	"backend/models"
	"encoding/json"
	"github.com/lib/pq"
	"log"
	"net/http"

	"golang.org/x/crypto/bcrypt"
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
		http.Error(w, "Corpo da requisição inválido", http.StatusBadRequest)
		return
	}

	// 2. Validação de campos e hashing da senha
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("ERRO AO GERAR HASH DA SENHA: %v", err)
		http.Error(w, "Erro interno", http.StatusInternalServerError)
		return
	}

	query := `
		INSERT INTO users (name, email, birth_date, cpf, phone, street, neighborhood, number, zip_code, state, city, password)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`

	_, err = db.DB.Exec(query, user.Name, user.Email, user.BirthDate, user.CPF, user.Phone,
		user.Street, user.Neighborhood, user.Number, user.ZipCode, user.State, user.City, string(hashedPassword))
	if err != nil {
		log.Printf("ERRO AO INSERIR NO BANCO DE DADOS: %v", err)

		// Verificar se o erro é de constraint violada (email ou CPF duplicado)
		if pqErr, ok := err.(*pq.Error); ok {
			if pqErr.Code == "23505" {
				if pqErr.Constraint == "users_email_key" {
					w.WriteHeader(http.StatusConflict)
					json.NewEncoder(w).Encode(map[string]string{"error": "email_duplicado"})
					return
				} else if pqErr.Constraint == "users_cpf_key" {
					w.WriteHeader(http.StatusConflict)
					json.NewEncoder(w).Encode(map[string]string{"error": "cpf_duplicado"})
					return
				}
			}
		}

		http.Error(w, "Erro interno ao tentar criar usuário", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated) // Define o status HTTP para 201 Created
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Usuário criado com sucesso",
	})
}

