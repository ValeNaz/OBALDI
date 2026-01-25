
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/src/core/db";
import { enforceSameOrigin } from "@/src/core/security/csrf";

export async function POST(request: Request) {
    // CSRF check
    const csrf = enforceSameOrigin(request);
    if (csrf) return csrf;

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const productId = formData.get("productId") as string;
        const mediaType = formData.get("mediaType") as "IMAGE" | "VIDEO";

        if (!file || !productId) {
            return NextResponse.json(
                { error: { message: "File or Product ID missing." } },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads");
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/${fileName}`;

        // Create DB record
        const lastMedia = await prisma.productMedia.aggregate({
            where: { productId },
            _max: { sortOrder: true }
        });
        const sortOrder = (lastMedia._max.sortOrder ?? 0) + 1;

        const media = await prisma.productMedia.create({
            data: {
                productId,
                type: mediaType || (file.type.startsWith("video/") ? "VIDEO" : "IMAGE"),
                url: publicUrl,
                storagePath: filePath, // checking usage?
                sortOrder
            }
        });

        return NextResponse.json({ media });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: { message: "Failed to upload file." } },
            { status: 500 }
        );
    }
}
