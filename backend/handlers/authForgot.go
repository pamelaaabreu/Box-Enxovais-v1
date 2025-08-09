package handlers

import (
	"backend/db"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"time"
)

type ForgotPasswordRequest struct {
	Email string `json:"email"`
}

func ForgotPassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var req ForgotPasswordRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil || req.Email == "" {
		http.Error(w, "Email inválido", http.StatusBadRequest)
		return
	}

	var userID int
	err = db.DB.QueryRow("SELECT id FROM users WHERE email = $1", req.Email).Scan(&userID)
	if err != nil {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"message":"Se o email existir, você receberá instruções."}`))
		return
	}

	tokenBytes := make([]byte, 32)
	_, err = rand.Read(tokenBytes)
	if err != nil {
		log.Println("Erro ao gerar token:", err)
		http.Error(w, "Erro interno", http.StatusInternalServerError)
		return
	}
	token := hex.EncodeToString(tokenBytes)

	// Salva token com prazo no banco (tabela password_resets: user_id, token, expires_at)
	expiry := time.Now().Add(1 * time.Hour)
	_, err = db.DB.Exec(`
		INSERT INTO password_resets (user_id, token, expires_at)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = $3
	`, userID, token, expiry)
	if err != nil {
		log.Println("Erro ao salvar token:", err)
		http.Error(w, "Erro interno", http.StatusInternalServerError)
		return
	}

	resetURL := fmt.Sprintf("http://localhost:4200/reset-password?token=%s", token)
	err = sendResetEmail(req.Email, resetURL)
	if err != nil {
		log.Println("Erro ao enviar email:", err)
		// Ainda assim retorna OK para o usuário
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Se o email existir, você receberá instruções."}`))
}

func sendResetEmail(to, resetURL string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USERNAME")
	smtpPass := os.Getenv("SMTP_PASSWORD")
	from := os.Getenv("FROM_EMAIL")

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)

	subject := "Recuperação de senha"
	body := fmt.Sprintf("Para redefinir sua senha, clique no link: %s\n\nSe não solicitou, ignore este email.", resetURL)
	
	msg := []byte("From: " + from + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"\r\n" + body + "\r\n")

	return smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, msg)
}
