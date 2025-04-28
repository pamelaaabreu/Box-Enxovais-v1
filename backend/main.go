package main

import ( 
	"database/sql"
	"fmt"
	"log"
	"net/http"
	
	_ "github.com/lib/pq"
)

const ( 
	DBHOST     = "localhost"
	DBPORT     = 5432
	DBUSER     = "postgres"
	DBPASSWORD = "Apolo2024**!"
	DBNAME     = "bd_box"
)

var db *sql.DB 

func main() {
	// Constrói a string de conexão com o banco de dados
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		DBHOST, DBPORT, DBUSER, DBPASSWORD, DBNAME)
	
	var err error 
	
	// Tenta abrir uma conexão com o banco de dados
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Erro ao abrir conexão com o banco de dados:", err)
	}
	defer db.Close() 

	// Verifica se a conexão com o banco de dados está funcionando
	err = db.Ping()
	if err != nil {
		log.Fatal("Erro ao conectar ao banco de dados:", err)
	}	
	fmt.Println("Conexão com PostgreSQL estabelecida com sucesso!")

	// Associa a URL "/produtos" com a função produtosHandler que vai responder as requisições
	http.HandleFunc("/produtos", produtosHandler)
	fmt.Println("Starting server on :8080")
	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("Erro ao iniciar o servidor:", err)
	}
}

// produtosHandler é a função que responde quando alguém acessar "/produtos"
func produtosHandler(w http.ResponseWriter, r *http.Request) {
	
	rows, err := db.Query("SELECT nome FROM produto")
	if err != nil { // se houver erro na consulta, imrpime o erro
		log.Println("Erro ao consultar produtos:", err)
		http.Error(w, "Erro ao buscar produtos", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	
	fmt.Fprintln(w, "Lista de produtos:")
	
	// Iterar pelos resultados
	for rows.Next() {
		var nome string
		if err := rows.Scan(&nome); err != nil {
			log.Println("Erro ao ler produto:", err)
			continue
		}
		fmt.Fprintln(w, "- "+nome)
	}
	
	// Verificar erros durante a iteração
	if err = rows.Err(); err != nil {
		log.Println("Erro durante a iteração dos produtos:", err)
	}
}