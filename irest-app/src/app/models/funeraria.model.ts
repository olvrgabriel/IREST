export interface Funeraria {
  id: number;
  nome: string;
  descricao?: string | null;
  cidade: string;
  estado?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  telefone?: string | null;
  endereco?: string | null;
  horario?: string | null;
  reviews: any[];
  servicos: any[];
  favoritos: any[];
}
