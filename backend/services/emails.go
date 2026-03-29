package services

import (
	"bytes"
	"html/template"
	"os"

	"gopkg.in/gomail.v2"
)

// Função para enviar email com template HTML carregado de um arquivo
func SendEmailWithTemplate(email, subject, message string) error {
	// Carregar o template HTML a partir de um arquivo
	tmpl, err := template.ParseFiles("templates/email_template.html")
	if err != nil {
		return err
	}

	// Dados para substituir no template
	data := struct {
		Message string
	}{
		Message: message,
	}

	// Executar o template com os dados
	var body bytes.Buffer
	if err := tmpl.Execute(&body, data); err != nil {
		return err
	}

	// Configurar o email
	messageEmail := gomail.NewMessage()
	messageEmail.SetHeader("From", os.Getenv("EMAIL"))
	messageEmail.SetHeader("To", email)
	messageEmail.SetHeader("Subject", subject)
	messageEmail.SetBody("text/html", body.String())

	// Configurar o dialer
	dialer := gomail.NewDialer(os.Getenv("EMAIL_SMTP"), 587, os.Getenv("EMAIL"), os.Getenv("EMAIL_KEY"))

	// Enviar o email
	return dialer.DialAndSend(messageEmail)
}
