package handlers

import (
	"backend/db"
	"backend/models"
	"backend/services"
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

func CreateProduct(w http.ResponseWriter, r *http.Request) {
	var body struct {
		models.Product
		Quantity *int32 `json:"quantity"`
	}
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&body); err != nil {
		services.Error(w, 400, "Quantidade em estoque deve ser um inteiro maior ou igual a zero; verifique os dados enviados", nil, false)
		return
	}
	if body.Quantity == nil || *body.Quantity < 0 || decoder.Decode(&struct{}{}) != io.EOF {
		services.Error(w, 400, "Informe uma quantidade em estoque inteira entre 0 e 2147483647", nil, false)
		return
	}
	p := body.Product
	p.Quantity = int(*body.Quantity)
	measurementsJSON, err := json.Marshal(p.Measurements)
	if err != nil {
		services.Error(w, 400, "Erro ao processar as medidas do produto", nil, false)
		return
	}

	query := `
        INSERT INTO products 
        (name, description, care_instructions, measurements, price, quantity, brand_id, product_type_id, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING id`

	var productID int
	err = db.DB.QueryRow(
		query,
		p.Name,
		p.Description,
		p.CareInstructions,
		measurementsJSON,
		p.Price,
		p.Quantity,
		p.BrandID,
		p.ProductTypeID,
		p.Status,
	).Scan(&productID)

	if err != nil {
		log.Printf("Erro ao inserir produto: %v", err)
		services.Error(w, 500, "Erro ao criar produto", nil, false)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int{"id": productID})
}

// Product listing and detail share the same data shape used by the storefront.
func GetProduct(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(strings.TrimPrefix(r.URL.Path, "/products/"), 10, 64)
	if err != nil || id <= 0 {
		http.Error(w, "ID inválido", 400)
		return
	}
	products, err := readStoreProducts(r, id)
	if err != nil {
		http.Error(w, "Erro ao buscar produto", 500)
		return
	}
	if len(products) == 0 {
		http.Error(w, "Produto não encontrado", 404)
		return
	}
	writeJSON(w, 200, products[0])
}

// Filters are mapped to public database fields; internal/sensitive fields are never inferred from requests.
var productFilterFields = map[string]services.FilterField{
	"id":                {Column: "page.id", Kind: "integer"},
	"name":              {Column: "page.name", Kind: "text"},
	"description":       {Column: "page.description", Kind: "text"},
	"care_instructions": {Column: "page.care_instructions", Kind: "text"},
	"price":             {Column: "page.price", Kind: "decimal"},
	"quantity":          {Column: "page.quantity", Kind: "integer"},
	"stock":             {Column: "page.quantity", Kind: "integer"},
	"status":            {Column: "page.status", Kind: "text"},
	"brand_id":          {Column: "page.brand_id", Kind: "integer"},
	"product_type_id":   {Column: "page.product_type_id", Kind: "integer"},
	"category_name":     {Column: "page.category_name", Kind: "text"},
	"created_at":        {Column: "page.created_at", Kind: "timestamp"},
	"updated_at":        {Column: "page.updated_at", Kind: "timestamp"},
}

const storeProductColumns = `p.id,p.name,p.description,p.care_instructions,
 COALESCE(p.measurements,'{}') AS measurements,p.price,p.quantity,p.status,
 p.product_type_id,COALESCE(t.name,'') AS category_name,
 COALESCE((SELECT json_agg(image_path ORDER BY is_primary DESC NULLS LAST,id)
 FROM product_images WHERE product_id=p.id),'[]') AS image_paths,
 p.brand_id,p.created_at,p.updated_at`
const storeProductSource = ` FROM products p LEFT JOIN product_types t ON t.id=p.product_type_id`

func ListProducts(w http.ResponseWriter, r *http.Request) {
	writeProductPage(w, r, "SELECT "+storeProductColumns+",0 AS promotional_price"+storeProductSource+" WHERE p.status='active'", nil, productFilterFields)
}

func writeProductPage(w http.ResponseWriter, r *http.Request, query string, args []any, fields map[string]services.FilterField) {
	values, err := url.ParseQuery(r.URL.RawQuery)
	if err != nil {
		services.Error(w, 400, "Parâmetros de consulta inválidos", nil, false)
		return
	}
	pagination, err := services.ParsePage(values, fields, len(args)+1)
	if err != nil {
		services.Error(w, 400, err.Error(), nil, false)
		return
	}
	page, err := services.ReadPage(r.Context(), db.DB, query, args, pagination, "page.id", scanStoreProduct)
	if err != nil {
		log.Printf("list products: %v", err)
		services.Error(w, 500, "Erro ao buscar produtos", nil, false)
		return
	}
	writeJSON(w, 200, page)
}

func scanStoreProduct(rows *sql.Rows) (models.Product, error) {
	var p models.Product
	var measurements, images []byte
	var createdAt, updatedAt sql.NullTime
	err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.CareInstructions, &measurements,
		&p.Price, &p.Quantity, &p.Status, &p.ProductTypeID, &p.CategoryName, &images,
		&p.BrandID, &createdAt, &updatedAt, &p.PromotionalPrice)
	if err != nil {
		return p, err
	}
	if err = json.Unmarshal(measurements, &p.Measurements); err != nil {
		return p, err
	}
	if err = json.Unmarshal(images, &p.ImagePaths); err != nil {
		return p, err
	}
	for i, path := range p.ImagePaths {
		p.ImagePaths[i] = strings.ReplaceAll(path, "\\", "/")
	}
	p.CreatedAt, p.UpdatedAt = createdAt.Time, updatedAt.Time
	p.Stock = p.Quantity
	return p, nil
}

func readStoreProducts(r *http.Request, id int64) ([]models.Product, error) {
	rows, err := db.DB.QueryContext(r.Context(), "SELECT "+storeProductColumns+",0 AS promotional_price"+storeProductSource+" WHERE p.id=$1", id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	products := []models.Product{}
	for rows.Next() {
		p, err := scanStoreProduct(rows)
		if err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, rows.Err()
}
