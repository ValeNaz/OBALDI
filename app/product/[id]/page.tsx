import Link from "next/link";
import { prisma } from "@/src/core/db";
import { getAppBaseUrl } from "@/src/core/config";
import ProductClient from "./ProductClient";

type PageProps = {
  params: { id: string };
};

export default async function ProductPage({ params }: PageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      media: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          url: true,
          type: true,
          sortOrder: true
        }
      },
      variants: {
        orderBy: { createdAt: "asc" }
      },
      options: {
        orderBy: { position: "asc" }
      }
    }
  });

  if (!product || product.status !== "APPROVED") {
    return (
      <div className="container-max page-pad pt-28 md:pt-32 pb-16">
        <Link href="/marketplace" className="text-sm font-bold text-slate-400 hover:text-[#0b224e] mb-8 inline-block">
          ← Torna al Marketplace
        </Link>
        <div className="glass-panel card-pad text-center text-slate-500">
          Prodotto non disponibile.
        </div>
      </div>
    );
  }

  const baseUrl = getAppBaseUrl();
  const productUrl = `${baseUrl}/product/${product.id}`;
  const images = product.media
    .filter((media) => media.type === "IMAGE")
    .map((media) => media.url);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    url: productUrl,
    image: images.length > 0 ? images : undefined,
    brand: {
      "@type": "Brand",
      name: "Obaldi"
    },
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: (product.priceCents / 100).toFixed(2),
      availability: product.isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProductClient
        product={{
          id: product.id,
          title: product.title,
          description: product.description,
          priceCents: product.priceCents,
          currency: product.currency,
          premiumOnly: product.premiumOnly,
          pointsEligible: product.pointsEligible,
          pointsPrice: product.pointsPrice,
          media: product.media,
          stockQty: product.stockQty,
          trackInventory: product.trackInventory,
          isOutOfStock: product.isOutOfStock,
          variants: product.variants,
          options: product.options
        }}
      />
    </>
  );
}
