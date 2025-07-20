package handlers

import (
	"backend/db"
	"backend/models"
	"encoding/json"
	"net/http"
)

func GetProduto(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query(`SELECT id, name, description, fullbed, queenbed, superkingbed, singlebed, 
	price, quantity, firstimage, secondimage, status FROM produto`)
	if err != nil {
		http.Error(w, "Erro ao consultar produtos: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var produtos []models.Produto

	for rows.Next() {
		var p models.Produto
		err := rows.Scan(
			&p.ID, &p.Name, &p.Description,
			&p.FullBed, &p.QueenBed, &p.SuperKingBed, &p.SingleBed,
			&p.Price, &p.Quantity, &p.FirstImage, &p.SecondImage, &p.Status,
		)
		if err != nil {
			http.Error(w, "Erro ao ler produto: "+err.Error(), http.StatusInternalServerError)
			return
		}
		produtos = append(produtos, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(produtos)
}
