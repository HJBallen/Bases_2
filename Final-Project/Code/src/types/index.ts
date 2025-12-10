export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  created_at: string;
  stock: number;
  id_vendor: number;
  features: string | null;
  id_category: number;
  category?: Category;
  multimedia?: Multimedia[];
}

export interface Multimedia {
  id: string;
  alt: string;
  src: string;
  id_product: string;
}

export interface User {
  id: number;
  name: string | null;
  lastname: string | null;
  cell: string | null;
  email: string | null;
  role_id: number | null;
}

export interface Role {
  id: number;
  name: string | null;
  description: string | null;
}

export interface Order {
  id: number;
  id_customer: number;
  id_payment: string;
  state: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  id_order: number;
  id_product: string;
  quantity: number;
  total_price: number;
  product?: Product;
}

export interface Payment {
  id: string;
  created_at: string;
  status: string | null;
  id_payment_method: number | null;
}

export interface PaymentMethod {
  id: number;
  name: string;
  description: string;
}

export interface Rating {
  id: number;
  id_customer: number | null;
  id_vendor: number | null;
  value: string | null;
  date: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
