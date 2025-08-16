package handlers

import (
	"backend/db"
	"backend/models"
	"encoding/json" // Garanta que este import está aqui
	"log"
	"net/http"
	"database/sql"
	"strconv"
	"strings" 
)

func CreateProduct(w http.ResponseWriter, r *http.Request) {
	var p models.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
    
    // ✅ INÍCIO DA CORREÇÃO ✅
    // Converte o mapa de medidas para um []byte (slice de bytes) no formato JSON.
	measurementsJSON, err := json.Marshal(p.Measurements)
	if err != nil {
		http.Error(w, "Erro ao processar as medidas do produto", http.StatusBadRequest)
		return
	}
    // ✅ FIM DA CORREÇÃO ✅

	query := `
        INSERT INTO products 
        (name, description, care_instructions, measurements, price, quantity, brand_id, product_type_id, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING id`
	
	var productID int
	err = db.DB.QueryRow( // A chamada do QueryRow agora usa a variável convertida
		query,
		p.Name,
		p.Description,
		p.CareInstructions,
		measurementsJSON, // <--- MUDANÇA AQUI
		p.Price,
		p.Quantity,
		p.BrandID,
		p.ProductTypeID,
		p.Status,
	).Scan(&productID)
	
	if err != nil {
		log.Printf("Erro ao inserir produto: %v", err)
		http.Error(w, "Erro ao criar produto", http.StatusInternalServerError)
		return
	}

	log.Printf("Produto criado com ID: %d", productID)
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int{"id": productID})
}

func GetProduct(w http.ResponseWriter, r *http.Request) {
	// Extrai o ID da URL, ex: /products/1 -> "1"
	idStr := strings.TrimPrefix(r.URL.Path, "/products/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	// Busca o produto principal
	query := `SELECT id, name, description, price, quantity, status FROM products WHERE id = $1`
	var p models.Product
	err = db.DB.QueryRow(query, id).Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Quantity, &p.Status)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Produto não encontrado", http.StatusNotFound)
		} else {
			log.Printf("Erro ao buscar produto: %v", err)
			http.Error(w, "Erro ao buscar produto", http.StatusInternalServerError)
		}
		return
	}

	// Busca as imagens associadas ao produto
	rows, err := db.DB.Query(`SELECT image_path FROM product_images WHERE product_id = $1`, id)
	if err != nil {
		// Mesmo que a busca de imagens falhe, ainda podemos retornar o produto
		log.Printf("Erro ao buscar imagens para o produto %d: %v", id, err)
	} else {
		defer rows.Close()
		for rows.Next() {
			var path string
			if err := rows.Scan(&path); err == nil {
				p.ImagePaths = append(p.ImagePaths, path)
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}