package handlers

import (
	"backend/db"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

const minPasswordLength = 6

type createUserRequest struct {
	Name         string `json:"name"`
	Email        string `json:"email"`
	BirthDate    string `json:"birthDate"`
	CPF          string `json:"cpf"`
	Phone        string `json:"phone"`
	Street       string `json:"street"`
	Neighborhood string `json:"neighborhood"`
	Number       string `json:"number"`
	ZipCode      string `json:"zipCode"`
	State        string `json:"state"`
	City         string `json:"city"`
	Password     string `json:"password"`
	Terms        bool   `json:"terms"`
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	var user createUserRequest

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	err := decoder.Decode(&user)
	if err != nil {
		log.Printf("ERRO AO DECODIFICAR JSON DO CADASTRO: %v", err)
		writeJSONError(w, http.StatusBadRequest, "Corpo da requisição inválido")
		return
	}

	normalizeCreateUserData(&user)

	if validationMessage := validateCreateUser(user); validationMessage != "" {
		writeJSONError(w, http.StatusBadRequest, validationMessage)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("ERRO AO GERAR HASH DA SENHA: %v", err)
		writeJSONError(w, http.StatusInternalServerError, "Erro interno ao criar usuário")
		return
	}

	query := `
		INSERT INTO users (
			full_name,
			email,
			birth_date,
			national_id,
			phone,
			street,
			neighborhood,
			number,
			zip_code,
			state,
			city,
			password
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`

	_, err = db.DB.Exec(
		query,
		user.Name,
		user.Email,
		user.BirthDate,
		user.CPF,
		user.Phone,
		user.Street,
		user.Neighborhood,
		user.Number,
		user.ZipCode,
		user.State,
		user.City,
		string(hashedPassword),
	)

	if err != nil {
		handleCreateUserDatabaseError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{
		"message": "Usuário criado com sucesso",
	})
}

func normalizeCreateUserData(user *createUserRequest) {
	user.Name = strings.TrimSpace(user.Name)
	user.Email = strings.ToLower(strings.TrimSpace(user.Email))
	user.BirthDate = strings.TrimSpace(user.BirthDate)
	user.CPF = onlyNumbers(user.CPF)
	user.Phone = onlyNumbers(user.Phone)
	user.Street = strings.TrimSpace(user.Street)
	user.Neighborhood = strings.TrimSpace(user.Neighborhood)
	user.Number = strings.TrimSpace(user.Number)
	user.ZipCode = onlyNumbers(user.ZipCode)
	user.State = strings.ToUpper(strings.TrimSpace(user.State))
	user.City = strings.TrimSpace(user.City)
}

func validateCreateUser(user createUserRequest) string {
	if user.Name == "" {
		return "Nome é obrigatório"
	}

	if user.Email == "" {
		return "Email é obrigatório"
	}

	if !isValidEmail(user.Email) {
		return "Email inválido"
	}

	if user.Password == "" {
		return "Senha é obrigatória"
	}

	if len(user.Password) < minPasswordLength {
		return "A senha deve ter pelo menos 6 caracteres"
	}

	if user.BirthDate == "" {
		return "Data de nascimento é obrigatória"
	}

	if user.CPF == "" {
		return "CPF é obrigatório"
	}

	if len(user.CPF) != 11 {
		return "CPF inválido"
	}

	if user.Phone == "" {
		return "Telefone é obrigatório"
	}

	if user.ZipCode == "" {
		return "CEP é obrigatório"
	}

	if len(user.ZipCode) != 8 {
		return "CEP inválido"
	}

	if user.Street == "" {
		return "Rua é obrigatória"
	}

	if user.Neighborhood == "" {
		return "Bairro é obrigatório"
	}

	if user.Number == "" {
		return "Número é obrigatório"
	}

	if user.State == "" {
		return "Estado é obrigatório"
	}

	if user.City == "" {
		return "Cidade é obrigatória"
	}

	if !user.Terms {
		return "É necessário aceitar os termos de uso"
	}

	return ""
}

func handleCreateUserDatabaseError(w http.ResponseWriter, err error) {
	log.Printf("ERRO AO INSERIR USUÁRIO NO BANCO DE DADOS: %v", err)

	pqErr, ok := err.(*pq.Error)
	if !ok {
		writeJSONError(w, http.StatusInternalServerError, "Erro interno ao tentar criar usuário")
		return
	}

	if pqErr.Code == "23505" {
		switch pqErr.Constraint {
		case "users_email_key":
			writeJSONError(w, http.StatusConflict, "email_duplicado")
			return

		case "users_cpf_key", "users_national_id_key":
			writeJSONError(w, http.StatusConflict, "cpf_duplicado")
			return

		default:
			writeJSONError(w, http.StatusConflict, "dados_duplicados")
			return
		}
	}

	writeJSONError(w, http.StatusInternalServerError, "Erro interno ao tentar criar usuário")
}

func isValidEmail(email string) bool {
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}

func onlyNumbers(value string) string {
	var result strings.Builder

	for _, char := range value {
		if char >= '0' && char <= '9' {
			result.WriteRune(char)
		}
	}

	return result.String()
}
