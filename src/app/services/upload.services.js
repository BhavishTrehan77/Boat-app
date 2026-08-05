import prisma from "../lib/prisma";
import bucket from "../lib/gcs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function UploadWarrantyPDF(file, productId) {
    try {
        if (!file) {
            throw new Error("PDF file is required.");
        }
        if (file.type !== "application/pdf") {
            throw new Error("Only PDF files are allowed.");
        }

        // Sanitize file name
        const sanitizedName = (file.name || "document.pdf").replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${Date.now()}-${sanitizedName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let pdfUrl = "";

        const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
        const hasGcsCreds = Boolean(
            process.env.GOOGLE_CLIENT_EMAIL ||
            process.env.GCP_CLIENT_EMAIL ||
            process.env.GOOGLE_APPLICATION_CREDENTIALS
        );

        // Attempt GCS upload if bucket and credentials are present
        if (bucketName && hasGcsCreds) {
            try {
                const blob = bucket.file(fileName);
                await blob.save(buffer, {
                    contentType: file.type,
                    resumable: false,
                    metadata: {
                        contentType: file.type,
                    },
                });

                try {
                    await blob.makePublic();
                } catch {
                    // Ignore ACL error if Uniform Bucket-Level Access is enabled
                }

                pdfUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
            } catch (gcsError) {
                console.warn("GCS Upload encountered an issue, saving locally as fallback:", gcsError.message);
                pdfUrl = await saveFileLocally(fileName, buffer);
            }
        } else {
            // Local storage fallback when GCS credentials/bucket are not fully configured
            pdfUrl = await saveFileLocally(fileName, buffer);
        }

        const document = await prisma.warrantyDocument.create({
            data: {
                fileName: fileName,
                fileUrl: pdfUrl,
                productId: Number(productId),
            },
        });

        return document;
    } catch (err) {
        console.error("Upload error:", err);
        throw err;
    }
}

async function saveFileLocally(fileName, buffer) {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
}
