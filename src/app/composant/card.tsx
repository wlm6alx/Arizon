// components/CartBubble.jsx
import { ShoppingCart } from "lucide-react"; // icône sympa

export default function CartBubble() {
  return (
    <button className="fixed bottom-5 right-5 bg-green-600 text-white rounded-full shadow-lg p-4 hover:bg-green-700 transition flex items-center gap-2">
      <ShoppingCart size={20} />
      <span className="hidden md:block">Accéder au panier</span>
    </button>
  );
}
