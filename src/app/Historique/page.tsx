"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type Command = {
  CommandIB: string;
  Date: Date;
  Montant: number;
  statut: string;
};

export default function Historique() {
  const [Produit, setProduits] = useState<Command[]>([]);

  return (
    <>
      {/* Bouton retour */}
      <Button
        asChild
        className="fixed top-4 left-4 z-50 rounded-full border-2 bg-white p-2 shadow hover:bg-gray-200 transition"
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

      <div className="container mx-auto px-4 py-8">
        {/* Titre et description */}
        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-center text-2xl sm:text-3xl font-bold text-green-900">
            HISTORIQUE DES COMMANDES
          </h1>
          <p className="mt-4 text-center text-gray-600 max-w-xl">
            Vous trouverez ici toutes les commandes en cours et réalisées depuis la
            création de votre compte.
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <Button
            variant="secondary"
            className="bg-[#54FE12] hover:bg-green-800 text-xs sm:text-sm"
          >
            LIVRER
          </Button>
          <Button
            variant="secondary"
            className="bg-[#D1D7B6] hover:bg-green-800 text-xs sm:text-sm"
          >
            EN ATTENTE
          </Button>
          <Button
            variant="secondary"
            className="hover:bg-amber-300 text-xs sm:text-sm"
          >
            EN COURS DE LIVRAISON
          </Button>
          <Button
            variant="destructive"
            className="hover:bg-red-800 text-xs sm:text-sm"
          >
            REFUSÉES
          </Button>
        </div>

        {/* Table responsive */}
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white border border-gray-200 text-xs sm:text-sm">
            <thead className="bg-green-100">
              <tr>
                <th className="px-4 py-2 border-b text-green-900">CommandID</th>
                <th className="px-4 py-2 border-b text-green-900">DATE</th>
                <th className="px-4 py-2 border-b text-green-900">MONTANT</th>
                <th className="px-4 py-2 border-b text-green-900">STATUT</th>
              </tr>
            </thead>
            <tbody>
              {/* Exemple de ligne, à remplacer par un .map sur Produit */}
              <tr className="hover:bg-green-50 transition text-center">
                <td className="px-4 py-2 border-b">Bonjour</td>
                <td className="px-4 py-2 border-b">-</td>
                <td className="px-4 py-2 border-b">-</td>
                <td className="px-4 py-2 border-b">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}