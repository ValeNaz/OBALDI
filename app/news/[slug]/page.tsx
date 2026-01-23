import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/src/core/db";
import { getAppBaseUrl } from "@/src/core/config";

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await prisma.contentPost.findUnique({
    where: { slug: params.slug }
  });

  if (!post || post.status !== "PUBLISHED") {
    return {
      title: "News | Obaldi"
    };
  }

  return {
    title: `${post.title} | Obaldi`,
    description: post.excerpt ?? "Notizie e guide per riconoscere truffe online."
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const post = await prisma.contentPost.findUnique({
    where: { slug: params.slug }
  });

  if (!post || post.status !== "PUBLISHED") {
    return (
      <div className="container-max page-pad pt-28 md:pt-32 pb-20">
        <h1 className="text-3xl font-display font-bold text-[#0b224e]">Articolo non trovato</h1>
        <Link href="/news" className="text-sm font-bold text-slate-500 mt-4 inline-block">
          Torna alle news
        </Link>
      </div>
    );
  }

  const baseUrl = getAppBaseUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt ?? "Notizie e guide per riconoscere truffe online.",
    datePublished: post.publishedAt?.toISOString() ?? post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: `${baseUrl}/news/${post.slug}`,
    publisher: {
      "@type": "Organization",
      name: "Obaldi",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/media/logo_Obaldi.png`
      }
    }
  };

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Link href="/news" className="text-sm font-bold text-slate-400 hover:text-[#0b224e] mb-8 inline-block">
        ← Torna alle news
      </Link>
      <div className="glass-panel p-8">
        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
          News
        </p>
        <h1 className="text-4xl font-display font-bold text-[#0b224e] mt-3">{post.title}</h1>
        {post.publishedAt && (
          <p className="text-sm text-slate-400 mt-2">
            {new Date(post.publishedAt).toLocaleDateString("it-IT")}
          </p>
        )}
        {post.excerpt && <p className="text-lg text-slate-500 mt-4">{post.excerpt}</p>}
      </div>
      <div className="prose prose-slate max-w-none mt-8 glass-card p-8">
        {post.body}
      </div>
    </div>
  );
}
