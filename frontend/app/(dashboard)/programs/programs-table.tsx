"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getPrograms, type Program, type ProgramListResponse, getStatusColor, formatDate } from "@/lib/program";

export default function ProgramsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page") || 1));
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadPrograms = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getPrograms({
          search: search || undefined,
          status: (status as "draft" | "published" | "archived" | undefined) || undefined,
          per_page: 15,
        });

        setPrograms(response.data);
        setTotalPages(response.last_page);
        setTotal(response.total);
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setError(apiError.message || "Failed to load programs");
      } finally {
        setIsLoading(false);
      }
    };

    loadPrograms();
  }, [search, status, currentPage]);

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    router.push(`/dashboard/programs?${params.toString()}`);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (newStatus) params.set("status", newStatus);
    router.push(`/dashboard/programs?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    params.set("page", String(page));
    router.push(`/dashboard/programs?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Programs</h1>
          <p className="mt-1 text-slate-500">Manage training programs and courses.</p>
        </div>
        {hasPermission("programs.create") && (
          <Link
            href="/dashboard/programs/create"
            className="px-4 py-2 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Add Program
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
        {/* Filters */}
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange("")}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                !status
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusChange("draft")}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                status === "draft"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => handleStatusChange("published")}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                status === "published"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Published
            </button>
            <button
              onClick={() => handleStatusChange("archived")}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                status === "archived"
                  ? "bg-slate-200 text-slate-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Archived
            </button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No programs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hours</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">End Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => (
                  <tr key={program.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{program.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <Link
                        href={`/dashboard/programs/${program.id}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {program.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(program.status)}`}>
                        {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{program.total_hours}h</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatDate(program.start_date)}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatDate(program.end_date)}</td>
                    <td className="px-4 py-3 text-sm flex gap-2">
                      <Link
                        href={`/dashboard/programs/${program.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </Link>
                      {hasPermission("programs.edit") && (
                        <Link
                          href={`/dashboard/programs/${program.id}/edit`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </Link>
                      )}
                      {hasPermission("programs.delete") && (
                        <button
                          onClick={() => {
                            if (confirm("Delete this program?")) {
                              // Delete logic will be implemented in the detail page
                            }
                          }}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * 15 + 1} to {Math.min(currentPage * 15, total)} of {total} programs
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}