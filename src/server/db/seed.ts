import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const dbPath = path.join(process.cwd(), "fikex.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite, { schema });

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  // Add some random hours for variety
  d.setHours(randomInt(7, 19), randomInt(0, 59), randomInt(0, 59));
  return d.toISOString();
}

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  db.delete(schema.transactions).run();
  db.delete(schema.businesses).run();

  // --- Business 1: Maman Adjovi (market food vendor) ---
  const adjovi = db
    .insert(schema.businesses)
    .values({
      phone: "+2290197000001",
      name: "Maman Adjovi - Vente de produits alimentaires",
      sector: "Commerce alimentaire",
      city: "Cotonou",
      language: "fr",
    })
    .returning()
    .get();

  // --- Business 2: Koffi Menuiserie (carpenter) ---
  const koffi = db
    .insert(schema.businesses)
    .values({
      phone: "+2290196000002",
      name: "Koffi Menuiserie",
      sector: "Menuiserie",
      city: "Abomey-Calavi",
      language: "fr",
    })
    .returning()
    .get();

  console.log(`Created businesses: ${adjovi.name} (id=${adjovi.id}), ${koffi.name} (id=${koffi.id})`);

  // --- Transactions for Maman Adjovi ---
  const adjoviTransactions: schema.NewTransaction[] = [
    // Month 1 (about 3 months ago)
    { businessId: adjovi.id, type: "sale", description: "Vente de riz (50 kg)", amount: 37500, category: "Céréales", source: "whatsapp", createdAt: daysAgo(88) },
    { businessId: adjovi.id, type: "sale", description: "Vente d'huile de palme (20 litres)", amount: 24000, category: "Huiles", source: "whatsapp", createdAt: daysAgo(86) },
    { businessId: adjovi.id, type: "expense", description: "Achat de sacs de maïs au marché Dantokpa", amount: 45000, category: "Approvisionnement", source: "whatsapp", createdAt: daysAgo(85) },
    { businessId: adjovi.id, type: "sale", description: "Vente de tomates et piments", amount: 8500, category: "Légumes", source: "web", createdAt: daysAgo(82) },
    { businessId: adjovi.id, type: "sale", description: "Vente de gari (30 kg)", amount: 15000, category: "Céréales", source: "whatsapp", createdAt: daysAgo(80) },
    { businessId: adjovi.id, type: "expense", description: "Transport de marchandises (zem)", amount: 3000, category: "Transport", source: "whatsapp", createdAt: daysAgo(79) },
    { businessId: adjovi.id, type: "sale", description: "Vente de haricots rouges", amount: 12000, category: "Légumineuses", source: "ocr", createdAt: daysAgo(77) },
    { businessId: adjovi.id, type: "expense", description: "Location emplacement marché", amount: 15000, category: "Loyer", source: "web", createdAt: daysAgo(76) },
    { businessId: adjovi.id, type: "sale", description: "Vente de sodabi et boissons", amount: 18000, category: "Boissons", source: "whatsapp", createdAt: daysAgo(74) },
    { businessId: adjovi.id, type: "sale", description: "Vente d'ignames (panier)", amount: 22000, category: "Tubercules", source: "whatsapp", createdAt: daysAgo(72) },

    // Month 2 (about 2 months ago)
    { businessId: adjovi.id, type: "sale", description: "Vente de riz importé (100 kg)", amount: 75000, category: "Céréales", source: "whatsapp", createdAt: daysAgo(58) },
    { businessId: adjovi.id, type: "expense", description: "Réapprovisionnement huile et conserves", amount: 52000, category: "Approvisionnement", source: "ocr", createdAt: daysAgo(56) },
    { businessId: adjovi.id, type: "sale", description: "Vente de pâte de tomate (cartons)", amount: 32000, category: "Conserves", source: "whatsapp", createdAt: daysAgo(54) },
    { businessId: adjovi.id, type: "sale", description: "Vente de sucre et sel en détail", amount: 9500, category: "Épicerie", source: "web", createdAt: daysAgo(51) },
    { businessId: adjovi.id, type: "expense", description: "Frais de téléphone mobile money", amount: 2500, category: "Communication", source: "whatsapp", createdAt: daysAgo(49) },
    { businessId: adjovi.id, type: "sale", description: "Vente de maïs concassé", amount: 28000, category: "Céréales", source: "whatsapp", createdAt: daysAgo(47) },
    { businessId: adjovi.id, type: "sale", description: "Vente de poisson fumé", amount: 35000, category: "Poisson", source: "ocr", createdAt: daysAgo(44) },
    { businessId: adjovi.id, type: "expense", description: "Location emplacement marché", amount: 15000, category: "Loyer", source: "web", createdAt: daysAgo(42) },
    { businessId: adjovi.id, type: "sale", description: "Vente d'attiéké et garnitures", amount: 6000, category: "Plats préparés", source: "whatsapp", createdAt: daysAgo(40) },
    { businessId: adjovi.id, type: "expense", description: "Achat de bâches et seaux", amount: 8000, category: "Équipement", source: "whatsapp", createdAt: daysAgo(38) },

    // Month 3 (last month / current)
    { businessId: adjovi.id, type: "sale", description: "Vente de soja et arachides", amount: 19000, category: "Légumineuses", source: "whatsapp", createdAt: daysAgo(25) },
    { businessId: adjovi.id, type: "expense", description: "Achat de marchandises au grossiste", amount: 65000, category: "Approvisionnement", source: "ocr", createdAt: daysAgo(23) },
    { businessId: adjovi.id, type: "sale", description: "Vente de lait en poudre et Nido", amount: 42000, category: "Produits laitiers", source: "whatsapp", createdAt: daysAgo(20) },
    { businessId: adjovi.id, type: "sale", description: "Vente de tomates fraîches", amount: 11000, category: "Légumes", source: "whatsapp", createdAt: daysAgo(17) },
    { businessId: adjovi.id, type: "expense", description: "Transport marchandises depuis Porto-Novo", amount: 5500, category: "Transport", source: "whatsapp", createdAt: daysAgo(15) },
    { businessId: adjovi.id, type: "sale", description: "Vente de cubes Maggi et épices", amount: 14000, category: "Épicerie", source: "web", createdAt: daysAgo(12) },
    { businessId: adjovi.id, type: "sale", description: "Vente d'huile végétale (bidons)", amount: 30000, category: "Huiles", source: "whatsapp", createdAt: daysAgo(8) },
    { businessId: adjovi.id, type: "expense", description: "Location emplacement marché", amount: 15000, category: "Loyer", source: "web", createdAt: daysAgo(5) },
    { businessId: adjovi.id, type: "sale", description: "Vente de riz et haricots", amount: 48000, category: "Céréales", source: "whatsapp", createdAt: daysAgo(3) },
    { businessId: adjovi.id, type: "expense", description: "Achat de sachets d'emballage", amount: 2000, category: "Fournitures", source: "whatsapp", createdAt: daysAgo(1) },
  ];

  // --- Transactions for Koffi Menuiserie ---
  const koffiTransactions: schema.NewTransaction[] = [
    // Month 1 (about 3 months ago)
    { businessId: koffi.id, type: "sale", description: "Fabrication d'armoire en bois (client Akpakpa)", amount: 85000, category: "Meubles", source: "whatsapp", createdAt: daysAgo(90) },
    { businessId: koffi.id, type: "expense", description: "Achat de planches de teck (lot)", amount: 45000, category: "Matières premières", source: "whatsapp", createdAt: daysAgo(87) },
    { businessId: koffi.id, type: "expense", description: "Achat de clous, vis et colle à bois", amount: 8500, category: "Quincaillerie", source: "ocr", createdAt: daysAgo(84) },
    { businessId: koffi.id, type: "sale", description: "Réparation de chaises (lot de 6)", amount: 18000, category: "Réparation", source: "whatsapp", createdAt: daysAgo(81) },
    { businessId: koffi.id, type: "sale", description: "Fabrication de cadres de lit (2 pièces)", amount: 70000, category: "Meubles", source: "web", createdAt: daysAgo(78) },
    { businessId: koffi.id, type: "expense", description: "Achat de vernis et peinture bois", amount: 12000, category: "Finitions", source: "whatsapp", createdAt: daysAgo(76) },
    { businessId: koffi.id, type: "expense", description: "Loyer atelier mensuel", amount: 25000, category: "Loyer", source: "web", createdAt: daysAgo(75) },
    { businessId: koffi.id, type: "sale", description: "Table à manger sur commande", amount: 120000, category: "Meubles", source: "whatsapp", createdAt: daysAgo(73) },
    { businessId: koffi.id, type: "expense", description: "Facture électricité atelier", amount: 8000, category: "Énergie", source: "web", createdAt: daysAgo(71) },
    { businessId: koffi.id, type: "sale", description: "Étagères murales (commande bureau)", amount: 45000, category: "Meubles", source: "ocr", createdAt: daysAgo(70) },

    // Month 2 (about 2 months ago)
    { businessId: koffi.id, type: "expense", description: "Achat de contreplaqué et lattes", amount: 38000, category: "Matières premières", source: "whatsapp", createdAt: daysAgo(60) },
    { businessId: koffi.id, type: "sale", description: "Porte en bois massif sur commande", amount: 95000, category: "Portes & Fenêtres", source: "whatsapp", createdAt: daysAgo(57) },
    { businessId: koffi.id, type: "sale", description: "Fabrication de bancs pour école", amount: 60000, category: "Meubles", source: "web", createdAt: daysAgo(53) },
    { businessId: koffi.id, type: "expense", description: "Salaire apprenti Codjo", amount: 20000, category: "Main d'œuvre", source: "whatsapp", createdAt: daysAgo(50) },
    { businessId: koffi.id, type: "expense", description: "Loyer atelier mensuel", amount: 25000, category: "Loyer", source: "web", createdAt: daysAgo(48) },
    { businessId: koffi.id, type: "sale", description: "Commode 4 tiroirs", amount: 75000, category: "Meubles", source: "whatsapp", createdAt: daysAgo(45) },
    { businessId: koffi.id, type: "expense", description: "Achat lame de scie et papier verre", amount: 6500, category: "Quincaillerie", source: "ocr", createdAt: daysAgo(43) },
    { businessId: koffi.id, type: "sale", description: "Réparation porte et fenêtres", amount: 25000, category: "Réparation", source: "whatsapp", createdAt: daysAgo(41) },
    { businessId: koffi.id, type: "expense", description: "Facture électricité atelier", amount: 9000, category: "Énergie", source: "web", createdAt: daysAgo(39) },
    { businessId: koffi.id, type: "sale", description: "Dressing chambre à coucher", amount: 150000, category: "Meubles", source: "whatsapp", createdAt: daysAgo(36) },

    // Month 3 (last month / current)
    { businessId: koffi.id, type: "expense", description: "Achat bois rouge et iroko", amount: 55000, category: "Matières premières", source: "whatsapp", createdAt: daysAgo(28) },
    { businessId: koffi.id, type: "sale", description: "Fabrication de cuisine complète", amount: 200000, category: "Meubles", source: "whatsapp", createdAt: daysAgo(24) },
    { businessId: koffi.id, type: "expense", description: "Salaire apprenti Codjo", amount: 20000, category: "Main d'œuvre", source: "whatsapp", createdAt: daysAgo(22) },
    { businessId: koffi.id, type: "sale", description: "Fenêtres en bois (lot de 4)", amount: 80000, category: "Portes & Fenêtres", source: "ocr", createdAt: daysAgo(19) },
    { businessId: koffi.id, type: "expense", description: "Loyer atelier mensuel", amount: 25000, category: "Loyer", source: "web", createdAt: daysAgo(16) },
    { businessId: koffi.id, type: "sale", description: "Table de bureau et chaise", amount: 55000, category: "Meubles", source: "whatsapp", createdAt: daysAgo(13) },
    { businessId: koffi.id, type: "expense", description: "Achat de charnières et serrures", amount: 7000, category: "Quincaillerie", source: "whatsapp", createdAt: daysAgo(10) },
    { businessId: koffi.id, type: "sale", description: "Bibliothèque murale sur mesure", amount: 65000, category: "Meubles", source: "web", createdAt: daysAgo(7) },
    { businessId: koffi.id, type: "expense", description: "Facture électricité atelier", amount: 10000, category: "Énergie", source: "web", createdAt: daysAgo(4) },
    { businessId: koffi.id, type: "sale", description: "Réparation de meubles divers", amount: 30000, category: "Réparation", source: "whatsapp", createdAt: daysAgo(2) },
  ];

  // Insert all transactions
  db.insert(schema.transactions).values(adjoviTransactions).run();
  db.insert(schema.transactions).values(koffiTransactions).run();

  console.log(`Inserted ${adjoviTransactions.length} transactions for ${adjovi.name}`);
  console.log(`Inserted ${koffiTransactions.length} transactions for ${koffi.name}`);
  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
