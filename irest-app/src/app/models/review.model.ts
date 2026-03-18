export interface Review {
  id: number;
  nota: number;
  comentario: string;
  dataAvaliacao: string;
  usuarioId: number;
  usuarioNome: string;
  funerariaId: number;
  adminId?: number;
  adminNome?: string;
}
