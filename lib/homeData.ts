export type Category = {
  id: string;
  label: string;
  href: string;
};

export type Product = {
  id: string;
  title: string;
  image: string;
  description?: string;
  priceCents?: number;
  currency?: string;
  rating?: number;
  ratingCount?: number;
  badge?: string;
  shippingNote?: string;
  premiumOnly?: boolean;
  pointsEligible?: boolean;
  pointsPrice?: number | null;
};

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  priceNote: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
};

export type PromoModule = {
  id: string;
  title: string;
  ctaLabel: string;
  ctaHref: string;
  kind: "resume" | "event" | "offers" | "video";
  items: Product[];
  meta?: string;
};

export type SplitModule = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
};

export type CarouselSection = {
  id: string;
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
  pageLabel?: string;
  variant: "compact" | "full";
  items: Product[];
};

export type HistoryItem = {
  id: string;
  title: string;
  image: string;
};

const heroImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGMUY1RjkiLz48L3N2Zz4=";

const makeProduct = (id: number, title: string, priceCents?: number): Product => ({
  id: `prod-${id}`,
  title,
  image: heroImage,
  priceCents,
  currency: priceCents ? "EUR" : undefined,
  rating: 4.6,
  ratingCount: 128 + id,
  shippingNote: "Spedizione inclusa per membri"
});

export const categories: Category[] = [
  { id: "ELECTRONICS", label: "Tecnologia", href: "/marketplace" },
  { id: "HOME", label: "Casa e cucina", href: "/marketplace" },
  { id: "SPORTS", label: "Sport e benessere", href: "/marketplace" },
  { id: "FASHION", label: "Moda", href: "/marketplace" },
  { id: "BEAUTY", label: "Bellezza", href: "/marketplace" },
  { id: "OTHER", label: "Altro", href: "/marketplace" }
];

export const heroSlides: HeroSlide[] = [
  {
    id: "hero-1",
    title: "Scopri prodotti verificati per vivere meglio",
    subtitle: "Selezioni curate, senza pressioni e senza rumore inutile.",
    priceNote: "Da 29€ al mese con membership attiva",
    ctaLabel: "Entra nel marketplace",
    ctaHref: "/marketplace",
    image: heroImage
  },
  {
    id: "hero-2",
    title: "Collezioni essenziali, pronte da usare",
    subtitle: "Solo prodotti chiari e trasparenti, approvati dal team.",
    priceNote: "Spedizione sempre inclusa",
    ctaLabel: "Scopri le collezioni",
    ctaHref: "/marketplace",
    image: heroImage
  },
  {
    id: "hero-3",
    title: "Proteggi i tuoi acquisti online",
    subtitle: "Supporto reale e contenuti utili per evitare truffe.",
    priceNote: "Assistenza dedicata per i membri Tutela",
    ctaLabel: "Vai alla Tutela",
    ctaHref: "/membership",
    image: heroImage
  }
];

const baseProducts = [
  makeProduct(1, "Set cucina essenziale", 5900),
  makeProduct(2, "Lampada smart da scrivania", 4200),
  makeProduct(3, "Kit benessere giornaliero", 3900),
  makeProduct(4, "Audio speaker compatto", 7400),
  makeProduct(5, "Organizer da viaggio", 2600),
  makeProduct(6, "Accessory pack workspace", 5200),
  makeProduct(7, "Camera security home", 10900),
  makeProduct(8, "Supporto ergonomico", 3100),
  makeProduct(9, "Kit fitness indoor", 8200),
  makeProduct(10, "Drinkware premium", 2800),
  makeProduct(11, "Luce ambiente soft", 3600),
  makeProduct(12, "Zaino smart travel", 8900)
];

