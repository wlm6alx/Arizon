"use client";
import TrueFocus from "@/components/TrueFocus";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useEffect, useState, useCallback } from "react";
import Header from "../layout/Header";
import CartBubble from "../composant/card";
import { Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import useProduits from "../hooks/produits";

// ✅ Définition du type Product selon ton API
type Product = {
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
};


export default function ProductsList() {
  // const fetchRef = useRef<((page?: number) => void) | null>(null);
  const { getAllWithPagination } = useProduits();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>("tous");
  // ✅ Fonction pour récupérer les produits avec pagination

  const fetchProducts = useCallback(async (page: number = 1, categoryName : string | null) => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = { page: page.toString(), limit: '30' };
    if (categoryName && categoryName !== "tous") params.category = categoryName;
      const result = await getAllWithPagination(params);
      console.log("Data:", result);
      setProducts(result.data);
      setPagination(result.pagination);
      setCurrentPage(page);
    } catch (err) {
      console.error("Erreur API :", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [getAllWithPagination]);
/*
  useEffect(() => {
  fetchRef.current = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllWithPagination({ page: page.toString(), limit: '20' });
      console.log("Data:", result);
      setProducts(result.data);
      setPagination(result.pagination);
      setCurrentPage(page);
    } catch (err) {
      console.error("Erreur API :", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
}, [getAllWithPagination]);
*//*
useEffect(() => {
  if (fetchRef.current) {
    fetchRef.current(currentPage);
  }
}, [currentPage]);*/

useEffect(() => {
  fetchProducts(1, selectedCategory);
}, [selectedCategory]);


  // liste de catégories
  const categories = [
    { name: "Tous", icon: "/Allproducts.svg", categoryName: "Tous" },
    { name: "Céréales et grains", icon: "/CerealesEtGrain.svg", categoryName: "cereales" },
    { name: "Légumineuse", icon: "/Legumineuse.svg", categoryName: "legumineuse" },
    { name: "Fruits frais", icon: "/FruitsFrais.svg", categoryName: "fruits" },
    { name: "Légumes frais", icon: "/LegumesFrais.svg", categoryName: "legumes" },
    { name: "Racines et tubercules", icon: "/RacineEtTubercule.svg", categoryName: "racines" },
    { name: "Oléagineux", icon: "/Olaegineux.svg", categoryName: "oleagineux" },
    { name: "Épices et condiments", icon: "/EpicesEtCondiments.svg", categoryName: "epices" },
    { name: "Semences", icon: "/semences.svg", categoryName: "semences" },
    { name: "Produits laitiers", icon: "/ProduitsLaitier.svg", categoryName: "laitiers" },
  ];

  return (
    <>
      <Header />

      {/* Navigation catégories */}

      <div className="w-full mt-6">
  <div className="flex gap-4 overflow-x-auto px-2 sm:justify-center">
    {categories.map((cat) => (
      <button
        key={cat.name}
        onClick={() => {
          setSelectedCategory(cat.categoryName || "all");
          fetchProducts(1, cat.categoryName || null);
        }}
        className={`flex flex-col items-center min-w-[80px] px-2 py-1 cursor-pointer group focus:outline-none
          ${selectedCategory === (cat.categoryName || "all") ? "font-medium border-b-2 border-green-600 bg-green-50" : "text-gray-500 group-hover:text-black"}
        `}
      >
        <Image
          src={cat.icon}
          alt={cat.name}
          width={28}
          height={28}
          className="mb-1"
        />
        <span className="text-xs sm:text-sm">{cat.name}</span>
      </button>
    ))}
  </div>
</div>

      {/* Section Produits */}
      <div className="p-6">
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Button size="sm" disabled>
              <Loader2Icon className="animate-spin mr-2" />
              Chargement des produits...
            </Button>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur lors du chargement des produits</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => fetchProducts(currentPage, selectedCategory)}
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : products.length > 0 ? (
          /* Products Grid */
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tous les Produits</h2>
              <p className="text-gray-600 mt-1">{products.length} produits disponibles</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 p-4 border border-gray-100"
                >
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={300}
                      height={200}
                      className="rounded-lg object-cover w-full h-40 mb-3"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                    
                    {product.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                    )}
                    
                    {product.category && (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category.name}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-500">Unité: {product.unit}</span>
                      {product._count && (
                        <div className="flex space-x-2 text-xs text-gray-400">
                          <span>{product._count.stocks} stocks</span>
                          <span>•</span>
                          <span>{product._count.orderItems} commandes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-4">
                <button
                  onClick={() => fetchProducts(currentPage - 1, selectedCategory)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(pagination.pages - 4, currentPage - 2)) + i;
                    if (pageNum > pagination.pages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchProducts(pageNum, selectedCategory)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => fetchProducts(currentPage + 1, selectedCategory)}
                  disabled={currentPage >= pagination.pages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
              </div>
            )}
            
            {/* Pagination Info */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Page {pagination.page} sur {pagination.pages} • {pagination.total} produits au total
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="m-auto">
            <TrueFocus 
              sentence="Aucun produit disponible pour le moment !"
              manualMode={false}
              blurAmount={5}
              borderColor="green"
              animationDuration={2}
              pauseBetweenAnimations={1}
            />
          </div>
        )}

        {/* Bulle panier visible partout */}
    <Link href="/panier" className="hover:underline"><CartBubble /></Link>
        
      </div>
    </>
  );
}
