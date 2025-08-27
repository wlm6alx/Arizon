import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Nettoyage de la base de donnees...');
  
  try {
    // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
    console.log('Suppression des notifications...');
    await prisma.notification.deleteMany();
    
    console.log('Suppression des elements de commande...');
    await prisma.orderItem.deleteMany();
    
    console.log('Suppression des commandes...');
    await prisma.order.deleteMany();
    
    console.log('Suppression des approvisionnements...');
    await prisma.approvisionnement.deleteMany();
    
    console.log('Suppression des stocks...');
    await prisma.stock.deleteMany();
    
    console.log('Suppression des attributions de roles...');
    await prisma.userRole.deleteMany();
    
    console.log('Suppression des utilisateurs...');
    await prisma.user.deleteMany();
    
    console.log('Suppression des produits...');
    await prisma.product.deleteMany();
    
    console.log('Suppression des entrepots...');
    await prisma.warehouse.deleteMany();
    
    console.log('Suppression des categories de produits...');
    await prisma.productCategory.deleteMany();
    
    console.log('✅ Nettoyage termine avec succes !');
    console.log('Vous pouvez maintenant relancer npm run seed:data');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage :', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur fatale :', e);
    process.exit(1);
  });
