import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import type { PosProduct } from '../types';

export function usePosMenu() {
    const [products, setProducts] = useState<PosProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient.get<any[]>('/products')
            .then(res => {
                const mapped: PosProduct[] = res.data.map(p => ({
                    id: p.id || p.Id,
                    name: p.name || p.Name,
                    price: parseFloat(p.price || p.Price || '0'),
                    isAvailable: p.isAvailable ?? p.IsAvailable ?? true
                }));
                setProducts(mapped);
            })
            .catch(() => console.error("Błąd Catalog API"))
            .finally(() => setIsLoading(false));
    }, []);

    return { products, isLoading };
}