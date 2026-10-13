export type Book = {
  id: string; sku: string; slug: string; title: string; coverUrl: string | null;
  priceVnd: number; salePriceVnd: number | null; stock: number; status: string;
  category: { name: string; slug: string };
};
export type BookDetail = Book & { isbn: string | null; description: string | null; bookAuthors: { author: { name: string } }[] };
export type BookPage = { items: Book[]; meta: { page: number; limit: number; total: number; totalPages: number } };
export type Category = { id: string; name: string; slug: string };
export type BookListQuery = { page?: number; limit?: number; q?: string; category?: string; sort?: 'newest' | 'price_asc' | 'price_desc' };
export type CurrentUser = { id: string; email: string; fullName: string | null; role: 'CUSTOMER' | 'ADMIN' };
export type CartItem = { book: Book; quantity: number; unitPriceVnd: number; lineTotalVnd: number };
export type Cart = { items: CartItem[]; estimatedSubtotalVnd: number };
export type Wishlist = { items: Book[] };
export type Address = { id: string; recipientName: string; phone: string; line1: string; ward: string | null; district: string | null; city: string; isDefault: boolean };
export type AddressInput = Omit<Address, 'id'>;
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKING' | 'SHIPPING' | 'DELIVERED' | 'CANCELED';
export type DeliverySnapshot = Omit<Address, 'id' | 'isDefault'>;
export type OrderItem = { bookId: string; skuSnapshot: string; titleSnapshot: string; unitPriceVnd: number; quantity: number; lineTotalVnd: number };
export type Order = { id: string; orderCode: string; status: OrderStatus; paymentMethod: 'COD'; paymentStatus: 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'; subtotalVnd: number; shippingFeeVnd: number; totalVnd: number; addressSnapshot: DeliverySnapshot; note: string | null; createdAt: string; items: OrderItem[] };
export type AdminDashboard = {
  metrics: { totalBooks: number; publishedBooks: number; lowStockBooks: number; totalOrders: number; pendingOrders: number; deliveredRevenueVnd: number };
  orderStatus: Record<OrderStatus, number>;
  recentOrders: { id: string; orderCode: string; status: OrderStatus; totalVnd: number; createdAt: string; customerName: string; itemCount: number }[];
};
