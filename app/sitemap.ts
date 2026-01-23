import type { MetadataRoute } from "next";
import { prisma } from "@/src/core/db";
import { getAppBaseUrl } from "@/src/core/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAppBaseUrl();

  const staticRoutes = [
    "",
    "/membership",
    "/about",
    "/marketplace",
    "/news",
    "/privacy",
    "/termini",
    "/contatti",
    "/faq",
    "/resi-rimborsi"
  ];

  const [products, posts] = await Promise.all([
    prisma.product.findMany({
      where: { status: "APPROVED" },
      select: { id: true, updatedAt: true }
    }),
    prisma.contentPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true }
    })
  ]);

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updatedAt
  }));

  const newsRoutes = posts.map((post) => ({
    url: `${baseUrl}/news/${post.slug}`,
    lastModified: post.updatedAt
  }));

  const baseRoutes = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`
  }));

  return [...baseRoutes, ...productRoutes, ...newsRoutes];
}
