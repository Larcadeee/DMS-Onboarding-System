import { Suspense } from "react";
import EditTraineePage from "./edit-trainee";

function EditTraineeFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

export default function EditTraineePageWrapper() {
  return (
    <Suspense fallback={<EditTraineeFallback />}>
      <EditTraineePage />
    </Suspense>
  );
}