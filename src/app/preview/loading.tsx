import LoadingSpinner from "@/components/LoadingSpinner";

export default function PreviewLoading() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-slate-500 text-sm">Loading preview...</p>
      </div>
    </div>
  );
}
