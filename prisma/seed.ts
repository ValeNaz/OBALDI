import { PrismaClient, ProductStatus, ProductMediaType, ContentPostType, ContentPostStatus } from "@prisma/client";
import { hashPassword } from "../src/core/auth/passwords";

const prisma = new PrismaClient();

async function main() {
  const accessoPlan = await prisma.membershipPlan.upsert({
    where: { code: "ACCESSO" },
    update: {
      priceCents: 990,
      currency: "EUR",
      periodDays: 28,
      pointsPolicyType: "NONE",
      pointsFixedAmount: null,
      pointsConversionRate: null,
      isActive: true
    },
    create: {
      code: "ACCESSO",
      priceCents: 990,
      currency: "EUR",
      periodDays: 28,
      pointsPolicyType: "NONE",
      pointsFixedAmount: null,
      pointsConversionRate: null,
      isActive: true
    }
  });

  const tutelaPlan = await prisma.membershipPlan.upsert({
    where: { code: "TUTELA" },
    update: {
      priceCents: 1490,
      currency: "EUR",
      periodDays: 28,
      pointsPolicyType: "FIXED_PER_RENEWAL",
      pointsFixedAmount: 10,
      pointsConversionRate: null,
      isActive: true
    },
    create: {
      code: "TUTELA",
      priceCents: 1490,
      currency: "EUR",
      periodDays: 28,
      pointsPolicyType: "FIXED_PER_RENEWAL",
      pointsFixedAmount: 10,
      pointsConversionRate: null,
      isActive: true
    }
  });

  const allowDefaults =
    process.env.SEED_ALLOW_DEFAULTS === "1" || process.env.NODE_ENV !== "production";

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@obaldi.local";
  const sellerEmail = process.env.SELLER_EMAIL ?? "seller@obaldi.local";
  const memberEmail = process.env.MEMBER_EMAIL ?? "member@obaldi.local";

  const adminPasswordPlain =
    process.env.ADMIN_PASSWORD ?? (allowDefaults ? "AdminTest123!" : "");
  const sellerPasswordPlain =
    process.env.SELLER_PASSWORD ?? (allowDefaults ? "SellerTest123!" : "");
  const memberPasswordPlain =
    process.env.MEMBER_PASSWORD ?? (allowDefaults ? "MemberTest123!" : "");

  const adminPasswordHash = adminPasswordPlain ? await hashPassword(adminPasswordPlain) : null;
  const sellerPasswordHash = sellerPasswordPlain ? await hashPassword(sellerPasswordPlain) : null;
  const memberPasswordHash = memberPasswordPlain ? await hashPassword(memberPasswordPlain) : null;

  if (!adminPasswordHash) {
    console.warn("ADMIN_PASSWORD not set. Admin will not be able to login.");
  }
  if (!sellerPasswordHash) {
    console.warn("SELLER_PASSWORD not set. Seller will not be able to login.");
  }
  if (!memberPasswordHash) {
    console.warn("MEMBER_PASSWORD not set. Member will not be able to login.");
  }

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      emailVerifiedAt: new Date(),
      passwordHash: adminPasswordHash ?? undefined
    },
    create: {
      email: adminEmail,
      role: "ADMIN",
      emailVerifiedAt: new Date(),
      passwordHash: adminPasswordHash ?? undefined
    }
  });

  const seller = await prisma.user.upsert({
    where: { email: sellerEmail },
    update: {
      role: "SELLER",
      emailVerifiedAt: new Date(),
      passwordHash: sellerPasswordHash ?? undefined
    },
    create: {
      email: sellerEmail,
      role: "SELLER",
      emailVerifiedAt: new Date(),
      passwordHash: sellerPasswordHash ?? undefined
    }
  });

  const member = await prisma.user.upsert({
    where: { email: memberEmail },
    update: {
      role: "MEMBER",
      emailVerifiedAt: new Date(),
      passwordHash: memberPasswordHash ?? undefined
    },
    create: {
      email: memberEmail,
      role: "MEMBER",
      emailVerifiedAt: new Date(),
      passwordHash: memberPasswordHash ?? undefined
    }
  });

  const now = new Date();
  const periodEnd = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);

  await prisma.membership.upsert({
    where: { userId: member.id },
    update: {
      planId: tutelaPlan.id,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      autoRenew: true,
      provider: "STRIPE",
      providerSubId: `seed-${member.id}`
    },
    create: {
      userId: member.id,
      planId: tutelaPlan.id,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      autoRenew: true,
      provider: "STRIPE",
      providerSubId: `seed-${member.id}`
    }
  });

  const seedPointsRef = "seed-points";
  const existingPoints = await prisma.pointsLedger.findFirst({
    where: { userId: member.id, refType: "ADMIN", refId: seedPointsRef }
  });
  if (!existingPoints) {
    await prisma.pointsLedger.create({
      data: {
        userId: member.id,
        delta: 150,
        reason: "ADJUSTMENT",
        refType: "ADMIN",
        refId: seedPointsRef
      }
    });
  }

  const products = [
    // === TECNOLOGIA ===
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-111111111111",
      sellerId: seller.id,
      title: "Smart Hub Pro",
      description: "Hub intelligente per la casa connessa. Compatibile con Alexa, Google Home e HomeKit. Gestisci luci, termostati e dispositivi IoT da un unico punto.",
      specsJson: { connectivity: "WiFi 6, Bluetooth 5.2, Zigbee", power: "USB-C 15W" },
      priceCents: 8900,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      pointsEligible: true,
      pointsPrice: 45
    },
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-222222222222",
      sellerId: seller.id,
      title: "Caricatore Wireless 3-in-1",
      description: "Stazione di ricarica elegante per smartphone, auricolari e smartwatch. Design minimalista in alluminio con LED indicatore discreto.",
      specsJson: { output: "15W + 5W + 3W", material: "Alluminio anodizzato" },
      priceCents: 5900,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      pointsEligible: true,
      pointsPrice: 30
    },
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-333333333333",
      sellerId: seller.id,
      title: "Webcam 4K Pro Stream",
      description: "Webcam professionale con sensore Sony, autofocus veloce e microfono integrato. Perfetta per streaming e videoconferenze.",
      specsJson: { resolution: "4K 30fps / 1080p 60fps", fov: "90°" },
      priceCents: 12900,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      premiumOnly: true,
      pointsEligible: true,
      pointsPrice: 65
    },
    // === CASA E CUCINA ===
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-444444444444",
      sellerId: seller.id,
      title: "Set Contenitori Sottovuoto",
      description: "Set di 6 contenitori ermetici con pompa manuale inclusa. Mantieni freschi gli alimenti fino a 5 volte più a lungo.",
      specsJson: { pieces: 6, material: "Tritan BPA-free", sizes: "0.5L, 1L, 2L" },
      priceCents: 3900,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      pointsEligible: false,
      pointsPrice: null
    },
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-555555555555",
      sellerId: seller.id,
      title: "Lampada LED Smart Ambient",
      description: "Lampada da tavolo con 16 milioni di colori, controllo vocale e ritmi circadiani automatici. Migliora la produttività e il riposo.",
      specsJson: { lumens: 800, colorTemp: "2700K-6500K", connectivity: "WiFi" },
      priceCents: 4900,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      pointsEligible: true,
      pointsPrice: 25
    },
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-666666666666",
      sellerId: seller.id,
      title: "Diffusore Aromi Ultrasonico",
      description: "Diffusore silenzioso con timer programmabile e luci LED. Capacità 300ml per ambienti fino a 30mq.",
      specsJson: { capacity: "300ml", runtime: "8h", noise: "<25dB" },
      priceCents: 2990,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      pointsEligible: false,
      pointsPrice: null
    },
    // === SPORT E BENESSERE ===
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-777777777777",
      sellerId: seller.id,
      title: "Fitness Tracker Avanzato",
      description: "Bracciale fitness con GPS integrato, monitoraggio SpO2, stress e sonno. Resistente all'acqua 5ATM.",
      specsJson: { battery: "14 giorni", sensors: "HR, SpO2, accelerometro", water: "5ATM" },
      priceCents: 7900,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      pointsEligible: true,
      pointsPrice: 40
    },
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-888888888888",
      sellerId: seller.id,
      title: "Tappetino Yoga Premium",
      description: "Tappetino eco-friendly in TPE, antiscivolo e ipoallergenico. Spessore 6mm per massimo comfort durante la pratica.",
      specsJson: { size: "183x61cm", thickness: "6mm", material: "TPE eco-friendly" },
      priceCents: 3490,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      pointsEligible: false,
      pointsPrice: null
    },
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-999999999999",
      sellerId: seller.id,
      title: "Fascia Massaggiante Cervicale",
      description: "Massaggiatore elettrico con calore infrarosso e 3 intensità. Riduci tensioni e dolori al collo dopo ore al computer.",
      specsJson: { modes: 3, heat: "40-45°C", battery: "2000mAh" },
      priceCents: 5490,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      premiumOnly: true,
      pointsEligible: true,
      pointsPrice: 28
    },
    // === AUDIO E VIDEO ===
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-aaaaaaaaaaaa",
      sellerId: seller.id,
      title: "Cuffie Wireless ANC",
      description: "Cuffie over-ear con cancellazione attiva del rumore, 40 ore di autonomia e audio Hi-Res. Pieghevoli per il trasporto.",
      specsJson: { battery: "40h", anc: "Hybrid ANC -35dB", codec: "LDAC, AAC" },
      priceCents: 9900,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      pointsEligible: true,
      pointsPrice: 50
    },
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-bbbbbbbbbbbb",
      sellerId: seller.id,
      title: "Speaker Bluetooth Portatile",
      description: "Speaker impermeabile IPX7 con bassi profondi e 24 ore di autonomia. Perfetto per outdoor e piscina.",
      specsJson: { power: "20W", battery: "24h", water: "IPX7" },
      priceCents: 6900,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      pointsEligible: true,
      pointsPrice: 35
    },
    // === VIAGGIO ===
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-cccccccccccc",
      sellerId: seller.id,
      title: "Zaino Antifurto Urban",
      description: "Zaino da viaggio con scomparto laptop 15.6\", tasca antifurto nascosta, presa USB integrata e tessuto impermeabile.",
      specsJson: { capacity: "25L", laptop: "15.6 inch", features: "USB port, hidden pocket" },
      priceCents: 6490,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      pointsEligible: true,
      pointsPrice: 32
    },
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-dddddddddddd",
      sellerId: seller.id,
      title: "Organizer Valigia Set",
      description: "Set 8 pezzi di organizer compressi per valigia. Risparmia spazio e mantieni ordine durante i viaggi.",
      specsJson: { pieces: 8, material: "Nylon ripstop", compression: "50%" },
      priceCents: 2490,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      pointsEligible: false,
      pointsPrice: null
    },
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-eeeeeeeeeeee",
      sellerId: seller.id,
      title: "Cuscino da Viaggio Memory",
      description: "Cuscino cervicale in memory foam con supporto regolabile e custodia compatta. Ideale per voli lunghi.",
      specsJson: { fill: "Memory foam", cover: "Bamboo fabric", weight: "280g" },
      priceCents: 2990,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      pointsEligible: false,
      pointsPrice: null
    },
    // === UFFICIO ===
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-ffffffffffff",
      sellerId: seller.id,
      title: "Supporto Laptop Ergonomico",
      description: "Stand in alluminio con altezza regolabile e rotazione 360°. Migliora la postura e riduce l'affaticamento.",
      specsJson: { material: "Alluminio 6063", compatibility: "10-17 inch", height: "15-21cm" },
      priceCents: 4490,
      currency: "EUR",
      status: ProductStatus.APPROVED,
      isOutOfStock: false,
      pointsEligible: true,
      pointsPrice: 22
    }
  ];

  await prisma.product.createMany({
    data: products,
    skipDuplicates: true
  });

  // Add product media (images)
  const productMedia = [
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-111111111111", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&q=80", sortOrder: 0 },
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-222222222222", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1622782914767-404fb9ab3f57?w=800&q=80", sortOrder: 0 },
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-333333333333", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&q=80", sortOrder: 0 },
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-444444444444", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80", sortOrder: 0 },
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-555555555555", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80", sortOrder: 0 },
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-666666666666", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=80", sortOrder: 0 },
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-777777777777", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80", sortOrder: 0 },
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-888888888888", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80", sortOrder: 0 },
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-999999999999", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80", sortOrder: 0 },
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-aaaaaaaaaaaa", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", sortOrder: 0 },
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-bbbbbbbbbbbb", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80", sortOrder: 0 },
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-cccccccccccc", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80", sortOrder: 0 },
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-dddddddddddd", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1553531087-b25a0b9b0b9d?w=800&q=80", sortOrder: 0 },
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-eeeeeeeeeeee", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1520087619250-584c0cbd35e8?w=800&q=80", sortOrder: 0 },
    { productId: "7f3a0e2b-2c8c-4c1a-9b16-ffffffffffff", type: ProductMediaType.IMAGE, url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80", sortOrder: 0 }
  ];

  await prisma.productMedia.createMany({
    data: productMedia,
    skipDuplicates: true
  });

  const posts = [
    {
      id: "8f3a0e2b-2c8c-4c1a-9b16-111111111111",
      type: ContentPostType.NEWS,
      title: "Come riconoscere le truffe dei pagamenti",
      slug: "truffe-pagamenti-online",
      excerpt: "Segnali pratici per evitare richieste di pagamento sospette.",
      body: "Evitare pagamenti non tracciati, verificare il venditore e diffidare delle urgenze.",
      tags: ["sicurezza", "pagamenti", "scams"],
      status: ContentPostStatus.PUBLISHED,
      publishedAt: new Date()
    },
    {
      id: "8f3a0e2b-2c8c-4c1a-9b16-222222222222",
      type: ContentPostType.NEWS,
      title: "Falsi corrieri e tracking ingannevoli",
      slug: "falsi-corrieri-tracking",
      excerpt: "Come riconoscere i messaggi di consegna falsi.",
      body: "Controlla sempre il dominio, evita link abbreviati e usa l'area clienti ufficiale.",
      tags: ["phishing", "consegne", "scams"],
      status: ContentPostStatus.PUBLISHED,
      publishedAt: new Date()
    },
    {
      id: "8f3a0e2b-2c8c-4c1a-9b16-333333333333",
      type: ContentPostType.NEWS,
      title: "Annunci fasulli sui marketplace",
      slug: "annunci-fasulli-marketplace",
      excerpt: "Pattern comuni negli annunci fraudolenti.",
      body: "Prezzi troppo bassi, richieste fuori piattaforma e documenti non verificabili.",
      tags: ["marketplace", "annunci", "scams"],
      status: ContentPostStatus.PUBLISHED,
      publishedAt: new Date()
    }
  ];

  await prisma.contentPost.createMany({
    data: posts,
    skipDuplicates: true
  });

  console.log("Seed completed", {
    plans: [accessoPlan.code, tutelaPlan.code],
    admin: admin.email,
    seller: seller.email,
    member: member.email,
    products: products.length,
    posts: posts.length
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
