import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(randomInt(7, 19), randomInt(0, 59), randomInt(0, 59));
  return d.toISOString();
}

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(schema.transactions);
  await db.delete(schema.businesses);

  // --- Business 1: Maman Adjovi (market food vendor) ---
  const [adjovi] = await db
    .insert(schema.businesses)
    .values({
      phone: "+2290197000001",
      name: "Maman Adjovi - Vente de produits alimentaires",
      sector: "Commerce alimentaire",
      city: "Cotonou",
      language: "fr",
    })
    .returning();

  // --- Business 2: Koffi Menuiserie (carpenter) ---
  const [koffi] = await db
    .insert(schema.businesses)
    .values({
      phone: "+2290196000002",
      name: "Koffi Menuiserie",
      sector: "Menuiserie",
      city: "Abomey-Calavi",
      language: "fr",
    })
    .returning();

  console.log(`Created businesses: ${adjovi.name} (id=${adjovi.id}), ${koffi.name} (id=${koffi.id})`);

  // --- Transactions for Maman Adjovi ---
  const adjoviTransactions: schema.NewTransaction[] = [
    { businessId: adjovi.id, type: "sale", description: "Vente de riz (50 kg)", amount: 37500, category: "alimentation", source: "whatsapp", createdAt: daysAgo(88) },
    { businessId: adjovi.id, type: "sale", description: "Vente d'huile de palme (20 litres)", amount: 24000, category: "alimentation", source: "whatsapp", createdAt: daysAgo(86) },
    { businessId: adjovi.id, type: "expense", description: "Achat de sacs de mais au marche Dantokpa", amount: 45000, category: "marchandise", source: "whatsapp", createdAt: daysAgo(85) },
    { businessId: adjovi.id, type: "sale", description: "Vente de tomates et piments", amount: 8500, category: "alimentation", source: "web", createdAt: daysAgo(82) },
    { businessId: adjovi.id, type: "sale", description: "Vente de gari (30 kg)", amount: 15000, category: "alimentation", source: "whatsapp", createdAt: daysAgo(80) },
    { businessId: adjovi.id, type: "expense", description: "Transport de marchandises (zem)", amount: 3000, category: "transport", source: "whatsapp", createdAt: daysAgo(79) },
    { businessId: adjovi.id, type: "sale", description: "Vente de haricots rouges", amount: 12000, category: "alimentation", source: "ocr", createdAt: daysAgo(77) },
    { businessId: adjovi.id, type: "expense", description: "Location emplacement marche", amount: 15000, category: "loyer", source: "web", createdAt: daysAgo(76) },
    { businessId: adjovi.id, type: "sale", description: "Vente de sodabi et boissons", amount: 18000, category: "alimentation", source: "whatsapp", createdAt: daysAgo(74) },
    { businessId: adjovi.id, type: "sale", description: "Vente d'ignames (panier)", amount: 22000, category: "alimentation", source: "whatsapp", createdAt: daysAgo(72) },
    { businessId: adjovi.id, type: "sale", description: "Vente de riz importe (100 kg)", amount: 75000, category: "alimentation", source: "whatsapp", createdAt: daysAgo(58) },
    { businessId: adjovi.id, type: "expense", description: "Reapprovisionnement huile et conserves", amount: 52000, category: "marchandise", source: "ocr", createdAt: daysAgo(56) },
    { businessId: adjovi.id, type: "sale", description: "Vente de pate de tomate (cartons)", amount: 32000, category: "alimentation", source: "whatsapp", createdAt: daysAgo(54) },
    { businessId: adjovi.id, type: "sale", description: "Vente de sucre et sel en detail", amount: 9500, category: "alimentation", source: "web", createdAt: daysAgo(51) },
    { businessId: adjovi.id, type: "expense", description: "Frais de telephone mobile money", amount: 2500, category: "communication", source: "whatsapp", createdAt: daysAgo(49) },
    { businessId: adjovi.id, type: "sale", description: "Vente de mais concasse", amount: 28000, category: "alimentation", source: "whatsapp", createdAt: daysAgo(47) },
    { businessId: adjovi.id, type: "sale", description: "Vente de poisson fume", amount: 35000, category: "alimentation", source: "ocr", createdAt: daysAgo(44) },
    { businessId: adjovi.id, type: "expense", description: "Location emplacement marche", amount: 15000, category: "loyer", source: "web", createdAt: daysAgo(42) },
    { businessId: adjovi.id, type: "sale", description: "Vente d'attieke et garnitures", amount: 6000, category: "alimentation", source: "whatsapp", createdAt: daysAgo(40) },
    { businessId: adjovi.id, type: "expense", description: "Achat de baches et seaux", amount: 8000, category: "equipement", source: "whatsapp", createdAt: daysAgo(38) },
    { businessId: adjovi.id, type: "sale", description: "Vente de soja et arachides", amount: 19000, category: "alimentation", source: "whatsapp", createdAt: daysAgo(25) },
    { businessId: adjovi.id, type: "expense", description: "Achat de marchandises au grossiste", amount: 65000, category: "marchandise", source: "ocr", createdAt: daysAgo(23) },
    { businessId: adjovi.id, type: "sale", description: "Vente de lait en poudre et Nido", amount: 42000, category: "alimentation", source: "whatsapp", createdAt: daysAgo(20) },
    { businessId: adjovi.id, type: "sale", description: "Vente de tomates fraiches", amount: 11000, category: "alimentation", source: "whatsapp", createdAt: daysAgo(17) },
    { businessId: adjovi.id, type: "expense", description: "Transport marchandises depuis Porto-Novo", amount: 5500, category: "transport", source: "whatsapp", createdAt: daysAgo(15) },
    { businessId: adjovi.id, type: "sale", description: "Vente de cubes Maggi et epices", amount: 14000, category: "alimentation", source: "web", createdAt: daysAgo(12) },
    { businessId: adjovi.id, type: "sale", description: "Vente d'huile vegetale (bidons)", amount: 30000, category: "alimentation", source: "whatsapp", createdAt: daysAgo(8) },
    { businessId: adjovi.id, type: "expense", description: "Location emplacement marche", amount: 15000, category: "loyer", source: "web", createdAt: daysAgo(5) },
    { businessId: adjovi.id, type: "sale", description: "Vente de riz et haricots", amount: 48000, category: "alimentation", source: "whatsapp", createdAt: daysAgo(3) },
    { businessId: adjovi.id, type: "expense", description: "Achat de sachets d'emballage", amount: 2000, category: "autre", source: "whatsapp", createdAt: daysAgo(1) },
  ];

  // --- Transactions for Koffi Menuiserie ---
  const koffiTransactions: schema.NewTransaction[] = [
    { businessId: koffi.id, type: "sale", description: "Fabrication d'armoire en bois (client Akpakpa)", amount: 85000, category: "service", source: "whatsapp", createdAt: daysAgo(90) },
    { businessId: koffi.id, type: "expense", description: "Achat de planches de teck (lot)", amount: 45000, category: "marchandise", source: "whatsapp", createdAt: daysAgo(87) },
    { businessId: koffi.id, type: "expense", description: "Achat de clous, vis et colle a bois", amount: 8500, category: "equipement", source: "ocr", createdAt: daysAgo(84) },
    { businessId: koffi.id, type: "sale", description: "Reparation de chaises (lot de 6)", amount: 18000, category: "service", source: "whatsapp", createdAt: daysAgo(81) },
    { businessId: koffi.id, type: "sale", description: "Fabrication de cadres de lit (2 pieces)", amount: 70000, category: "service", source: "web", createdAt: daysAgo(78) },
    { businessId: koffi.id, type: "expense", description: "Achat de vernis et peinture bois", amount: 12000, category: "marchandise", source: "whatsapp", createdAt: daysAgo(76) },
    { businessId: koffi.id, type: "expense", description: "Loyer atelier mensuel", amount: 25000, category: "loyer", source: "web", createdAt: daysAgo(75) },
    { businessId: koffi.id, type: "sale", description: "Table a manger sur commande", amount: 120000, category: "service", source: "whatsapp", createdAt: daysAgo(73) },
    { businessId: koffi.id, type: "expense", description: "Facture electricite atelier", amount: 8000, category: "autre", source: "web", createdAt: daysAgo(71) },
    { businessId: koffi.id, type: "sale", description: "Etageres murales (commande bureau)", amount: 45000, category: "service", source: "ocr", createdAt: daysAgo(70) },
    { businessId: koffi.id, type: "expense", description: "Achat de contreplaques et lattes", amount: 38000, category: "marchandise", source: "whatsapp", createdAt: daysAgo(60) },
    { businessId: koffi.id, type: "sale", description: "Porte en bois massif sur commande", amount: 95000, category: "service", source: "whatsapp", createdAt: daysAgo(57) },
    { businessId: koffi.id, type: "sale", description: "Fabrication de bancs pour ecole", amount: 60000, category: "service", source: "web", createdAt: daysAgo(53) },
    { businessId: koffi.id, type: "expense", description: "Salaire apprenti Codjo", amount: 20000, category: "salaire", source: "whatsapp", createdAt: daysAgo(50) },
    { businessId: koffi.id, type: "expense", description: "Loyer atelier mensuel", amount: 25000, category: "loyer", source: "web", createdAt: daysAgo(48) },
    { businessId: koffi.id, type: "sale", description: "Commode 4 tiroirs", amount: 75000, category: "service", source: "whatsapp", createdAt: daysAgo(45) },
    { businessId: koffi.id, type: "expense", description: "Achat lame de scie et papier verre", amount: 6500, category: "equipement", source: "ocr", createdAt: daysAgo(43) },
    { businessId: koffi.id, type: "sale", description: "Reparation porte et fenetres", amount: 25000, category: "service", source: "whatsapp", createdAt: daysAgo(41) },
    { businessId: koffi.id, type: "expense", description: "Facture electricite atelier", amount: 9000, category: "autre", source: "web", createdAt: daysAgo(39) },
    { businessId: koffi.id, type: "sale", description: "Dressing chambre a coucher", amount: 150000, category: "service", source: "whatsapp", createdAt: daysAgo(36) },
    { businessId: koffi.id, type: "expense", description: "Achat bois rouge et iroko", amount: 55000, category: "marchandise", source: "whatsapp", createdAt: daysAgo(28) },
    { businessId: koffi.id, type: "sale", description: "Fabrication de cuisine complete", amount: 200000, category: "service", source: "whatsapp", createdAt: daysAgo(24) },
    { businessId: koffi.id, type: "expense", description: "Salaire apprenti Codjo", amount: 20000, category: "salaire", source: "whatsapp", createdAt: daysAgo(22) },
    { businessId: koffi.id, type: "sale", description: "Fenetres en bois (lot de 4)", amount: 80000, category: "service", source: "ocr", createdAt: daysAgo(19) },
    { businessId: koffi.id, type: "expense", description: "Loyer atelier mensuel", amount: 25000, category: "loyer", source: "web", createdAt: daysAgo(16) },
    { businessId: koffi.id, type: "sale", description: "Table de bureau et chaise", amount: 55000, category: "service", source: "whatsapp", createdAt: daysAgo(13) },
    { businessId: koffi.id, type: "expense", description: "Achat de charnieres et serrures", amount: 7000, category: "equipement", source: "whatsapp", createdAt: daysAgo(10) },
    { businessId: koffi.id, type: "sale", description: "Bibliotheque murale sur mesure", amount: 65000, category: "service", source: "web", createdAt: daysAgo(7) },
    { businessId: koffi.id, type: "expense", description: "Facture electricite atelier", amount: 10000, category: "autre", source: "web", createdAt: daysAgo(4) },
    { businessId: koffi.id, type: "sale", description: "Reparation de meubles divers", amount: 30000, category: "service", source: "whatsapp", createdAt: daysAgo(2) },
  ];

  // Insert all transactions
  await db.insert(schema.transactions).values(adjoviTransactions);
  await db.insert(schema.transactions).values(koffiTransactions);

  console.log(`Inserted ${adjoviTransactions.length} transactions for ${adjovi.name}`);
  console.log(`Inserted ${koffiTransactions.length} transactions for ${koffi.name}`);
  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
