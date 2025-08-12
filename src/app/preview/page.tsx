import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { createSignedStorageUrl } from "@/lib/supabase";

export default async function PreviewPage(props: { searchParams: Promise<{ src?: string; from?: string }> }) {
  const { src, from } = await props.searchParams;
  const safeSrc = src || "";
  const safeFrom = (from || "").toLowerCase();

  let renderUrl = safeSrc;
  // If the src looks like a Supabase Storage object path ("/bucket/path"),
  // generate a signed URL when Supabase is configured.
  if (safeSrc.startsWith("/") && process.env.SUPABASE_URL) {
    const bucket = (process.env.SUPABASE_STORAGE_BUCKET || "uploads").trim();
    const noLeading = safeSrc.replace(/^\//, ""); // e.g. "uploads/receipts/abc.jpg"
    const objectPath = noLeading.startsWith(`${bucket}/`)
      ? noLeading.slice(bucket.length + 1) // strip "bucket/"
      : noLeading;
    const signed = await createSignedStorageUrl(objectPath, 300);
    if (signed) renderUrl = signed;
  }

  const lowerPath = renderUrl.split("?")[0].toLowerCase();
  const isImage = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"].some((ext) => lowerPath.endsWith(ext));
  const isPdf = lowerPath.endsWith(".pdf");

  const hdrs = await headers();
  const referer = (hdrs.get("referer") || "").toLowerCase();
  const backHref = safeFrom === "admin" || referer.includes("/admin")
    ? "/admin"
    : "/member";

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-4 items-center">
      <div className="w-full max-w-5xl">
        <Link href={backHref} className="text-blue-600">← Back</Link>
      </div>
      {!safeSrc ? (
        <div className="text-red-600">No file to preview.</div>
      ) : isImage ? (
        <Image src={renderUrl} alt="Attachment preview" className="max-w-5xl w-full h-auto rounded border" width={800} height={600} />
      ) : isPdf ? (
        <iframe src={renderUrl} className="w-full max-w-5xl h-[80vh] rounded border" />
      ) : (
        <div className="w-full max-w-5xl">
          <div className="mb-2">Preview not supported for this file type.</div>
          <a href={renderUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open file</a>
        </div>
      )}
    </div>
  );
}


