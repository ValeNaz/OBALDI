import { NextResponse } from "next/server";
import { prisma } from "@/src/core/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const options = await prisma.productOption.findMany({
            where: { product: { status: "APPROVED" } },
            select: { name: true, values: true }
        });

        const facets: Record<string, Set<string>> = {};
        for (const opt of options) {
            if (!facets[opt.name]) facets[opt.name] = new Set();
            opt.values.forEach(v => facets[opt.name].add(v));
        }

        const result: Record<string, string[]> = {};
        for (const [key, set] of Object.entries(facets)) {
            result[key] = Array.from(set).sort();
        }

        return NextResponse.json({ facets: result });
    } catch (error) {
        return NextResponse.json({ facets: {} });
    }
}
