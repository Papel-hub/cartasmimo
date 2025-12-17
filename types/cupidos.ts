// types.ts
export interface Cupido {
  id: string;
  name: string;
  location: string;
  services: ('vendas' | 'entregas' | 'ambos')[];
  avatar?: string;
  whatsapp?: string;
}