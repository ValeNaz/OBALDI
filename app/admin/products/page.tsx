import { prisma } from "@/src/core/db";
import { requireRole, requireSession } from "@/src/core/auth/guard";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import ProductListTable from "@/components/admin/ProductListTable";

export const metadata = {
    title: "Gestione Prodotti | Admin Console",
};

export default async function AdminProductsPage({
    searchParams,
}: {
    searchParams: { status?: string; q?: string };
}) {
    const session = await requireSession();
    requireRole(session.user.role, ["ADMIN"]);

    const status = searchParams.status || "ALL"; // ALL, PENDING, APPROVED, DRAFT
    const query = searchParams.q || "";

    const whereClause: any = {};

    if (status !== "ALL") {
        whereClause.status = status;
    }

    if (query) {
        whereClause.title = { contains: query, mode: "insensitive" };
    }


    const products = await prisma.product.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
            seller: true,
            variants: true,
            _count: {
                select: { variants: true }
            }
        }
    });

    const handleDelete = async (id: string) => {
        "use client"; // This is problematic in a Server Component. 
        // I should probably move the delete logic to a client wrapper or use a trick.
        // Actually, let's keep the table as a Client Component (it is) and pass the handler.
    };

    return (
        <div className="container-max page-pad py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#0b224e]">Prodotti</h1>
                    <p className="text-slate-500">Gestisci il catalogo e le varianti</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="btn btn-primary flex items-center gap-2"
                >
                    <FaPlus /> Nuovo Prodotto
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <Link
                    href="/admin/products"
                    className={`px-4 py-2 rounded-full text-sm font-bold ${status === "ALL" ? "bg-[#0b224e] text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                    Tutti
                </Link>
                <Link
                    href="/admin/products?status=APPROVED"
                    className={`px-4 py-2 rounded-full text-sm font-bold ${status === "APPROVED" ? "bg-[#0b224e] text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                    Attivi
                </Link>
                <Link
                    href="/admin/products?status=PENDING"
                    className={`px-4 py-2 rounded-full text-sm font-bold ${status === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                    In Attesa
                </Link>
                <Link
                    href="/admin/products?status=DRAFT"
                    className={`px-4 py-2 rounded-full text-sm font-bold ${status === "DRAFT" ? "bg-gray-100 text-gray-800" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                    Bozze
                </Link>
            </div>

            <ProductListTable
                products={products as any}
                basePath="/admin/products"
                role="ADMIN"
            />
        </div>
    );
}
