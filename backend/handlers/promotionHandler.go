package handlers

import (
	"backend/db"
	"backend/models"
	"backend/services"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

func GetPromotionalProducts(w http.ResponseWriter, r *http.Request) {
	promoName := strings.TrimPrefix(r.URL.Path, "/api/promotions/")
	fields := make(map[string]services.FilterField, len(productFilterFields)+1)
	for key, field := range productFilterFields {
		fields[key] = field
	}
	fields["promotional_price"] = services.FilterField{Column: "page.promotional_price", Kind: "decimal"}
	// One row per product even when the same product belongs to multiple matching promotions.
	query := "SELECT " + storeProductColumns + `,promotional.promotional_price` + storeProductSource + `
 JOIN (
  SELECT pp.product_id,MIN(pp.promotional_price) AS promotional_price
  FROM promotion_products pp JOIN promotions promo ON promo.id=pp.promotion_id
  WHERE promo.name=$1 AND promo.status='active'
   AND promo.start_date<=NOW() AND promo.end_date>=NOW()
   AND pp.promotional_price>=0
  GROUP BY pp.product_id
 ) promotional ON promotional.product_id=p.id
 WHERE p.status='active' AND promotional.promotional_price<=p.price`
	writeProductPage(w, r, query, []any{promoName}, fields)
}

func CreatePromotion(w http.ResponseWriter, r *http.Request) {
	var req models.CreatePromotionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Requisição inválida", http.StatusBadRequest)
		return
	}

	query := `
        INSERT INTO promotions (name, status, start_date, end_date)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `

	var promotionID int
	err := db.DB.QueryRow(query, req.Name, req.Status, req.StartDate, req.EndDate).Scan(&promotionID)
	if err != nil {
		log.Printf("Erro ao criar promoção: %v", err)
		http.Error(w, "Erro ao criar promoção", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int{"id": promotionID})
}

func AddProductToPromotion(w http.ResponseWriter, r *http.Request) {
	var req models.AddToPromotionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Requisição inválida", http.StatusBadRequest)
		return
	}

	// Busca o ID da promoção pelo nome
	var promotionID int
	err := db.DB.QueryRow("SELECT id FROM promotions WHERE name = $1 AND status = 'active'", req.PromotionName).Scan(&promotionID)
	if err != nil {
		if err == sql.ErrNoRows {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Promoção não encontrada ou inativa"})
		} else {
			log.Printf("Erro ao buscar promoção: %v", err)
			http.Error(w, "Erro interno do servidor", http.StatusInternalServerError)
		}
		return
	}

	// Insere o produto na tabela de promoções
	query := `
        INSERT INTO promotion_products (promotion_id, product_id, promotional_price) 
        VALUES ($1, $2, $3)`

	_, err = db.DB.Exec(query, promotionID, req.ProductID, req.PromotionalPrice)
	if err != nil {
		log.Printf("Erro ao adicionar produto à promoção: %v", err)
		http.Error(w, "Erro ao adicionar produto à promoção", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Produto adicionado à promoção com sucesso"})
}

// func GetProductImagesByID(w http.ResponseWriter, r *http.Request) {
//     idStr := strings.TrimPrefix(r.URL.Path, "/api/test/images/")
//     id, err := strconv.Atoi(idStr)
//     if err != nil {
//         http.Error(w, "ID inválido", http.StatusBadRequest)
//         return
//     }

//     // Query para buscar apenas as imagens
//     rows, err := db.DB.Query(`SELECT image_path FROM product_images WHERE product_id = $1`, id)
//     if err != nil {
//         log.Printf("Erro ao buscar imagens para o produto %d: %v", id, err)
//         http.Error(w, "Erro ao buscar imagens", http.StatusInternalServerError)
//         return
//     }
//     defer rows.Close()

//     var imagePaths []string
//     for rows.Next() {
//         var path string
//         if err := rows.Scan(&path); err == nil {
//             imagePaths = append(imagePaths, path)
//         }
//     }

//     if err := rows.Err(); err != nil {
//         log.Printf("Erro após iteração nas linhas: %v", err)
//         http.Error(w, "Erro ao processar dados", http.StatusInternalServerError)
//         return
//     }

//     w.Header().Set("Content-Type", "application/json")
//     json.NewEncoder(w).Encode(imagePaths)
// }
