import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";


export default function Historique() {

    return(
<>
        <Button asChild className="flex">
    <Link href={"/"}>
    <Image 
    src={"/Arrow.svg"} 
    alt="Retour à la page précédente"
    width={65}
    height={0}/>
    </Link>
        </Button>

    <div>
<h2 className="text-center ">HISTORIQUE DES COMMANDES</h2>
<p>Vous trouverez ici toutes les commandes en cours et réalisées depuis la création de votre compte</p>
</div>
<div className="flex items-center justify-center gap-2">
    <button className="bg-gray-400"> TOUT </button>
    <button className="bg-green-500 hover:bg-green-800"> LIVRE </button>
    <Button variant = "link"> EN ATTENTE </Button>
    <Button variant={"secondary"}> EN COURS DE LIVRAISON </Button>
<Button variant={"destructive"}> REFUSES </Button>
</div>

<div>
<table className="table-auto">
<thead>     
    <tr>
        <th>
            CommandID
        </th>
        <th>
            DATE
        </th>
        <th>
            MONTANT
        </th>
        <th>
            STATUT
        </th>
    </tr>
</thead>
<tbody>
    
    </tbody>    
</table>

</div>
        </> 
);}