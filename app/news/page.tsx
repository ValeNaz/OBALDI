import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/src/core/db";

export const metadata: Metadata = {
  title: "News e articoli anti-truffa | Obaldi",
  description: "Notizie e guide per riconoscere truffe online e acquisti rischiosi."
};

export default async function NewsPage() {
  const posts = await prisma.contentPost.findMany({
    where: { status: "PUBLISHED", type: "NEWS" },
    orderBy: { publishedAt: "desc" }
  });

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-20">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e]">News e articoli anti-truffa</h1>
        <p className="text-slate-500 mt-3 max-w-2xl">
          Aggiornamenti e guide pratiche per riconoscere segnali di rischio negli acquisti online.
        </p>
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/news/${post.slug}`}
            className="group glass-card card-pad glass-hover"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-400 font-semibold">
              <span>News</span>
              {post.publishedAt && (
                <span>{new Date(post.publishedAt).toLocaleDateString("it-IT")}</span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-[#0b224e] mt-4 group-hover:text-[#a41f2e] transition">
              {post.title}
            </h2>
            {post.excerpt && <p className="text-slate-500 mt-3">{post.excerpt}</p>}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 text-xs text-slate-500">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-slate-100 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
