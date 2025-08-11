import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { getSupabaseAdminClient } from "@/lib/supabase";

export type SavedFileInfo = {
  relativePath: string;
  absolutePath: string;
  originalName: string;
};

export async function saveUploadedFile(
  file: File | null,
  options: { subdirectory: string }
): Promise<SavedFileInfo | null> {
  if (!file) return null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileNameSafe = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;

  // In production, prefer Supabase Storage if configured
  const useSupabase = process.env.NODE_ENV === "production" && !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (useSupabase) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) return null;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
    const objectPath = `${options.subdirectory}/${fileNameSafe}`;
    const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) throw error;

    // Build public URL (assumes bucket is public; otherwise, generate signed URL when rendering)
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${objectPath}`;
    return { relativePath: publicUrl, absolutePath: publicUrl, originalName: file.name };
  }

  // Fallback to local disk (useful in development or non-serverless hosts)
  const uploadsRoot = join(process.cwd(), "public", "uploads");
  const targetDir = join(uploadsRoot, options.subdirectory);

  if (!existsSync(uploadsRoot)) {
    mkdirSync(uploadsRoot);
  }
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir);
  }

  const absolutePath = join(targetDir, fileNameSafe);
  const writeStream = createWriteStream(absolutePath);
  await new Promise<void>((resolve, reject) => {
    writeStream.write(buffer, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  writeStream.end();

  const relativePath = `/uploads/${options.subdirectory}/${fileNameSafe}`;
  return { relativePath, absolutePath, originalName: file.name };
}


