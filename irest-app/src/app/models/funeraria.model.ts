export interface Funeraria {
  id: number;
  nome: string;
  email?: string;
  descricao: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
  telefone?: string;
  endereco?: string;
  horario?: string;
  reviews: any[];
  servicos: any[];
  favoritos: any[];
}
