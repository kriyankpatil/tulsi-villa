import { createWriteStream, existsSync, mkdirSync } from "fs";
import { promises as fsp } from "fs";
import { join } from "path";
import { ensureStorageBucketExists, getSupabaseAdminClient } from "@/lib/supabase";

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
    const rawBucket = (process.env.SUPABASE_STORAGE_BUCKET || "uploads").trim();
    const bucketNameIsValid = /^[a-z0-9][a-z0-9-_]{1,62}$/i.test(rawBucket);
    const bucket = bucketNameIsValid ? rawBucket : "uploads";
    // Best-effort ensure the bucket exists in production
    await ensureStorageBucketExists(bucket);
    const objectPath = `${options.subdirectory}/${fileNameSafe}`;
    const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) throw error;

    // Store the object path; consumers will request a signed URL when rendering
    const storedPath = `/${bucket}/${objectPath}`;
    return { relativePath: storedPath, absolutePath: storedPath, originalName: file.name };
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

export async function deleteStoredFile(storedPath: string | null | undefined): Promise<void> {
  if (!storedPath) return;
  // If using Supabase in production, delete from storage bucket
  const isSupabaseConfigured = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (isSupabaseConfigured && storedPath.startsWith("/")) {
    const supabase = getSupabaseAdminClient();
    if (!supabase) return;
    const noLeading = storedPath.replace(/^\//, "");
    const [bucket, ...rest] = noLeading.split("/");
    const objectPath = rest.join("/");
    if (!bucket || !objectPath) return;
    await supabase.storage.from(bucket).remove([objectPath]);
    return;
  }
  // Fallback: delete local file if present
  const absolute = join(process.cwd(), "public", storedPath.replace(/^\//, ""));
  try { await fsp.unlink(absolute); } catch { /* ignore */ }
}


