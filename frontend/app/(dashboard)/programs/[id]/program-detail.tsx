"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getProgram, deleteProgram, type Program, getStatusColor, formatDate } from "@/lib/program";
import Link from "next/link";

export default function ProgramDetail() {
  const router = useRouter();
  const params = useParams();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleting, setIsDeleting] = useState(false);

  const id = typeof params.id === "string" ? parseInt(params.id) : 0;

  useEffect(() => {
    const loadProgram = async () => {
      if (!id) return;
      setIsLoading(true);
      setError("");

      try {
        const data = await getProgram(id);
        setProgram(data);
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setError(apiError.message || "Failed to load program");
      } finally {
        setIsLoading(false);
      }
    };

    loadProgram();
  }, [id]);

  if (authLoading || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || "Program not found"}</p>
        </div>
        <Link href="/dashboard/programs" className="text-blue-600 hover:underline">
          Back to Programs
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      await deleteProgram(program.id);
      router.push("/dashboard/programs");
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || "Failed to delete program");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{program.title}</h1>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(program.status)}`}>
              {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
            </span>
          </div>
          <p className="mt-1 text-slate-500">Program Code: {program.code}</p>
        </div>
        <div className="flex gap-2">
          {hasPermission("programs.edit") && (
            <Link
              href={`/dashboard/programs/${program.id}/edit`}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Edit
            </Link>
          )}
          {hasPermission("programs.delete") && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-white bg-red-600 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 flex">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("modules")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "modules"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Modules
          </button>
          <button
            onClick={() => setActiveTab("trainees")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "trainees"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Trainees
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Description</h3>
              <p className="text-slate-700">{program.description || "No description provided"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Total Hours</h3>
                <p className="text-slate-700">{program.total_hours} hours</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Department</h3>
                <p className="text-slate-700">{program.department?.name || "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Start Date</h3>
                <p className="text-slate-700">{formatDate(program.start_date)}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">End Date</h3>
                <p className="text-slate-700">{formatDate(program.end_date)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === "modules" && (
          <div className="p-6">
            {program.modules && program.modules.length > 0 ? (
              <div className="space-y-2">
                {program.modules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{module.title}</p>
                      <p className="text-sm text-slate-500">{module.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No modules assigned to this program.</p>
            )}
          </div>
        )}

        {/* Trainees Tab */}
        {activeTab === "trainees" && (
          <div className="p-6">
            {program.trainees && program.trainees.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">Trainee Number</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {program.trainees.map((trainee) => (
                      <tr key={trainee.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{trainee.trainee_number}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {trainee.first_name} {trainee.last_name}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            {trainee.pivot.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{formatDate(trainee.pivot.enrolled_on)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500">No trainees enrolled in this program.</p>
            )}
          </div>
        )}
      </div>

      <Link href="/dashboard/programs" className="text-blue-600 hover:underline">
        Back to Programs
      </Link>
    </div>
  );
}