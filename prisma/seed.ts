import { PrismaClient } from "@prisma/client";

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

  const admin = await prisma.user.upsert({
    where: { email: "admin@obaldi.local" },
    update: { role: "ADMIN", emailVerifiedAt: new Date() },
    create: {
      email: "admin@obaldi.local",
      role: "ADMIN",
      emailVerifiedAt: new Date()
    }
  });

  const seller = await prisma.user.upsert({
    where: { email: "seller@obaldi.local" },
    update: { role: "SELLER", emailVerifiedAt: new Date() },
    create: {
      email: "seller@obaldi.local",
      role: "SELLER",
      emailVerifiedAt: new Date()
    }
  });

  const products = [
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-111111111111",
      sellerId: seller.id,
      title: "Kit sicurezza digitale",
      description: "Guida pratica e checklist per acquisti online.",
      specsJson: { format: "pdf", pages: 42 },
      priceCents: 490,
      currency: "EUR",
      status: "APPROVED",
      isOutOfStock: false,
      pointsEligible: true,
      pointsPrice: 5
    },
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-222222222222",
      sellerId: seller.id,
      title: "Guida ai marketplace affidabili",
      description: "Lista aggiornata di best practice per venditori e acquirenti.",
      specsJson: { format: "pdf", pages: 30 },
      priceCents: 390,
      currency: "EUR",
      status: "APPROVED",
      isOutOfStock: false,
      pointsEligible: false,
      pointsPrice: null
    },
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-333333333333",
      sellerId: seller.id,
      title: "Checklist antifrode premium",
      description: "Checklist avanzata per prevenire truffe ricorrenti.",
      specsJson: { format: "pdf", pages: 58 },
      priceCents: 790,
      currency: "EUR",
      status: "APPROVED",
      isOutOfStock: true,
      pointsEligible: true,
      pointsPrice: 8
    },
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-444444444444",
      sellerId: seller.id,
      title: "Report trimestrale sicurezza",
      description: "Analisi delle principali truffe online del trimestre.",
      specsJson: { format: "pdf", pages: 18 },
      priceCents: 590,
      currency: "EUR",
      status: "PENDING",
      isOutOfStock: false,
      pointsEligible: false,
      pointsPrice: null
    },
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-555555555555",
      sellerId: seller.id,
      title: "Toolkit per venditori",
      description: "Modelli e procedure per annunci chiari e sicuri.",
      specsJson: { format: "zip", items: 12 },
      priceCents: 990,
      currency: "EUR",
      status: "DRAFT",
      isOutOfStock: false,
      pointsEligible: false,
      pointsPrice: null
    },
    {
      id: "7f3a0e2b-2c8c-4c1a-9b16-666666666666",
      sellerId: seller.id,
      title: "Checkup listing ecommerce",
      description: "Valutazione standard per migliorare la sicurezza listings.",
      specsJson: { format: "service", durationDays: 5 },
      priceCents: 1290,
      currency: "EUR",
      status: "REJECTED",
      isOutOfStock: false,
      pointsEligible: false,
      pointsPrice: null
    }
  ];

  await prisma.product.createMany({
    data: products,
    skipDuplicates: true
  });

  const posts = [
    {
      id: "8f3a0e2b-2c8c-4c1a-9b16-111111111111",
      type: "NEWS",
      title: "Come riconoscere le truffe dei pagamenti",
      slug: "truffe-pagamenti-online",
      excerpt: "Segnali pratici per evitare richieste di pagamento sospette.",
      body: "Evitare pagamenti non tracciati, verificare il venditore e diffidare delle urgenze.",
      tags: ["sicurezza", "pagamenti", "scams"],
      status: "PUBLISHED",
      publishedAt: new Date()
    },
    {
      id: "8f3a0e2b-2c8c-4c1a-9b16-222222222222",
      type: "NEWS",
      title: "Falsi corrieri e tracking ingannevoli",
      slug: "falsi-corrieri-tracking",
      excerpt: "Come riconoscere i messaggi di consegna falsi.",
      body: "Controlla sempre il dominio, evita link abbreviati e usa l'area clienti ufficiale.",
      tags: ["phishing", "consegne", "scams"],
      status: "PUBLISHED",
      publishedAt: new Date()
    },
    {
      id: "8f3a0e2b-2c8c-4c1a-9b16-333333333333",
      type: "NEWS",
      title: "Annunci fasulli sui marketplace",
      slug: "annunci-fasulli-marketplace",
      excerpt: "Pattern comuni negli annunci fraudolenti.",
      body: "Prezzi troppo bassi, richieste fuori piattaforma e documenti non verificabili.",
      tags: ["marketplace", "annunci", "scams"],
      status: "PUBLISHED",
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
