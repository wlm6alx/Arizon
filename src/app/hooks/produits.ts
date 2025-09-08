import { useCrudHook } from "./crud-hook";

interface Produit {
    id: string;
    name: string;
    description: string | null;
    unit: string;
    imageUrl: string | null;
    categoryId: string | null;
    category?: {
        id: string;
        name: string;
    };
    _count?: {
        stocks: number;
        orderItems: number;
    };
}

export default function useProduits() { 
    return useCrudHook<Produit>('products', { cache: true });
}
