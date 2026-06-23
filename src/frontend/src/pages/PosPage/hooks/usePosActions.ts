import { useState } from 'react';
import { apiClient } from '../../../api/client';

export function usePosActions(onSuccess: () => void) {
    const [isProcessing, setIsProcessing] = useState(false);

    const createNewOrder = async (): Promise<string | null> => {
        setIsProcessing(true);
        try {
            const response = await apiClient.post(`/orders`, {});
            onSuccess();
            return response.data?.id || response.data?.Id || null;
        } catch (error) {
            alert("Błąd podczas tworzenia zamówienia.");
            return null;
        } finally {
            setIsProcessing(false);
        }
    };

    // NOWE: Usuwanie / Anulowanie całego zamówienia (ikona kosza)
    const cancelOrder = async (orderId: string) => {
        setIsProcessing(true);
        try {
            // Zakładamy endpoint do anulowania. Może to być też .delete(`/orders/${orderId}`)
            await apiClient.put(`/orders/${orderId}/cancel`); 
            onSuccess();
        } catch (error) {
            alert("Nie udało się usunąć zamówienia.");
        } finally {
            setIsProcessing(false);
        }
    };

    const addProductToOrder = async (orderId: string, productId: string) => {
        setIsProcessing(true);
        try {
            await apiClient.post(`/orders/${orderId}/items`, { productId, quantity: 1 });
            onSuccess();
        } catch (error) {
            alert("Nie udało się dodać produktu.");
        } finally {
            setIsProcessing(false);
        }
    };

    const updateItemQuantity = async (orderId: string, itemId: string, newQuantity: number) => {
        setIsProcessing(true);
        try {
            await apiClient.patch(`/orders/${orderId}/items/${itemId}`, { quantity: newQuantity });
            onSuccess();
        } catch (error) {
            console.error("Błąd aktualizacji ilości", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const removeItemFromOrder = async (orderId: string, itemId: string) => {
        setIsProcessing(true);
        try {
            await apiClient.delete(`/orders/${orderId}/items/${itemId}`);
            onSuccess();
        } catch (error) {
            alert("Nie udało się usunąć pozycji.");
        } finally {
            setIsProcessing(false);
        }
    };

    // ZAKTUALIZOWANE: Obsługa nowych pól dla dostawy i kurierów
    const updateFulfillment = async (orderId: string, payload: any) => {
        setIsProcessing(true);
        try {
            await apiClient.patch(`/fulfillment`, { orderId, ...payload });
            onSuccess();
        } catch (error) {
            alert("Błąd zapisu danych realizacji.");
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
            alert("Błąd zamykania rachunku.");
        } finally {
            setIsProcessing(false);
        }
    };

    return { 
        createNewOrder, 
        cancelOrder, 
        addProductToOrder, 
        updateItemQuantity, 
        removeItemFromOrder, 
        updateFulfillment, 
        completeOrder, 
        isProcessing 
    };
}