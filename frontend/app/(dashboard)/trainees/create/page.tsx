import { Suspense } from "react";
import CreateTraineePage from "./create-trainee";

function CreateTraineeFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

export default function CreateTraineePageWrapper() {
  return (
    <Suspense fallback={<CreateTraineeFallback />}>
      <CreateTraineePage />
    </Suspense>
  );
}