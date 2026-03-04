import { useState, useEffect } from 'react';
import API_URL from '../config';

export interface DynamicProduct {
    _id: string;
    name: string;
    price: number;
    imgUrl: string;
    category: string;
}

// Stable cache so pages don't each fire a separate fetch
let cache: DynamicProduct[] | null = null;
let inflightPromise: Promise<DynamicProduct[]> | null = null;

async function fetchFromServer(): Promise<DynamicProduct[]> {
    if (cache) return cache;
    if (!inflightPromise) {
        inflightPromise = fetch(`${API_URL}/api/products/dynamic`)
            .then(r => r.json())
            .then((data: DynamicProduct[]) => {
                cache = Array.isArray(data) ? data : [];
                inflightPromise = null;
                return cache;
            })
            .catch(() => {
                inflightPromise = null;
                return [];
            });
    }
    return inflightPromise;
}

/** Invalidate cache after admin adds/removes a product */
export function invalidateDynamicProductsCache() {
    cache = null;
}

/** Returns all admin-added products, optionally filtered by category */
export function useDynamicProducts(category?: string) {
    const [products, setProducts] = useState<DynamicProduct[]>(cache ?? []);
    const [loading, setLoading] = useState(cache === null);

    useEffect(() => {
        let alive = true;
        fetchFromServer().then(data => {
            if (alive) {
                setProducts(category ? data.filter(p => p.category === category) : data);
                setLoading(false);
            }
        });
        return () => { alive = false; };
    }, [category]);

    return { products, loading };
}
