package db

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

const (
	DBHOST     = "localhost"
	DBPORT     = 5432
	DBUSER     = "postgres"
	DBPASSWORD = "Apolo2024**!"
	DBNAME     = "bd_box"
)

var DB *sql.DB

func InitDB() {
	connStr := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		DBHOST, DBPORT, DBUSER, DBPASSWORD, DBNAME,
	)

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Erro ao abrir conexão:", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("Erro ao conectar:", err)
	}

	fmt.Println("✅ Banco conectado com sucesso!")
}
