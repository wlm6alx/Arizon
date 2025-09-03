import { NextRequest, NextResponse } from "next/server";
import { Sql } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";

export async function GET (req : NextRequest){

    const searchParams = new URL(req.url).searchParams;
    const SortBy = searchParams.get("sortBy") || "statut";

    const ValidParamètre = ["livré", "en attente", "en cours de livraison", "refusé", "tout"];
    if (!ValidParamètre.includes(SortBy.toLowerCase())) {
        return NextResponse.json({ error: "Paramètre de tri invalide" }, { status: 400 });
    }
}

const result = await prisma.commandes.findMany({
    
})