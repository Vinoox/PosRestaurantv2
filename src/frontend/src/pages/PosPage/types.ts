export type OrderStatus = 0 | 1 | 2 | 3;

export interface PosProduct {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
}

export interface PosOrder {
    id: string;
    orderNumber: string;
    tableNumber: number | null;
    status: OrderStatus;
    totalAmount: number;
    items: OrderItem[];
    createdAt: string;
}