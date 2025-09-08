"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../layout/Header";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react"; 

export default function Panier() {

  interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: string;
  unitPrice: string;
}
interface Client {
  id: string;
  email: string;
  username: string;
}
interface Commande {
  id: string;
  clientId: string;
  warehouseId: string;
  orderDate: string;
  totalAmount: string;
  status: string;
  deliveryOption: boolean;
  deliveryAddress: string | null;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  client: Client;
}
const [commande, setCommande] = useState<Commande | null>(null);

  useEffect(() => {
    async function fetchCommande() {
      try {
        const res = await fetch("/api/orders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Auth headers si nécessaire
          },
        });
        const data = await res.json();
        if (data.success) {
          setCommande(data.data.data[0]); // On prend la première commande
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la commande :", error);
      }
    }

    fetchCommande();
  }, []);
    //catégories des produits proposés 
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
    return(
        <>
        <Header />
{/*grid du panier*/}
    <div className="p-6">
            <Button
        asChild
        className="fixed top-40 left-4 z-50 rounded-full border-2 bg-white p-2 shadow hover:bg-gray-200 transition"
        size="icon"
      >
        <Link href="/">
          <Image
            src="/Arrow.svg"
            alt="Retour à la page précédente"
            width={32}
            height={32}
          />
        </Link>
      </Button>

      {/* Navigation catégories (inchangé) */}
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

      {/* Panier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        {/* Section gauche - Mon Panier */}
        <div className="border p-6 rounded-lg shadow-sm bg-green-300">
          <h2 className="text-lg font-semibold mb-4"> <ShoppingCart size={20} /> MON PANIER </h2>

          {commande ? (
            <>
         {commande.orderItems.map((item: OrderItem) => (
  <div key={item.id} className="mb-4">
    <p className="font-medium">Produit ID : {item.productId}</p>
    <p>Quantité : {item.quantity}</p>
    <p>Prix unitaire : {item.unitPrice} Fcfa</p>
    <p className="font-semibold">
      Total : {(parseFloat(item.unitPrice) * parseInt(item.quantity)).toFixed(2)} Fcfa
    </p>
  </div>
))}

              <hr className="my-4" />
              <p>Commande ID : <span className="font-mono">{commande.id}</span></p>
              <p className="text-right font-bold mt-2">
                SOUS-TOTAL : {parseFloat(commande.totalAmount).toFixed(2)} Fcfa
              </p>
            </>
          ) : (
            <p>Chargement du panier...</p>
          )}
        </div>

        {/* Section droite - Total et Livraison */}
        <div className="border p-6 rounded-lg shadow-sm bg-blue-500">
          <h2 className="text-lg font-semibold mb-4">TOTAL</h2>
          {commande ? (
            <>
              <p>Sous-total : <span className="font-bold">{parseFloat(commande.totalAmount).toFixed(2)} Fcfa</span></p>
              <p>Livraison : <span className="italic">-</span></p>
              <p className="mt-2 text-sm text-blue-600 underline cursor-pointer">Lieu de livraison sur Google Maps</p>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Options de livraison :</h3>
                <ul className="list-disc list-inside text-sm">
                  <li>Livraison standard à partir de 1000 Fcfa</li>
                  <li>Livraison territoriale à partir de 2000 Fcfa</li>
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Méthodes de paiement :</h3>
                <p className="text-sm">Méthode : {commande.paymentMethod}</p>
                <div className="flex gap-4 mt-2">
                  <Image src="/orange_money.svg" alt="Orange_Money" width={105} height={105} />
                  <Image src="/mtn-money.svg" alt="mtn_money" width={105} height={105} />
                  <Image src="/master_card.svg" alt="Mastercard" width={105} height={105} />
                  <Image src="/visa.svg" alt="VISA" width={105} height={105} />
                </div>
              </div>

              <button className="mt-8 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
                COMMANDER
              </button>
            </>
          ) : (
            <p>Chargement des détails...</p>
          )}
        </div>
      </div>
    </div>
        </>
    );
  }