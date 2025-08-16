export interface Product {
  id?: number;                  // Opcional, pois só existe DEPOIS de criado no banco
  name: string;                 // Obrigatório no formulário
  description?: string;         // Opcional
  care_instructions?: string;   // Opcional
  measurements: { [key: string]: string }; // Obrigatório para o formulário funcionar
  price: number;                // Obrigatório
  quantity: number;             // Obrigatório
  brand_id?: number;            // Opcional, pode ser nulo
  product_type_id?: number;     // Opcional, pode ser nulo
  status: string;    
   image_paths?: string[];    
}
