"use client";

import Link from "next/link";
import { FaEdit, FaTrash, FaPaperPlane } from "react-icons/fa";
import { ProductStatus } from "@prisma/client";

type ProductWithCount = {
    id: string;
    title: string;
    category: string;
    status: ProductStatus;
    priceCents: number;
    stockQty: number;
    trackInventory: boolean;
    _count: {
        variants: number;
    };
    variants?: { stockQty: number }[];
};

type ProductListTableProps = {
    products: ProductWithCount[];
    basePath: string; // e.g. "/admin/products" or "/seller/products"
    role: "ADMIN" | "SELLER";
    onDelete?: (id: string) => Promise<void>;
    onSubmitForReview?: (id: string) => Promise<void>;
};

const ProductListTable = ({ products, basePath, role, onDelete, onSubmitForReview }: ProductListTableProps) => {
    return (
        <div className="glass-panel overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-bold">
                    <tr>
                        <th className="px-6 py-4">Prodotto</th>
                        <th className="px-6 py-4">Stato</th>
                        <th className="px-6 py-4">Prezzo</th>
                        <th className="px-6 py-4">Varianti</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4 text-right">Azioni</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                Nessun prodotto trovato.
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50/50 transition">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-[#0b224e]">{product.title}</div>
                                    <div className="text-xs text-slate-400">{product.category}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                        product.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                            product.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                                "bg-slate-100 text-slate-600"
                                        }`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-[#0b224e]">
                                    €{(product.priceCents / 100).toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                    {product._count.variants > 0 ? (
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                            {product._count.variants} varianti
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 text-xs">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {product.trackInventory ? (
                                        <span className="font-semibold text-slate-700">
                                            {product._count.variants > 0
                                                ? product.variants?.reduce((acc, v) => acc + v.stockQty, 0)
                                                : product.stockQty}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 font-bold text-lg">∞</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end items-center gap-2">
                                        {role === "SELLER" && (product.status === "DRAFT" || product.status === "REJECTED") && onSubmitForReview && (
                                            <button
                                                onClick={() => onSubmitForReview(product.id)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="Invia per revisione"
                                            >
                                                <FaPaperPlane size={14} />
                                            </button>
                                        )}
                                        <Link
                                            href={`${basePath}/${product.id}`}
                                            className="p-2 text-[#0b224e] hover:bg-slate-100 rounded-lg transition"
                                            title="Gestisci / Modifica"
                                        >
                                            <FaEdit size={14} />
                                        </Link>
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(product.id)}
                                                className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                title="Elimina"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductListTable;
