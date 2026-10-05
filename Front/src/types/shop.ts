export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

export interface ProductPage {
  data: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  total: number;
  currency: 'COP';
  points: number;
  pointsGranted?: number;
}
