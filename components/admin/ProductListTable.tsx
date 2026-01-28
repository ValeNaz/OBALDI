import { useState } from "react";
import Link from "next/link";
import { FaEdit, FaTrash, FaPaperPlane, FaBox, FaPlus, FaCheckSquare } from "react-icons/fa";
import { ProductStatus } from "@prisma/client";
import { EmptyState } from "@/components/ui/EmptyState";

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
    media?: { url: string }[];
};

type ProductListTableProps = {
    products: ProductWithCount[];
    basePath: string; // e.g. "/admin/products" or "/seller/products"
    role: "ADMIN" | "SELLER";
    onDelete?: (id: string) => Promise<void>;
    onSubmitForReview?: (id: string) => Promise<void>;
    onApprove?: (id: string) => Promise<void>;
    onReject?: (id: string) => Promise<void>;
    onBulkAction?: (action: "DELETE" | "APPROVE" | "REJECT", ids: string[]) => Promise<void>;
};

const ProductListTable = ({ products, basePath, role, onDelete, onSubmitForReview, onApprove, onReject, onBulkAction }: ProductListTableProps) => {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const toggleAll = () => {
        if (selected.size === products.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(products.map(p => p.id)));
        }
    };

    const toggleOne = (id: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const handleBulkActionClick = async (action: "DELETE" | "APPROVE" | "REJECT") => {
        if (!onBulkAction) return;
        setIsBulkProcessing(true);
        await onBulkAction(action, Array.from(selected));
        setIsBulkProcessing(false);
        setSelected(new Set());
    };

    return (
        <div className="space-y-4">
            {/* Bulk Actions Toolbar */}
            {selected.size > 0 && (
                <div className="bg-[#0b224e] text-white px-6 py-3 rounded-xl flex items-center justify-between shadow-lg animate-fade-in-soft sticky top-4 z-40">
                    <div className="flex items-center gap-3 font-bold text-sm">
                        <FaCheckSquare className="text-blue-300" />
                        <span>{selected.size} selezionati</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {role === "ADMIN" && (
                            <>
                                <button
                                    onClick={() => handleBulkActionClick("APPROVE")}
                                    disabled={isBulkProcessing}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-bold transition disabled:opacity-50"
                                >
                                    APPROVA
                                </button>
                                <button
                                    onClick={() => handleBulkActionClick("REJECT")}
                                    disabled={isBulkProcessing}
                                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-bold transition disabled:opacity-50"
                                >
                                    RIFIUTA
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => handleBulkActionClick("DELETE")}
                            disabled={isBulkProcessing}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition disabled:opacity-50"
                        >
                            ELIMINA
                        </button>
                    </div>
                </div>
            )}

            <div className="glass-panel overflow-x-auto lg:overflow-x-visible custom-scrollbar">
                <table className="w-full min-w-[800px] lg:min-w-0 lg:w-full text-left border-collapse table-auto">
                    <thead className="bg-slate-50/80 text-slate-500 text-[10px] uppercase tracking-widest font-bold border-b border-slate-100">
                        <tr>
                            <th className="px-4 py-4 w-12 text-center">
                                <input
                                    type="checkbox"
                                    checked={products.length > 0 && selected.size === products.length}
                                    onChange={toggleAll}
                                    className="rounded border-slate-300 transform scale-110 cursor-pointer accent-[#0b224e]"
                                />
                            </th>
                            <th className="px-4 py-4 w-16 text-center">Media</th>
                            <th className="px-4 py-4">Prodotto</th>
                            <th className="px-4 py-4 hidden sm:table-cell text-center">Stato</th>
                            <th className="px-4 py-4 hidden md:table-cell text-center">Prezzo</th>
                            <th className="px-4 py-4 hidden lg:table-cell text-center">Varianti</th>
                            <th className="px-4 py-4 hidden sm:table-cell text-center">Stock</th>
                            <th className="px-4 py-4 text-right pr-6 md:pr-8">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12">
                                    <EmptyState
                                        icon={<FaBox size={24} />}
                                        title="Nessun prodotto"
                                        description="Non abbiamo trovato prodotti che corrispondano ai criteri di ricerca."
                                        action={
                                            role === "ADMIN" ? (
                                                <Link href={basePath + "/new"} className="btn btn-primary text-xs">
                                                    Crea primo prodotto
                                                </Link>
                                            ) : undefined
                                        }
                                    />
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} className={`hover:bg-slate-50/80 transition-colors group ${selected.has(product.id) ? "bg-blue-50/50" : ""}`}>
                                    <td className="px-4 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selected.has(product.id)}
                                            onChange={() => toggleOne(product.id)}
                                            className="rounded border-slate-300 transform scale-110 cursor-pointer accent-[#0b224e]"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="w-10 h-10 mx-auto rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200/60 shadow-sm transition-transform group-hover:scale-105">
                                            {product.media && product.media[0] ? (
                                                <img src={product.media[0].url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-slate-300">
                                                    <FaBox size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-[#0b224e] dark:text-slate-200 line-clamp-1 text-xs md:text-sm mb-1">{product.title}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-slate-100/80 text-slate-500 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold border border-slate-200/50">
                                                {product.category}
                                            </span>
                                            {/* Status badge for mobile */}
                                            <span className={`sm:hidden px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${product.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                                product.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                                    product.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                                        "bg-slate-100 text-slate-600"
                                                }`}>
                                                {product.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden sm:table-cell text-center">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight ${product.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                            product.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                                product.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                                    "bg-slate-100 text-slate-600"
                                            }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 font-mono font-bold text-[#0b224e] hidden md:table-cell text-center text-xs">
                                        €{(product.priceCents / 100).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-4 hidden lg:table-cell text-center">
                                        {product._count.variants > 0 ? (
                                            <span className="bg-blue-50 text-[#0b224e] px-2 py-1 rounded text-[10px] font-bold border border-blue-100/50">
                                                {product._count.variants} varianti
                                            </span>
                                        ) : (
                                            <span className="text-slate-300 text-xs font-light">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 hidden sm:table-cell text-center">
                                        {product.trackInventory ? (
                                            <div className="flex flex-col items-center">
                                                <span className={`font-bold text-xs ${((product._count.variants > 0 ? product.variants?.reduce((acc, v) => acc + v.stockQty, 0) : product.stockQty) || 0) <= 5 ? "text-red-500" : "text-slate-700"}`}>
                                                    {product._count.variants > 0
                                                        ? product.variants?.reduce((acc, v) => acc + v.stockQty, 0)
                                                        : product.stockQty}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 font-bold text-base">∞</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 pr-6 md:pr-8">
                                        <div className="flex justify-end items-center gap-2">
                                            {role === "SELLER" && (product.status === "DRAFT" || product.status === "REJECTED") && onSubmitForReview && (
                                                <button
                                                    onClick={() => onSubmitForReview(product.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Invia per revisione"
                                                >
                                                    <FaPaperPlane size={14} />
                                                </button>
                                            )}
                                            {role === "ADMIN" && (
                                                <>
                                                    {product.status !== "APPROVED" && onApprove && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onApprove(product.id); }}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 hover:shadow-md hover:shadow-green-100 transition-all font-bold text-[9px] shrink-0 active:scale-95"
                                                        >
                                                            <FaPaperPlane size={10} className="md:hidden lg:inline" />
                                                            <span className="hidden md:inline">APPROVA</span>
                                                        </button>
                                                    )}
                                                    {product.status !== "REJECTED" && onReject && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onReject(product.id); }}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-[#a41f2e] text-white rounded-full hover:bg-red-800 hover:shadow-md hover:shadow-red-100 transition-all font-bold text-[9px] shrink-0 active:scale-95"
                                                        >
                                                            <FaTrash size={10} className="md:hidden lg:inline" />
                                                            <span className="hidden md:inline">{product.status === "APPROVED" ? "SOSPENDI" : "RIFIUTA"}</span>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            <div className="w-[1px] h-4 bg-slate-200 mx-1 hidden md:block" />
                                            <Link
                                                href={`${basePath}/${product.id}`}
                                                className="p-2 text-[#0b224e] hover:bg-slate-100 hover:text-blue-600 rounded-xl transition-all active:scale-90"
                                                title="Gestisci / Modifica"
                                            >
                                                <FaEdit size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductListTable;
