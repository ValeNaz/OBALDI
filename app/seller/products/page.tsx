import { prisma } from "@/src/core/db";
import { requireRole, requireSession } from "@/src/core/auth/guard";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import SellerProductsTableWrapper from "@/components/seller/SellerProductsTableWrapper";

export const metadata = {
    title: "I Miei Prodotti | Seller Console",
};

export default async function SellerProductsPage({
    searchParams,
}: {
    searchParams: { status?: string; q?: string };
}) {
    const session = await requireSession();
    requireRole(session.user.role, ["SELLER"]);

    const status = searchParams.status || "ALL";
    const query = searchParams.q || "";

    const whereClause: any = {
        sellerId: session.user.id
    };

    if (status !== "ALL") {
        whereClause.status = status;
    }

    if (query) {
        whereClause.title = { contains: query, mode: "insensitive" };
    }

    const products = await prisma.product.findMany({
        where: whereClause,
        orderBy: { updatedAt: "desc" },
        include: {
            variants: {
                select: { stockQty: true }
            },
            media: {
                orderBy: { sortOrder: "asc" },
                take: 1
            },
            _count: {
                select: { variants: true }
            }
        }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-[#0b224e]">Catalogo</h2>
                    <p className="text-slate-500">Gestisci il tuo catalogo prodotti e le varianti</p>
                </div>
                <Link
                    href="/seller/products/new"
                    className="btn btn-primary flex items-center gap-2"
                >
                    <FaPlus /> Nuovo Prodotto
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                {(["ALL", "APPROVED", "PENDING", "DRAFT", "REJECTED"] as const).map(s => (
                    <Link
                        key={s}
                        href={`/seller/products?status=${s}`}
                        className={`px-4 py-2 rounded-full text-sm font-bold ${status === s ? "bg-[#0b224e] text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                    >
                        {s === "ALL" ? "Tutti" : s === "APPROVED" ? "Attivi" : s === "PENDING" ? "In Revisione" : s === "DRAFT" ? "Bozze" : "Respinti"}
                    </Link>
                ))}
            </div>

            <SellerProductsTableWrapper products={products} />
        </div>
    );
}
