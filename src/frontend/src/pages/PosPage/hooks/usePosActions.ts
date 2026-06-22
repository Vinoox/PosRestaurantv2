import { useState } from 'react';
import { apiClient } from '../../../api/client';

export function usePosActions(onSuccess: () => void) {
    const [isProcessing, setIsProcessing] = useState(false);

    const assignTable = async (orderId: string, tableNumber: number) => {
        setIsProcessing(true);
        try {
            await apiClient.patch(`/fulfillment`, { orderId, tableNumber });
            onSuccess();
        } catch (error) {
            alert("Błąd przypisywania stolika. Sprawdź połączenie.");
        } finally {
            setIsProcessing(false);
        }
    };

    const payForOrder = async (orderId: string) => {
        setIsProcessing(true);
        try {
            await apiClient.put(`/orders/${orderId}/pay`);
            onSuccess();
        } catch (error) {
            alert("Błąd płatności. Spróbuj ponownie.");
        } finally {
            setIsProcessing(false);
        }
    };

    const completeOrder = async (orderId: string) => {
        setIsProcessing(true);
        try {
            await apiClient.post(`/orders/${orderId}/complete`);
            onSuccess();
        } catch (error) {
            alert("Błąd zamykania zamówienia.");
        } finally {
            setIsProcessing(false);
        }
    };

    const addProductToOrder = async (orderId: string, productId: string) => {
        setIsProcessing(true);
        try {
            // Zakładam istnienie endpointu do dorzucania elementów do otwartego zamówienia
            await apiClient.post(`/orders/${orderId}/items`, { productId, quantity: 1 });
            onSuccess();
        } catch (error) {
            alert("Nie udało się dodać produktu do zamówienia.");
        } finally {
            setIsProcessing(false);
        }
    };

    return { assignTable, payForOrder, completeOrder, addProductToOrder, isProcessing };
}