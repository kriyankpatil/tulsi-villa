import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";

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
  const uploadsRoot = join(process.cwd(), "public", "uploads");
  const targetDir = join(uploadsRoot, options.subdirectory);

  if (!existsSync(uploadsRoot)) {
    mkdirSync(uploadsRoot);
  }
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir);
  }

  const fileNameSafe = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
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


