// components/Card.js

export default function Card() {
  return (
    <div className="max-w-md rounded overflow-hidden shadow-lg p-auto mx-auto bg-white border-black">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">D</span>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold">Dauphin Dongmo</h2>
        <button className="mt-2 text-gray-700 rounded-b-sm py-2 px-4 rounded hover:bg-gray-200  ">Vue de profil</button>
      </div>
      <div className="mt-4">
        <ul className="space-y-2">
          <li className="border-black">
            <button className="w-full text-center    text-gray-700 py-2 px-4 hover:bg-gray-200 rounded-b-xs">
              Mes commandes
            </button>
          </li>
          <li>
            <button className="w-full text-center text-gray-700 py-2 px-4 hover:bg-gray-200 rounded">
              Personnalisation
            </button>
          </li>
        </ul>
      </div>
      <div className="mt-4 text-center w-full">
        <button className="bg-red-600 text-white py-2 px-4 rounded">
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
