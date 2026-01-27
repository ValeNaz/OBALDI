"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaCheck, FaEdit, FaTrash, FaMapMarkerAlt } from "react-icons/fa";
import AddressForm from "./AddressForm";

export type Address = {
    id: string;
    label?: string;
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
};

interface AddressSelectorProps {
    selectedAddressId: string | null;
    onSelect: (addressId: string) => void;
}

const AddressSelector = ({ selectedAddressId, onSelect }: AddressSelectorProps) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);

    const fetchAddresses = async () => {
        try {
            const res = await fetch("/api/me/addresses");
            const data = await res.json();
            if (data.addresses) {
                setAddresses(data.addresses);
                // Auto-select default if nothing selected
                if (!selectedAddressId && data.addresses.length > 0) {
                    const defaultAddr = data.addresses.find((a: Address) => a.isDefault);
                    if (defaultAddr) onSelect(defaultAddr.id);
                    else onSelect(data.addresses[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch addresses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSave = async (data: any) => {
        try {
            const url = editingAddress
                ? `/api/me/addresses/${editingAddress.id}`
                : "/api/me/addresses";

            const method = editingAddress ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to save address");

            const saved = await res.json();

            // Refresh list
            await fetchAddresses();
            setShowForm(false);
            setEditingAddress(undefined);

            // Auto select new address
            if (saved.address) {
                onSelect(saved.address.id);
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Sei sicuro di voler eliminare questo indirizzo?")) return;

        try {
            await fetch(`/api/me/addresses/${id}`, { method: "DELETE" });
            await fetchAddresses();
            if (selectedAddressId === id) {
                onSelect(""); // Clear selection
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (addr: Address, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingAddress(addr);
        setShowForm(true);
    };

    if (loading) return <div className="h-20 bg-slate-50 animate-pulse rounded-2xl" />;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-[#0b224e] flex items-center gap-2">
                    <FaMapMarkerAlt className="text-slate-400" size={16} />
                    Indirizzo di Spedizione
                </h3>
                <button
                    onClick={() => {
                        setEditingAddress(undefined);
                        setShowForm(true);
                    }}
                    className="text-sm font-semibold text-[#0b224e] hover:text-[#1a3a6e] flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition"
                >
                    <FaPlus size={10} /> Nuovo
                </button>
            </div>

            <div className="grid gap-3">
                {addresses.map((addr) => (
                    <div
                        key={addr.id}
                        onClick={() => onSelect(addr.id)}
                        className={`
              relative p-4 rounded-xl border-2 transition-all cursor-pointer group
              ${selectedAddressId === addr.id
                                ? "border-[#0b224e] bg-[#f8fafc]"
                                : "border-slate-100 hover:border-slate-200 bg-white"
                            }
            `}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-[#0b224e]">{addr.fullName}</span>
                                    {addr.label && (
                                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-wide font-bold">
                                            {addr.label}
                                        </span>
                                    )}
                                    {addr.isDefault && (
                                        <span className="text-[10px] bg-[#0b224e]/10 px-1.5 py-0.5 rounded text-[#0b224e] uppercase tracking-wide font-bold">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 leading-snug">
                                    {addr.line1} {addr.line2 ? `, ${addr.line2}` : ""}
                                    <br />
                                    {addr.postalCode} {addr.city} ({addr.province})
                                    <br />
                                    {addr.country}
                                </p>
                                {addr.phone && (
                                    <p className="text-xs text-slate-400 mt-1">Tel: {addr.phone}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => handleEdit(addr, e)}
                                    className="p-1.5 text-slate-400 hover:text-[#0b224e] hover:bg-slate-100 rounded-full"
                                >
                                    <FaEdit size={14} />
                                </button>
                                <button
                                    onClick={(e) => handleDelete(addr.id, e)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        </div>

                        {selectedAddressId === addr.id && (
                            <div className="absolute top-4 right-4 text-[#0b224e]">
                                <FaCheck size={18} />
                            </div>
                        )}
                    </div>
                ))}

                {addresses.length === 0 && (
                    <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                        <p className="text-sm mb-2">Non hai ancora salvato nessun indirizzo.</p>
                        <button
                            onClick={() => {
                                setEditingAddress(undefined);
                                setShowForm(true);
                            }}
                            className="text-sm font-bold text-[#0b224e] underline"
                        >
                            Aggiungi il primo indirizzo
                        </button>
                    </div>
                )}
            </div>

            {showForm && (
                <AddressForm
                    initialData={editingAddress}
                    onSubmit={handleSave}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingAddress(undefined);
                    }}
                />
            )}
        </div>
    );
};

export default AddressSelector;
