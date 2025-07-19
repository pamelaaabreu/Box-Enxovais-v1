package models

type User struct {
	Name         string `json:"name"`
	Email        string `json:"email"`
	BirthDate    string `json:"birthDate"`     // Corrigido
	CPF          string `json:"cpf"`
	Phone        string `json:"phone"`
	Street       string `json:"street"`
	Neighborhood string `json:"neighborhood"`
	Number       string `json:"number"`
	ZipCode      string `json:"zipCode"`       // Corrigido
	State        string `json:"state"`
	City         string `json:"city"`
	Password     string `json:"password"`
}