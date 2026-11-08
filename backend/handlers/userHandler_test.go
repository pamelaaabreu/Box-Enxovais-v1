package handlers

import (
	"encoding/json"
	"errors"
	"github.com/lib/pq"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestIsStrongPassword(t *testing.T) {
	tests := []struct {
		password string
		want     bool
	}{
		{password: "Senha1@x", want: true},
		{password: "curta1@", want: false},
		{password: "semsenha1@", want: false},
		{password: "SEMSENHA1@", want: false},
		{password: "SemNumero@", want: false},
		{password: "SemSimbolo1", want: false},
	}

	for _, tt := range tests {
		if got := isStrongPassword(tt.password); got != tt.want {
			t.Errorf("isStrongPassword(%q) = %v; want %v", tt.password, got, tt.want)
		}
	}
}

func TestValidateCreateUser(t *testing.T) {
	tests := []struct {
		name string
		user createUserRequest
		want string
	}{
		{
			name: "valid short registration",
			user: createUserRequest{
				Name:     "Maria Silva",
				Email:    "maria@example.com",
				Password: "Senha1@x",
				Terms:    true,
			},
		},
		{
			name: "requires full name",
			user: createUserRequest{
				Name:     "Maria",
				Email:    "maria@example.com",
				Password: "Senha1@x",
				Terms:    true,
			},
			want: "Informe seu nome e sobrenome",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := validateCreateUser(tt.user); got != tt.want {
				t.Errorf("validateCreateUser() = %q; want %q", got, tt.want)
			}
		})
	}
}

func TestCreateUserRejectsInvalidHTTP(t *testing.T) {
	valid := createUserRequest{Name: "Maria Silva", Email: "maria@example.com", Password: "Senha1@x", Terms: true}
	cases := []struct {
		name   string
		mutate func(*createUserRequest)
	}{
		{"missing name", func(u *createUserRequest) { u.Name = "" }},
		{"single name", func(u *createUserRequest) { u.Name = "Maria" }},
		{"missing email", func(u *createUserRequest) { u.Email = "" }},
		{"invalid email", func(u *createUserRequest) { u.Email = "invalid" }},
		{"missing password", func(u *createUserRequest) { u.Password = "" }},
		{"weak password", func(u *createUserRequest) { u.Password = "password" }},
		{"too many bytes", func(u *createUserRequest) { u.Password = "Senha1@" + strings.Repeat("é", 34) }},
		{"short multibyte password", func(u *createUserRequest) { u.Password = "Aa1@é" }},
		{"terms refused", func(u *createUserRequest) { u.Terms = false }},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			u := valid
			c.mutate(&u)
			body, _ := json.Marshal(u)
			w := httptest.NewRecorder()
			CreateUser(w, httptest.NewRequest("POST", "/register", strings.NewReader(string(body))))
			if w.Code != 400 {
				t.Fatalf("status=%d", w.Code)
			}
			if strings.Contains(w.Body.String(), u.Password) && u.Password != "" {
				t.Fatal("password disclosed")
			}
		})
	}
	for _, body := range []string{`{"password":123}`, `{} {}`, `{"confirmPassword":"secret"}`} {
		w := httptest.NewRecorder()
		CreateUser(w, httptest.NewRequest("POST", "/register", strings.NewReader(body)))
		if w.Code != 400 {
			t.Fatalf("malformed request status=%d", w.Code)
		}
	}
}

func TestCreateUserNormalizationAndDatabaseErrors(t *testing.T) {
	u := createUserRequest{Name: "  Maria Silva  ", Email: " MARIA@EXAMPLE.COM ", Password: "Senha1@x", Terms: true}
	normalizeCreateUserData(&u)
	if u.Name != "Maria Silva" || u.Email != "maria@example.com" || validateCreateUser(u) != "" {
		t.Fatal("normalization or valid input rejected")
	}
	for _, c := range []struct {
		err     error
		status  int
		message string
	}{
		{&pq.Error{Code: "23505", Constraint: "users_email_key"}, 409, "email_duplicado"},
		{errors.New("private database detail"), 500, "Erro interno ao tentar criar usuário"},
	} {
		w := httptest.NewRecorder()
		handleCreateUserDatabaseError(w, c.err)
		if w.Code != c.status || !strings.Contains(w.Body.String(), c.message) || strings.Contains(w.Body.String(), "private database detail") {
			t.Fatal("unexpected error response")
		}
	}
}
