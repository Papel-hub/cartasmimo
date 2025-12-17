export interface CartItemBase {
  id: string;
  title: string;
  price: number;
  quantity?: number;
  image?: string | string[];
  from?: string;
  to?: string;
  message?: string;
  anonymous?: boolean;
}
