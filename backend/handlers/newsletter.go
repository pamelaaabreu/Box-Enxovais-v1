package handlers

import (
	"backend/db"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"backend/models"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"
)


func SubscribeNewsletter(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var subReq models.SubscriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&subReq); err != nil {
		http.Error(w, "Corpo da requisição inválido", http.StatusBadRequest)
		return
	}

	if subReq.Email == "" {
		http.Error(w, `{"error": "O e-mail é obrigatório."}`, http.StatusBadRequest)
		return
	}

	// --- Lógica do SendGrid ---

	from := mail.NewEmail("Pamela Abreu", "vitoria201547@gmail.com")
	to := mail.NewEmail("", subReq.Email)
	subject := "Bem-vindo à Box Enxovais! 🎉"
	htmlContent := `
		<div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
		  <h2>Obrigado por se inscrever!</h2>
		  <p>Como prometido, aqui está seu cupom de 10% de desconto para sua primeira compra.</p>
		  <p style="font-size: 24px; font-weight: bold; color: #8b4513; border: 2px dashed #8b4513; padding: 10px; margin: 20px auto; max-width: 200px;">
			BEMVINDO10
		  </p>
		  <p>Aproveite!</p>
		  <p><strong>Equipe Box Enxovais</strong></p>
		</div>
	`
	message := mail.NewSingleEmail(from, subject, to, "Use o cupom BEMVINDO10", htmlContent)

	apiKey := os.Getenv("SENDGRID_API_KEY")
	if apiKey == "" {
		log.Println("ERRO: SENDGRID_API_KEY não está definida nas variáveis de ambiente.")
		http.Error(w, `{"error": "Erro interno do servidor."}`, http.StatusInternalServerError)
		return
	}

	client := sendgrid.NewSendClient(apiKey)
	response, err := client.Send(message)

	if err != nil {
		log.Println("Erro ao enviar e-mail via SendGrid:", err)
		http.Error(w, `{"error": "Ocorreu um erro ao processar sua inscrição."}`, http.StatusInternalServerError)
		return
	}

	if response.StatusCode >= 200 && response.StatusCode < 300 {
		log.Println("E-mail de newsletter enviado com sucesso para:", subReq.Email)

		err := db.SaveSubscriber(subReq.Email)
		if err != nil {
			// Se der erro ao salvar no DB, não precisa retornar um erro para o cliente,
			// pois o e-mail de cupom já foi enviado. Apenas registre o erro no log.
			log.Printf("AVISO: E-mail %s não foi salvo no banco de dados: %v", subReq.Email, err)
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Inscrição realizada com sucesso!"})
	} else {
		log.Printf("Erro do SendGrid. Status: %d, Body: %s", response.StatusCode, response.Body)
		http.Error(w, `{"error": "Não foi possível enviar o e-mail de confirmação."}`, http.StatusInternalServerError)
	}
}
