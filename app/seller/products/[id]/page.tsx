import { notFound } from "next/navigation";
import { prisma } from "@/src/core/db";
import { requireRole, requireSession } from "@/src/core/auth/guard";
import ProductEditor from "@/components/admin/ProductEditor";

export async function generateMetadata({ params }: { params: { id: string } }) {
    const product = await prisma.product.findUnique({
        where: { id: params.id },
        select: { title: true }
    });
    return {
        title: product ? `${product.title} | Gestione` : "Prodotto non trovato"
    };
}

export default async function SellerEditProductPage({ params }: { params: { id: string } }) {
    const session = await requireSession();
    requireRole(session.user.role, ["SELLER", "ADMIN"]);

    const product = await prisma.product.findUnique({
        where: { id: params.id },
        include: {
            media: { orderBy: { sortOrder: "asc" } },
            variants: { orderBy: { createdAt: "asc" } },
            options: { orderBy: { position: "asc" } }
        }
    });

    if (!product) {
        notFound();
    }

    // Ensure ownership for SELLER
    if (session.user.role === "SELLER" && product.sellerId !== session.user.id) {
        throw new Error("Non autorizzato");
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <ProductEditor product={product} currentUser={session.user} />
        </div>
    );
}
