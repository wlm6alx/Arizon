"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "../layout/Header";
import CartBubble from "../composant/card";

export default function ProductsList() {

 const [products, setProducts] = useState([]);

  // Récupération API
  const fetchProducts = async () => {
    try {
      const res = await fetch("https://api.monsite.com/products"); // 🔥 Mets ton API ici
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Erreur API :", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
    
  // Exemple de liste de catégories
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
       <div className="p-6">
      {/* Grid de produits 
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-2"
          >
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={200}
              className="rounded-lg object-cover w-full h-40"
            />

            <div className="mt-2">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-gray-500 text-sm">{product.vendor}</p>
              <p className="text-gray-400 text-xs">{product.available}</p>

              <div className="flex items-center justify-between mt-1">
                <span className="font-bold">{product.price} {product.unit}</span>
                <span className="text-yellow-500 text-sm">
                  ★ {product.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>*/}

      {/* Bulle panier visible partout */}
      <CartBubble />
    </div>
    </>
  );
}
