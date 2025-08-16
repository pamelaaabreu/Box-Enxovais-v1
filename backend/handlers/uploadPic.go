package handlers

import (
	"backend/db"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

type UploadResponse struct {
	Message  string `json:"message"`
	FilePath string `json:"filePath"`
}

func UploadProductImage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "A imagem é muito grande. Limite de 10MB.", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Erro ao recuperar o arquivo do formulário", http.StatusBadRequest)
		return
	}
	defer file.Close()

	productIdStr := r.FormValue("productId")
	if productIdStr == "" {
		http.Error(w, "O ID do produto é obrigatório", http.StatusBadRequest)
		return
	}
	
	productId, err := strconv.Atoi(productIdStr)
	if err != nil {
		http.Error(w, "O ID do produto deve ser um número inteiro válido", http.StatusBadRequest)
		return
	}

	log.Printf("Upload recebido para o produto ID: %d", productId)

	dir := "./uploads"
	os.MkdirAll(dir, os.ModePerm)

	ext := filepath.Ext(handler.Filename)
	newFileName := fmt.Sprintf("%d_%d%s", productId, time.Now().UnixNano(), ext)
	
	filePath := filepath.Join(dir, newFileName)
	dst, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Não foi possível criar o arquivo no servidor", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Não foi possível salvar o arquivo", http.StatusInternalServerError)
		return
	}
	
	log.Printf("Arquivo salvo com sucesso em: %s", filePath)

	query := `INSERT INTO product_images (product_id, image_path) VALUES ($1, $2)`
	_, err = db.DB.Exec(query, productId, filePath)
	if err != nil {
		log.Printf("Erro ao salvar o caminho da imagem no banco de dados: %v", err)
		http.Error(w, "Erro ao registrar a imagem no banco de dados", http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(UploadResponse{
		Message:  "Upload realizado com sucesso!",
		FilePath: filePath,
	})
}