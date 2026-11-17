import { Suspense } from "react";
import CreateProgramPage from "./create-program";

function CreateProgramFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

export default function CreateProgramPageWrapper() {
  return (
    <Suspense fallback={<CreateProgramFallback />}>
      <CreateProgramPage />
    </Suspense>
  );
}