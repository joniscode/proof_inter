export interface Product {
  id: number;
  name: string;
  /** Pesos colombianos enteros. */
  price: number;
  category: string;
  image: string;
  stock: number;
}

export interface User {
  id: number;
  name: string;
  points: number;
}
