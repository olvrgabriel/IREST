export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  dataCadastro: string;
  reviews: any[];
  favoritos: any[];
  sessoes: any[];
}
