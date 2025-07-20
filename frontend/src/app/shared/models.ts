export interface Produto {
  id: number;
  name: string;
  description: string | null;
  fullbed: number | null;
  queenbed: number | null;
  superkingbed: number | null;
  singlebed: number | null;
  price: number;
  quantity: number;
  firstimage: string | null;
  secondimage: string | null;
  status: number;
}