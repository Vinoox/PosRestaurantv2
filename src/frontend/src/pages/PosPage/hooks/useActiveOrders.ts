import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../api/client';
import type { PosOrder } from '../types';

export function useActiveOrders(pollingIntervalMs: number = 5000) {
    const [orders, setOrders] = useState<PosOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async (abortController?: AbortController) => {
        try {
            const response = await apiClient.get<any[]>('/orders/active', {
                signal: abortController?.signal
            });
            
            const mappedOrders: PosOrder[] = response.data.map(o => ({
                id: o.id || o.Id,
                orderNumber: o.orderNumber || o.OrderNumber || '---',
                tableNumber: o.tableNumber || o.TableNumber || null,
                status: o.status ?? o.Status,
                totalAmount: o.totalAmount || o.TotalAmount || 0,
                createdAt: o.createdAt || o.CreatedAt,
                items: (o.items || o.Items || []).map((i: any) => ({
                    id: i.id || i.Id,
                    productId: i.productId || i.ProductId,
                    productName: i.productName || i.ProductName || 'Nieznany',
                    unitPrice: i.unitPrice || i.UnitPrice || 0,
                    quantity: i.quantity || i.Quantity || 1
                }))
            }));

            setOrders(mappedOrders);
            setError(null);
        } catch (err: any) {
            if (err.name !== 'CanceledError') {
                setError('Problem z synchronizacją tablicy zamówień.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        fetchOrders(controller);

        const intervalId = setInterval(() => {
            fetchOrders(); 
        }, pollingIntervalMs);

        return () => {
            controller.abort();
            clearInterval(intervalId);
        };
    }, [fetchOrders, pollingIntervalMs]);

    return { orders, isLoading, error, refreshNow: fetchOrders };
}