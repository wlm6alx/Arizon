import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding des donnees agricoles camerounaises...');
  try {
    // Verifier si des donnees existent deja
    const existingCategories = await prisma.productCategory.count();
    if (existingCategories > 0) {
      console.log(`Des donnees existent deja (${existingCategories} categories).`);
      console.log('Pour reinitialiser, supprimez d\'abord les donnees existantes.');
      return;
    }

    // 1. Creer des categories de produits
    console.log('Creation des categories de produits...');
    const categories = await Promise.all([
      prisma.productCategory.create({
        data: {
          name: 'Cereales et Grains',
          description: 'Mais, riz, mil, sorgho et autres cereales consommees au Cameroun'
        }
      }),
      prisma.productCategory.create({
        data: {
          name: 'Tubercules et Racines',
          description: 'Manioc, igname, macabo, patates douces, pommes de terre'
        }
      }),
      prisma.productCategory.create({
        data: {
          name: 'Legumineuses et Pois',
          description: 'Arachides, haricots, soja, niebe et autres legumineuses'
        }
      }),
      prisma.productCategory.create({
        data: {
          name: 'Legumes',
          description: 'Okok, eru, njama njama, tomates, piments, gombos, morelles'
        }
      }),
      prisma.productCategory.create({
        data: {
          name: 'Bananes et Plantains',
          description: 'Plantains murs et verts, bananes sucrees et de cuisson'
        }
      }),
      prisma.productCategory.create({
        data: {
          name: 'Epices et Condiments',
          description: 'Njansang, rondelle, poivre de Penja, ail, gingembre, basilic'
        }
      }),
      prisma.productCategory.create({
        data: {
          name: 'Fruits',
          description: 'Mangues, papayes, goyaves, ananas, oranges, avocats, pasteques'
        }
      }),
      prisma.productCategory.create({
        data: {
          name: 'Plantes Oleagineuses',
          description: 'Palmier a huile, arachide, sesame, coco, soja'
        }
      }),
      prisma.productCategory.create({
        data: {
          name: 'Plantes Medicinales et Aromatiques',
          description: 'Moringa, citronnelle, aloe vera, bitter kola, neem'
        }
      }),
      prisma.productCategory.create({
        data: {
          name: 'Cultures de Rente',
          description: 'Cacao, cafe, the, canne a sucre, noix de kola'
        }
      })
    ]);
    console.log(`${categories.length} categories creees`);

    // 2. Creer des entrepots
    console.log('Creation des entrepots...');
    const warehouses = await Promise.all([
      prisma.warehouse.create({
        data: {
          name: 'Entrepot Central - Yaounde',
          address: '123 Avenue Kennedy, Yaounde, Cameroun'
        }
      }),
      prisma.warehouse.create({
        data: {
          name: 'Entrepot Economique - Douala',
          address: '456 Boulevard de l\'Independance, Douala, Cameroun'
        }
      }),
      prisma.warehouse.create({
        data: {
          name: 'Entrepot Nord - Garoua',
          address: '789 Avenue du Marche, Garoua, Cameroun'
        }
      }),
      prisma.warehouse.create({
        data: {
          name: 'Entrepot Ouest - Bafoussam',
          address: '321 Rue du Commerce, Bafoussam, Cameroun'
        }
      }),
      prisma.warehouse.create({
        data: {
          name: 'Entrepot Est - Bertoua',
          address: '654 Avenue Centrale, Bertoua, Cameroun'
        }
      })
    ]);
    console.log(`${warehouses.length} entrepots crees`);

    // 3. Creer des produits (150 produits au total)
    console.log('Creation des produits...');
    
    // Céréales et Grains
    const cerealesGrains = [
      { name: 'Riz Local', description: 'Riz cultive localement au Cameroun', unit: 'kg', price: 2.50,
         imageUrl: 'https://cdn.pixabay.com/photo/2018/06/29/13/01/rice-3505977_1280.jpg' },
      { name: 'Mais Blanc', description: 'Mais blanc frais du marche local', unit: 'kg', price: 1.80, 
        imageUrl: 'https://cdn.pixabay.com/photo/2020/09/04/23/20/vegetables-5545166_1280.jpg' },
      { name: 'Mais Jaune', description: 'Mais jaune pour la consommation', unit: 'kg', price: 1.90, 
        imageUrl: 'https://cdn.pixabay.com/photo/2017/08/28/22/06/corn-2691456_1280.jpg' },
      { name: 'Mil', description: 'Mil traditionnel camerounais', unit: 'kg', price: 2.20,
         imageUrl: 'https://cdn.pixabay.com/photo/2021/01/11/20/06/quinoa-5909557_1280.jpg' },
      { name: 'Sorgho', description: 'Sorgho rouge local', unit: 'kg', price: 2.00, 
        imageUrl: 'https://cdn.pixabay.com/photo/2018/08/28/08/49/millet-3636924_1280.jpg' },
      { name: 'Fonio', description: 'Fonio traditionnel d\'Afrique de l\'Ouest', unit: 'kg', price: 3.50, 
        imageUrl: 'https://thaka.bing.com/th/id/OIP.Cf2T1JS9z-fwy3m0KcXpSAHaE8?w=261&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3' },
      { name: 'Avoine', description: 'Avoine importee de qualite', unit: 'kg', price: 4.20, 
        imageUrl: 'https://cdn.pixabay.com/photo/2015/07/17/10/12/naked-oats-848959_1280.jpg' },
      { name: 'Orge', description: 'Orge pour la biere locale', unit: 'kg', price: 3.80, 
        imageUrl: 'https://thaka.bing.com/th/id/OIP.tkMkBW52nka19EVRxldZUAHaE8?w=273&h=183&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3' },
      { name: 'Ble Dur', description: 'Ble dur pour la fabrication de pates', unit: 'kg', price: 3.20, 
        imageUrl: 'https://cdn.pixabay.com/photo/2025/06/23/17/50/wheat-9676363_1280.jpg' },
      { name: 'Quinoa', description: 'Quinoa bio importee', unit: 'kg', price: 8.50, 
        imageUrl: 'https://cdn.pixabay.com/photo/2021/06/16/14/31/quinoa-6341424_1280.jpg' },
      { name: 'Sarrasin', description: 'Sarrasin sans gluten', unit: 'kg', price: 6.80, 
        imageUrl: 'https://cdn.pixabay.com/photo/2018/06/16/10/00/buckwheat-3478557_1280.jpg' },
      { name: 'Amarante', description: 'Amarante riche en proteines', unit: 'kg', price: 5.50,
         imageUrl: 'https://proteines-vegetales.fr/wp-content/uploads/2019/03/amarante.jpg' },
      { name: 'Teff', description: 'Teff ethiopien traditionnel', unit: 'kg', price: 7.20,
         imageUrl: 'https://thaka.bing.com/th/id/OIP.ngfGCxy57yAMmhxF1RXUZAHaEn?w=252&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3' },
      { name: 'Epeautre', description: 'Epeautre ancien et nutritif', unit: 'kg', price: 4.80,
         imageUrl: 'https://thaka.bing.com/th/id/OIP.xHNK8iqOMxG4FtBXCXwAlQHaE7?w=244&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3' },
      { name: 'Seigle', description: 'Seigle pour pain traditionnel', unit: 'kg', price: 3.60,
         imageUrl: 'https://www.passionpatisserie.fr/wp-content/uploads/2020/10/seigle-2-2048x1357.webp' }
    ];

    // Tubercules et Racines
    const tuberculesRacines = [
      { name: 'Manioc Frais', description: 'Manioc frais du marche local', unit: 'kg', price: 1.20, imageUrl: '' },
      { name: 'Manioc Seche', description: 'Manioc seche pour la conservation', unit: 'kg', price: 2.80, imageUrl: '' },
      { name: 'Igname Blanche', description: 'Igname blanche traditionnelle', unit: 'kg', price: 1.50, imageUrl: '' },
      { name: 'Igname Jaune', description: 'Igname jaune sucre', unit: 'kg', price: 1.80, imageUrl: '' },
      { name: 'Macabo', description: 'Macabo local du Cameroun', unit: 'kg', price: 1.30, imageUrl: '' },
      { name: 'Patate Douce Blanche', description: 'Patate douce blanche', unit: 'kg', price: 1.60, imageUrl: '' },
      { name: 'Patate Douce Orange', description: 'Patate douce orange riche en beta-carotene', unit: 'kg', price: 1.70, imageUrl: '' },
      { name: 'Pomme de Terre', description: 'Pommes de terre locales', unit: 'kg', price: 2.20, imageUrl: '' },
      { name: 'Taro', description: 'Taro traditionnel africain', unit: 'kg', price: 2.50, imageUrl: '' },
      { name: 'Colocase', description: 'Colocase comestible', unit: 'kg', price: 2.00, imageUrl: '' },
      { name: 'Yam de Chine', description: 'Yam de Chine importe', unit: 'kg', price: 3.20, imageUrl: '' },
      { name: 'Arrow-root', description: 'Arrow-root pour epaississant', unit: 'kg', price: 4.50, imageUrl: '' },
      { name: 'Crosne', description: 'Crosne du Japon', unit: 'kg', price: 6.80, imageUrl: '' },
      { name: 'Topinambour', description: 'Topinambour local', unit: 'kg', price: 3.50, imageUrl: '' },
      { name: 'Rutabaga', description: 'Rutabaga du marche', unit: 'kg', price: 2.80, imageUrl: '' }
    ];

    // Légumineuses et Pois
    const legumineusesPois = [
      { name: 'Arachides Fraiches', description: 'Arachides fraiches du marche', unit: 'kg', price: 3.50, imageUrl: '' },
      { name: 'Arachides Grillees', description: 'Arachides grillees et salees', unit: 'kg', price: 4.20, imageUrl: '' },
      { name: 'Haricots Rouges', description: 'Haricots rouges traditionnels', unit: 'kg', price: 2.80, imageUrl: '' },
      { name: 'Haricots Blancs', description: 'Haricots blancs locaux', unit: 'kg', price: 2.60, imageUrl: '' },
      { name: 'Haricots Noirs', description: 'Haricots noirs du Cameroun', unit: 'kg', price: 2.90, imageUrl: '' },
      { name: 'Soja Local', description: 'Soja cultive localement', unit: 'kg', price: 3.80, imageUrl: '' },
      { name: 'Niebe', description: 'Niebe traditionnel africain', unit: 'kg', price: 2.40, imageUrl: '' },
      { name: 'Pois Chiches', description: 'Pois chiches importes', unit: 'kg', price: 4.50, imageUrl: '' },
      { name: 'Lentilles Rouges', description: 'Lentilles rouges du marche', unit: 'kg', price: 3.20, imageUrl: '' },
      { name: 'Lentilles Vertes', description: 'Lentilles vertes locales', unit: 'kg', price: 3.40, imageUrl: '' },
      { name: 'Pois Casses', description: 'Pois casses pour soupes', unit: 'kg', price: 2.70, imageUrl: '' },
      { name: 'Feves', description: 'Feves fraiches du jardin', unit: 'kg', price: 3.60, imageUrl: '' },
      { name: 'Pois Mange-Tout', description: 'Pois mange-tout frais', unit: 'kg', price: 4.80, imageUrl: '' },
      { name: 'Lupins', description: 'Lupins pour l\'alimentation animale', unit: 'kg', price: 2.20, imageUrl: '' },
      { name: 'Vetches', description: 'Vetches pour la rotation des cultures', unit: 'kg', price: 2.10, imageUrl: '' }
    ];

    // Légumes
    const legumes = [
      { name: 'Okok', description: 'Okok traditionnel camerounais', unit: 'kg', price: 5.50, imageUrl: '' },
      { name: 'Eru', description: 'Eru sauvage du marche', unit: 'kg', price: 6.20, imageUrl: '' },
      { name: 'Njama Njama', description: 'Njama njama local', unit: 'kg', price: 4.80, imageUrl: '' },
      { name: 'Tomates Locales', description: 'Tomates fraiches du jardin', unit: 'kg', price: 2.50, imageUrl: '' },
      { name: 'Piments Rouges', description: 'Piments rouges piquants', unit: 'kg', price: 3.80, imageUrl: '' },
      { name: 'Piments Verts', description: 'Piments verts frais', unit: 'kg', price: 3.20, imageUrl: '' },
      { name: 'Gombos', description: 'Gombos traditionnels', unit: 'kg', price: 2.80, imageUrl: '' },
      { name: 'Morelles', description: 'Morelles du marche local', unit: 'kg', price: 3.50, imageUrl: '' },
      { name: 'Aubergines Locales', description: 'Aubergines traditionnelles', unit: 'kg', price: 2.40, imageUrl: '' },
      { name: 'Carottes', description: 'Carottes fraiches du jardin', unit: 'kg', price: 2.20, imageUrl: '' },
      { name: 'Oignons Locaux', description: 'Oignons du marche', unit: 'kg', price: 1.80, imageUrl: '' },
      { name: 'Ail Local', description: 'Ail frais du jardin', unit: 'kg', price: 4.20, imageUrl: '' },
      { name: 'Poivrons Verts', description: 'Poivrons verts frais', unit: 'kg', price: 3.60, imageUrl: '' },
      { name: 'Poivrons Rouges', description: 'Poivrons rouges murs', unit: 'kg', price: 4.00, imageUrl: '' },
      { name: 'Concombres', description: 'Concombres frais du jardin', unit: 'kg', price: 2.60, imageUrl: '' }
    ];

    // Bananes et Plantains
    const bananesPlantains = [
      { name: 'Plantains Verts', description: 'Plantains verts pour cuisson', unit: 'kg', price: 1.50, imageUrl: '' },
      { name: 'Plantains Murs', description: 'Plantains murs pour consommation', unit: 'kg', price: 2.20, imageUrl: '' },
      { name: 'Bananes Sucrees', description: 'Bananes sucrees fraiches', unit: 'kg', price: 2.80, imageUrl: '' },
      { name: 'Bananes de Cuisson', description: 'Bananes pour preparation culinaire', unit: 'kg', price: 2.00, imageUrl: '' },
      { name: 'Bananes Dessert', description: 'Bananes dessert de qualite', unit: 'kg', price: 3.20, imageUrl: '' },
      { name: 'Bananes Plantains', description: 'Bananes plantains traditionnelles', unit: 'kg', price: 1.80, imageUrl: '' },
      { name: 'Bananes Rouges', description: 'Bananes rouges exotiques', unit: 'kg', price: 4.50, imageUrl: '' },
      { name: 'Bananes Naines', description: 'Bananes naines sucrees', unit: 'kg', price: 3.80, imageUrl: '' },
      { name: 'Bananes Cavendish', description: 'Bananes Cavendish importees', unit: 'kg', price: 3.50, imageUrl: '' },
      { name: 'Bananes Bio', description: 'Bananes biologiques', unit: 'kg', price: 4.80, imageUrl: '' },
      { name: 'Plantains Cuits', description: 'Plantains precuits', unit: 'kg', price: 2.80, imageUrl: '' },
      { name: 'Bananes Sechees', description: 'Bananes sechees pour conservation', unit: 'kg', price: 5.20, imageUrl: '' },
      { name: 'Farine de Plantain', description: 'Farine de plantain traditionnelle', unit: 'kg', price: 3.60, imageUrl: '' },
      { name: 'Chips de Plantain', description: 'Chips de plantain croustillantes', unit: 'kg', price: 6.50, imageUrl: '' },
      { name: 'Bananes Baby', description: 'Petites bananes pour enfants', unit: 'kg', price: 4.20, imageUrl: '' }
    ];

    // Épices et Condiments
    const epicesCondiments = [
      { name: 'Njansang', description: 'Njansang traditionnel camerounais', unit: 'kg', price: 8.50, imageUrl: '' },
      { name: 'Rondelle', description: 'Rondelle pour assaisonnement', unit: 'kg', price: 6.80, imageUrl: '' },
      { name: 'Poivre de Penja', description: 'Poivre blanc de Penja', unit: 'kg', price: 12.50, imageUrl: '' },
      { name: 'Ail Local', description: 'Ail frais du marche', unit: 'kg', price: 4.20, imageUrl: '' },
      { name: 'Gingembre Frais', description: 'Gingembre frais local', unit: 'kg', price: 3.80, imageUrl: '' },
      { name: 'Basilic Local', description: 'Basilic frais du jardin', unit: 'kg', price: 2.50, imageUrl: '' },
      { name: 'Curry Local', description: 'Melange curry traditionnel', unit: 'kg', price: 5.60, imageUrl: '' },
      { name: 'Paprika', description: 'Paprika pour coloration', unit: 'kg', price: 4.80, imageUrl: '' },
      { name: 'Cannelle', description: 'Cannelle en batons', unit: 'kg', price: 7.20, imageUrl: '' },
      { name: 'Muscade', description: 'Noix de muscade entieres', unit: 'kg', price: 9.50, imageUrl: '' },
      { name: 'Cardamome', description: 'Cardamome verte', unit: 'kg', price: 8.80, imageUrl: '' },
      { name: 'Cumin', description: 'Cumin en grains', unit: 'kg', price: 6.40, imageUrl: '' },
      { name: 'Coriandre', description: 'Coriandre en grains', unit: 'kg', price: 5.90, imageUrl: '' },
      { name: 'Fenouil', description: 'Fenouil en grains', unit: 'kg', price: 4.60, imageUrl: '' },
      { name: 'Anis Etoile', description: 'Anis etoile pour infusion', unit: 'kg', price: 7.80, imageUrl: '' }
    ];

    // Fruits
    const fruits = [
      { name: 'Mangues Locales', description: 'Mangues fraiches du marche', unit: 'kg', price: 2.80, imageUrl: '' },
      { name: 'Papayes', description: 'Papayes mures et sucrees', unit: 'kg', price: 3.20, imageUrl: '' },
      { name: 'Goyaves', description: 'Goyaves parfumees', unit: 'kg', price: 2.50, imageUrl: '' },
      { name: 'Ananas Locaux', description: 'Ananas frais du jardin', unit: 'kg', price: 2.20, imageUrl: '' },
      { name: 'Oranges Locales', description: 'Oranges juteuses', unit: 'kg', price: 2.60, imageUrl: '' },
      { name: 'Avocats', description: 'Avocats murs et cremeux', unit: 'kg', price: 4.50, imageUrl: '' },
      { name: 'Pasteques', description: 'Pasteques sucrees', unit: 'kg', price: 1.80, imageUrl: '' },
      { name: 'Melons', description: 'Melons parfumes', unit: 'kg', price: 2.40, imageUrl: '' },
      { name: 'Citrons', description: 'Citrons verts frais', unit: 'kg', price: 3.80, imageUrl: '' },
      { name: 'Pamplemousses', description: 'Pamplemousses roses', unit: 'kg', price: 3.20, imageUrl: '' },
      { name: 'Bananes Dessert', description: 'Bananes dessert sucrees', unit: 'kg', price: 2.90, imageUrl: '' },
      { name: 'Raisins', description: 'Raisins frais importes', unit: 'kg', price: 5.80, imageUrl: '' },
      { name: 'Pommes', description: 'Pommes croquantes', unit: 'kg', price: 4.20, imageUrl: '' },
      { name: 'Poires', description: 'Poires juteuses', unit: 'kg', price: 4.60, imageUrl: '' },
      { name: 'Prunes', description: 'Prunes mures', unit: 'kg', price: 5.20, imageUrl: '' }
    ];

    // Plantes Oléagineuses
    const plantesOleagineuses = [
      { name: 'Huile de Palme Rouge', description: 'Huile de palme rouge traditionnelle', unit: 'litre', price: 3.50, imageUrl: '' },
      { name: 'Huile de Palme Blanche', description: 'Huile de palme blanche raffinee', unit: 'litre', price: 4.20, imageUrl: '' },
      { name: 'Arachides Decortiquees', description: 'Arachides decortiquees pour huile', unit: 'kg', price: 5.80, imageUrl: '' },
      { name: 'Huile d\'Arachide', description: 'Huile d\'arachide pure', unit: 'litre', price: 6.50, imageUrl: '' },
      { name: 'Graines de Sesame', description: 'Graines de sesame blanches', unit: 'kg', price: 8.20, imageUrl: '' },
      { name: 'Huile de Sesame', description: 'Huile de sesame parfumee', unit: 'litre', price: 12.80, imageUrl: '' },
      { name: 'Noix de Coco Fraiches', description: 'Noix de coco fraiches', unit: 'unite', price: 2.50, imageUrl: '' },
      { name: 'Huile de Coco Vierge', description: 'Huile de coco vierge extra', unit: 'litre', price: 15.50, imageUrl: '' },
      { name: 'Soja Decortique', description: 'Soja decortique pour huile', unit: 'kg', price: 4.80, imageUrl: '' },
      { name: 'Huile de Soja', description: 'Huile de soja raffinee', unit: 'litre', price: 5.20, imageUrl: '' },
      { name: 'Graines de Tournesol', description: 'Graines de tournesol decortiquees', unit: 'kg', price: 6.80, imageUrl: '' },
      { name: 'Huile de Tournesol', description: 'Huile de tournesol', unit: 'litre', price: 4.80, imageUrl: '' },
      { name: 'Graines de Lin', description: 'Graines de lin pour huile', unit: 'kg', price: 7.50, imageUrl: '' },
      { name: 'Huile de Lin', description: 'Huile de lin riche en omega-3', unit: 'litre', price: 18.50, imageUrl: '' },
      { name: 'Graines de Chia', description: 'Graines de chia pour huile', unit: 'kg', price: 9.80, imageUrl: '' }
    ];

    // Plantes Médicinales et Aromatiques
    const plantesMedicinales = [
      { name: 'Moringa Oleifera', description: 'Moringa pour ses proprietes nutritives', unit: 'kg', price: 8.50, imageUrl: '' },
      { name: 'Citronnelle', description: 'Citronnelle pour infusions', unit: 'kg', price: 4.20, imageUrl: '' },
      { name: 'Aloe Vera', description: 'Aloe vera medicinal', unit: 'kg', price: 6.80, imageUrl: '' },
      { name: 'Bitter Kola', description: 'Bitter kola traditionnel', unit: 'kg', price: 12.50, imageUrl: '' },
      { name: 'Neem', description: 'Feuilles de neem medicinales', unit: 'kg', price: 5.40, imageUrl: '' },
      { name: 'Artemisia', description: 'Artemisia pour la sante', unit: 'kg', price: 7.20, imageUrl: '' },
      { name: 'Ginseng Africain', description: 'Ginseng africain traditionnel', unit: 'kg', price: 15.80, imageUrl: '' },
      { name: 'Hibiscus', description: 'Fleurs d\'hibiscus pour the', unit: 'kg', price: 6.50, imageUrl: '' },
      { name: 'Buchu', description: 'Buchu pour infusions', unit: 'kg', price: 8.90, imageUrl: '' },
      { name: 'Rooibos', description: 'Rooibos rouge africain', unit: 'kg', price: 9.20, imageUrl: '' },
      { name: 'Honeybush', description: 'Honeybush parfume', unit: 'kg', price: 7.80, imageUrl: '' },
      { name: 'Damiana', description: 'Damiana pour le bien-etre', unit: 'kg', price: 11.50, imageUrl: '' },
      { name: 'Yohimbe', description: 'Yohimbe traditionnel', unit: 'kg', price: 14.20, imageUrl: '' },
      { name: 'Kola Nut', description: 'Noix de kola fraiches', unit: 'kg', price: 10.80, imageUrl: '' },
      { name: 'Guarana', description: 'Graines de guarana', unit: 'kg', price: 13.50, imageUrl: '' }
    ];

    // Cultures de Rente
    const culturesRente = [
      { name: 'Cacao Premium', description: 'Cacao premium du Cameroun', unit: 'kg', price: 8.50, imageUrl: '' },
      { name: 'Cafe Robusta', description: 'Cafe robusta local', unit: 'kg', price: 6.80, imageUrl: '' },
      { name: 'Cafe Arabica', description: 'Cafe arabica de qualite', unit: 'kg', price: 9.20, imageUrl: '' },
      { name: 'The Noir', description: 'The noir traditionnel', unit: 'kg', price: 7.50, imageUrl: '' },
      { name: 'The Vert', description: 'The vert frais', unit: 'kg', price: 8.80, imageUrl: '' },
      { name: 'Canne a Sucre', description: 'Canne a sucre fraiche', unit: 'kg', price: 1.20, imageUrl: '' },
      { name: 'Sucre de Canne', description: 'Sucre de canne non raffine', unit: 'kg', price: 2.80, imageUrl: '' },
      { name: 'Noix de Kola', description: 'Noix de kola traditionnelles', unit: 'kg', price: 12.50, imageUrl: '' },
      { name: 'Tabac Local', description: 'Tabac cultive localement', unit: 'kg', price: 15.80, imageUrl: '' },
      { name: 'Cotton', description: 'Cotton brut local', unit: 'kg', price: 4.20, imageUrl: '' },
      { name: 'Caoutchouc', description: 'Caoutchouc naturel', unit: 'kg', price: 6.50, imageUrl: '' },
      { name: 'Jute', description: 'Fibres de jute', unit: 'kg', price: 3.80, imageUrl: '' },
      { name: 'Sisal', description: 'Fibres de sisal', unit: 'kg', price: 4.60, imageUrl: '' },
      { name: 'Kenaf', description: 'Fibres de kenaf', unit: 'kg', price: 3.20, imageUrl: '' },
      { name: 'Ramie', description: 'Fibres de ramie', unit: 'kg', price: 5.40, imageUrl: '' }
    ];

    // Combiner tous les produits
    const allProducts = [
      ...cerealesGrains.map(p => ({ ...p, categoryId: categories[0].id })),
      ...tuberculesRacines.map(p => ({ ...p, categoryId: categories[1].id })),
      ...legumineusesPois.map(p => ({ ...p, categoryId: categories[2].id })),
      ...legumes.map(p => ({ ...p, categoryId: categories[3].id })),
      ...bananesPlantains.map(p => ({ ...p, categoryId: categories[4].id })),
      ...epicesCondiments.map(p => ({ ...p, categoryId: categories[5].id })),
      ...fruits.map(p => ({ ...p, categoryId: categories[6].id })),
      ...plantesOleagineuses.map(p => ({ ...p, categoryId: categories[7].id })),
      ...plantesMedicinales.map(p => ({ ...p, categoryId: categories[8].id })),
      ...culturesRente.map(p => ({ ...p, categoryId: categories[9].id }))
    ];

    // Creer tous les produits
    const products = await Promise.all(
      allProducts.map(product =>
        prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            unit: product.unit,
            imageUrl: product.imageUrl,
            categoryId: product.categoryId
          }
        })
      )
    );
    console.log(`${products.length} produits crees`);

    // 4. Creer des stocks initiaux
    console.log('Creation des stocks initiaux...');
    const stocks = await Promise.all(
      products.flatMap(product =>
        warehouses.map(warehouse =>
          prisma.stock.create({
            data: {
              productId: product.id,
              warehouseId: warehouse.id,
              quantity: faker.number.float({ min: 20, max: 500, fractionDigits: 2 }),
              unitPrice: faker.number.float({ min: 1, max: 20, fractionDigits: 2 })
            }
          })
        )
      )
    );
    console.log(`${stocks.length} stocks crees`);

    console.log('Seeding termine avec succes !');
    console.log(`\nResume des donnees creees :`);
    console.log(`   - ${categories.length} categories de produits agricoles`);
    console.log(`   - ${warehouses.length} entrepots au Cameroun`);
    console.log(`   - ${products.length} produits agricoles`);
    console.log(`   - ${stocks.length} stocks repartis`);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