export const promoModules: PromoModule[] = [
  {
    id: "module-resume",
    title: "Riprendi da dove hai lasciato",
    ctaLabel: "Riprendi",
    ctaHref: "/marketplace",
    kind: "resume",
    items: baseProducts.slice(0, 4)
  },
  {
    id: "module-event",
    title: "Live di approfondimento",
    ctaLabel: "Imposta promemoria",
    ctaHref: "/news",
    kind: "event",
    items: [baseProducts[4]],
    meta: "Oggi, 21:00"
  },
  {
    id: "module-offers",
    title: "Offerte top",
    ctaLabel: "Vedi selezione",
    ctaHref: "/marketplace",
    kind: "offers",
    items: baseProducts.slice(4, 8).map((item, index) => ({
      ...item,
      badge: index % 2 === 0 ? "Top 10%" : "Top 5%"
    }))
  },
  {
    id: "module-video",
    title: "Serie guida Obaldi",
    ctaLabel: "Guarda ora",
    ctaHref: "/news",
    kind: "video",
    items: [baseProducts[8]]
  }
];

export const splitModules = {
  featured: {
    id: "split-featured",
    title: "Consigliato per te",
    subtitle: "Una selezione ampia e pronta per la settimana.",
    ctaLabel: "Scopri di piu",
    ctaHref: "/marketplace",
    image: heroImage
  } satisfies SplitModule,
  side: [
    {
      id: "split-podcast",
      title: "Podcast Obaldi",
      subtitle: "Consigli brevi, zero rumore.",
      ctaLabel: "Ascolta ora",
      ctaHref: "/news",
      image: heroImage
    },
    {
      id: "split-accessori",
      title: "Accessori essenziali",
      subtitle: "Solo il necessario, scelto per te.",
      ctaLabel: "Vedi accessori",
      ctaHref: "/marketplace",
      image: heroImage
    }
  ] satisfies SplitModule[]
};

export const carouselSections: CarouselSection[] = [
  {
    id: "cart-based",
    title: "In base al tuo carrello",
    ctaLabel: "Rivedi il carrello",
    ctaHref: "/orders",
    variant: "compact",
    items: baseProducts.slice(0, 8)
  },
  {
    id: "chosen",
    title: "Scelti per te",
    ctaLabel: "Scopri di piu",
    ctaHref: "/marketplace",
    variant: "compact",
    items: baseProducts.slice(4, 12)
  },
  {
    id: "explore",
    title: "Esplora altri articoli",
    pageLabel: "Pagina 1 di 4",
    variant: "full",
    items: baseProducts.slice(0, 10).map((item, index) => ({
      ...item,
      badge: index % 3 === 0 ? "Novita" : undefined,
      rating: 4.4 + (index % 3) * 0.2,
      ratingCount: 120 + index * 4
    }))
  }
];

export const collectionModules: PromoModule[] = [
  {
    id: "collection-1",
    title: "Toolkit casa",
    ctaLabel: "Scopri di piu",
    ctaHref: "/marketplace",
    kind: "resume",
    items: baseProducts.slice(0, 4)
  },
  {
    id: "collection-2",
    title: "Energia e benessere",
    ctaLabel: "Scopri di piu",
    ctaHref: "/marketplace",
    kind: "offers",
    items: baseProducts.slice(4, 8)
  },
  {
    id: "collection-3",
    title: "Smart studio",
    ctaLabel: "Scopri di piu",
    ctaHref: "/marketplace",
    kind: "resume",
    items: baseProducts.slice(2, 6)
  },
  {
    id: "collection-4",
    title: "Viaggio essenziale",
    ctaLabel: "Scopri di piu",
    ctaHref: "/marketplace",
    kind: "video",
    items: baseProducts.slice(6, 10)
  }
];

export const stripSections: CarouselSection[] = [
  {
    id: "offers-strip",
    title: "Offerte essenziali",
    ctaLabel: "Vedi tutto",
    ctaHref: "/marketplace",
    variant: "compact",
    items: baseProducts.slice(1, 7)
  },
  {
    id: "essentials-strip",
    title: "Essenziali per ogni giorno",
    ctaLabel: "Vedi tutto",
    ctaHref: "/marketplace",
    variant: "compact",
    items: baseProducts.slice(5, 11)
  }
];

export const historyItems: HistoryItem[] = baseProducts.slice(0, 12).map((item) => ({
  id: `history-${item.id}`,
  title: item.title,
  image: item.image
}));
