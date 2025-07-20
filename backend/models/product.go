package models

type Produto struct {
	ID           int      `json:"id"`
	Name         string   `json:"name"`
	Description  *string  `json:"description"`
	FullBed      *int     `json:"fullbed"`
	QueenBed     *int     `json:"queenbed"`
	SuperKingBed *int     `json:"superkingbed"`
	SingleBed    *int     `json:"singlebed"`
	Price        *float64  `json:"price"`
	Quantity     *int      `json:"quantity"`
	FirstImage   *string   `json:"firstimage"`
	SecondImage  *string   `json:"secondimage"`
	Status       *int      `json:"status"`
}
