export interface CustomizationOption {
  category: string;
  options: string[];
  pricePerItem: number;
}

export interface Cesta {
  id: string;
  title: string;
  price: number; // preço base (da "cesta")
  rating: number;
  reviewCount: number;
  description: string;
  video?: string;
  image: string[]; // agora é array!
  items: string[];
  nutritionalInfo: {
    calories: string;
    origin: string;
    certification: string;
  };
  // ✅ Novo campo:
  formatOptions?: {
    cesta?: number;
    maleta?: number;
    bandeja?: number;
    caixa?: number;
  };
  customizationOptions?: CustomizationOption[];
  mediaPersonalizationFee?: number;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
}
