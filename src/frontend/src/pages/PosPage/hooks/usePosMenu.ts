import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import type { PosProduct, PosCategory } from '../types';

export function usePosMenu() {
    const [products, setProducts] = useState<PosProduct[]>([]);
    const [categories, setCategories] = useState<PosCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiClient.get<any[]>('/products'),
            apiClient.get<any[]>('/categories')
        ])
        .then(([productsRes, categoriesRes]) => {
            const mappedCategories: PosCategory[] = categoriesRes.data.map(c => ({
                id: c.id || c.Id,
                name: c.name || c.Name
            }));
            
            const mappedProducts: PosProduct[] = productsRes.data.map(p => ({
                id: p.id || p.Id,
                name: p.name || p.Name,
                price: parseFloat(p.price || p.Price || '0'),
                isAvailable: p.isAvailable ?? p.IsAvailable ?? true,
                categoryId: p.categoryId || p.CategoryId // Zgodnie z DTO
            }));

            setCategories(mappedCategories);
            setProducts(mappedProducts);
        })
        .catch(err => console.error("Błąd pobierania danych katalogu:", err))
        .finally(() => setIsLoading(false));
    }, []);

    return { products, categories, isLoading };
}