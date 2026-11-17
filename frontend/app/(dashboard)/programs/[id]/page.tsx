import { Suspense } from "react";
import ProgramDetail from "./program-detail";

function ProgramDetailFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

export default function ProgramDetailPage() {
  return (
    <Suspense fallback={<ProgramDetailFallback />}>
      <ProgramDetail />
    </Suspense>
  );
}