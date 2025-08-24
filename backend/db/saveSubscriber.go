// Em algum arquivo dentro da pasta /db
package db

import (
	"log"
)

func SaveSubscriber(email string) error {
	// A query SQL para inserir o e-mail.
	// "ON CONFLICT (email) DO NOTHING" é um truque para evitar erros se o e-mail já existir.
	query := `INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`

	_, err := DB.Exec(query, email) // DB é sua variável de conexão com o banco
	if err != nil {
		log.Printf("Erro ao salvar e-mail do assinante no banco de dados: %v", err)
		return err
	}

	log.Printf("E-mail %s salvo na lista de newsletter.", email)
	return nil
}
