import Link from "next/link";
import Image from "next/image";

type PreviewPageProps = {
  searchParams: Promise<{ src?: string }>;
};

export default async function PreviewPage(props: PreviewPageProps) {
  const { src } = await props.searchParams;
  const safeSrc = src || "";

  const lower = safeSrc.toLowerCase();
  const isImage = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"].some((ext) => lower.endsWith(ext));
  const isPdf = lower.endsWith(".pdf");

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-4 items-center">
      <div className="w-full max-w-5xl">
        <Link href="/" className="text-blue-600">← Back</Link>
      </div>
      {!safeSrc ? (
        <div className="text-red-600">No file to preview.</div>
      ) : isImage ? (
        <Image src={safeSrc} alt="Attachment preview" className="max-w-5xl w-full h-auto rounded border" width={800} height={600} />
      ) : isPdf ? (
        <iframe src={safeSrc} className="w-full max-w-5xl h-[80vh] rounded border" />
      ) : (
        <div className="w-full max-w-5xl">
          <div className="mb-2">Preview not supported for this file type.</div>
          <a href={safeSrc} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open file</a>
        </div>
      )}
    </div>
  );
}


