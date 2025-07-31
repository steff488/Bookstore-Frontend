export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  bookId: number;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id: number;
  userId: number;
  totalPrice: number;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
}
