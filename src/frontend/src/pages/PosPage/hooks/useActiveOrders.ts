import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../api/client';
// DODANO: Import OrderStatus
import type { PosOrder, OrderStatus } from '../types'; 
import { ORDER_STATUS } from '../constants';

export function useActiveOrders(pollingIntervalMs: number = 5000) {
    const [orders, setOrders] = useState<PosOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async (abortController?: AbortController) => {
        try {
            const response = await apiClient.get<any[]>('/orders/active', {
                signal: abortController?.signal
            });
            
            const mappedOrders: PosOrder[] = response.data.map(o => {
                
                const rawStatus = o.status ?? o.Status;
                // NAPRAWA: Jawne typowanie zmiennej jako OrderStatus
                let normalizedStatus: OrderStatus = ORDER_STATUS.Open; 
                if (rawStatus === 'InPreparation' || rawStatus === 1) normalizedStatus = ORDER_STATUS.InPreparation;
                if (rawStatus === 'Paid' || rawStatus === 2) normalizedStatus = ORDER_STATUS.Completed;

                const rawFulfillment = o.fulfillmentType ?? o.FulfillmentType;
                let normalizedFulfillment = rawFulfillment;
                if (!rawFulfillment || rawFulfillment.toUpperCase() === 'DRAFT') {
                    normalizedFulfillment = 'Unassigned';
                }

                const rawTable = o.tableNumber ?? o.TableNumber;
                const isDraftTable = rawTable === 'Robocze (Sierota)';

                const shortId = (o.id || o.Id || '0000').substring(0, 5).toUpperCase();
                const fallbackOrderNumber = isDraftTable ? `NOWE-${shortId}` : `ZAM-${shortId}`;

                return {
                    id: o.id || o.Id,
                    orderNumber: o.orderNumber || o.OrderNumber || fallbackOrderNumber,
                    tableNumber: isDraftTable ? null : rawTable,
                    status: normalizedStatus,
                    totalAmount: o.totalAmount ?? o.TotalAmount ?? 0,
                    createdAt: o.createdAt || o.CreatedAt,
                    fulfillmentType: normalizedFulfillment,
                    items: (o.items || o.Items || []).map((i: any) => ({
                        id: i.id || i.Id,
                        productId: i.productId || i.ProductId,
                        productName: i.productName || i.ProductName || 'Nieznany',
                        unitPrice: i.unitPrice ?? i.UnitPrice ?? 0,
                        quantity: i.quantity ?? i.Quantity ?? 1
                    }))
                };
            });

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