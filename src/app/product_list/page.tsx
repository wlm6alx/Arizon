"use client";

import TrueFocus from "@/components/TrueFocus";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "../layout/Header";
import CartBubble from "../composant/card";
import { Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"

// ✅ Définition du type Product selon ton API
type Product = {
  id: string;
  name: string;
  description: string;
  unit: string;
  imageUrl: string;
  category: {
    id: string;
    name: string;
  };
  _count: {
    stocks: number;
    orderItems: number;
  };
};

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fonction pour récupérer les produits
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();

      console.log("API response:", data);

      // ⚡ Corrigé : on cible directement le tableau products
      if (data?.data?.products) {
        setProducts(data.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Erreur API :", error);
      setProducts([]); // fallback si erreur
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Exemple de liste de catégories
  const categories = [
    { name: "Céréales et grains", icon: "/CerealesEtGrain.svg", href: "/categories/cereales", active: true },
    { name: "Légumineuse", icon: "/Legumineuse.svg", href: "/categories/legumineuse" },
    { name: "Fruits frais", icon: "/FruitsFrais.svg", href: "/categories/fruits" },
    { name: "Légumes frais", icon: "/LegumesFrais.svg", href: "/categories/legumes" },
    { name: "Racines et tubercules", icon: "/RacineEtTubercule.svg", href: "/categories/racines" },
    { name: "Oléagineux", icon: "/Olaegineux.svg", href: "/categories/oleagineux" },
    { name: "Épices et condiments", icon: "/EpicesEtCondiments.svg", href: "/categories/epices" },
    { name: "Semences", icon: "/semences.svg", href: "/categories/semences" },
    { name: "Produits laitiers", icon: "/ProduitsLaitier.svg", href: "/categories/laitiers" },
  ];

  return (
    <>
      <Header />

      {/* Navigation catégories */}
      <div className="flex items-center justify-center w-full mt-6">
        <div className="flex gap-10">
          {categories.map((cat) => (
            <Link key={cat.name} href={cat.href}>
              <div className="flex flex-col items-center cursor-pointer group">
                <Image
                  src={cat.icon}
                  alt={cat.name}
                  width={28}
                  height={28}
                  className="mb-1"
                />
                <span
                  className={`text-sm ${
                    cat.active
                      ? "font-medium border-b-2 border-black"
                      : "text-gray-500 group-hover:text-black"
                  }`}
                >
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Section Produits */}
      <div className="p-6">
        {loading ? (
          <p className="text-center">
            <Button size="sm" disabled>
               <Loader2Icon className="animate-spin" />
      Please wait
             </Button>
    </p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition p-2"
              >
                <Image
                  src={product.imageUrl || "/fallback.jpg"} // ✅ fallback si vide
                  alt={product.name}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover w-full h-40"
                />

                <div className="mt-2">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-gray-500 text-sm">{product.description}</p>
                  <p className="text-gray-400 text-xs">
                    stocks {product._count.stocks}
                  </p>

                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold">{product.unit}</span>
                    <span className="text-yellow-500 text-sm">
                      ★ {product.category.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className = "m-auto">
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
