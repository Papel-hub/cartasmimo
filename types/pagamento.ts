import { FieldValue } from 'firebase/firestore';

export type PaymentMethod = 'pix' | 'cartao' | 'boleto' | '';

export interface DeliveryData {
  email?: string;
  nome?: string;
  whatsapp?: string;
  destinatario?: string;
  selectedDate?: string | null;
  tipoEntrega?: string;
  endereco?: string | null;
  cpe?: string | null;
  digitalMethod?: string | null;
  fisicaMethod?: string | null;
}

export interface MensagemData {
  price?: number;
  format?: string;
  from?: string;
  to?: string;
  message?: string;
}

export interface PaymentResponseData {
  id?: string | number;
  qr_code?: string;
  qr_code_base64?: string;
  boleto_url?: string;
  status?: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: PaymentResponseData;
  error?: string;
}

export interface OrderSchema {
  pedidoId: string;
  origem: 'checkout' | 'whatsapp';
  status: string;
  cliente: {
    email: string;
    nome: string;
    whatsapp: string;
  };
  conteudo: {
    de: string;
    para: string;
    texto: string;
    formato_slug: string;
    data_entrega: string | null;
    audio_url: string | null;
    video_url: string | null;
  };
  logistica: {
    tipo: string;
    endereco: string | null;
    cpe: string | null;
    metodo_digital: string | null;
    metodo_fisico: string | null;
    whatsapp_entrega?: string | null;
    prazo_estimado?: string | null; 
  };
  financeiro: {
    total: number;
    metodo: string;
    payment_id: string | null;
    payment_status: string;
    valor_produto?: number;
    valor_frete?: number;
  };
  criado_em: FieldValue;
}