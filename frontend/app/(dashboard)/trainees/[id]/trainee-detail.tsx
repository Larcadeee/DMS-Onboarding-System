"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getTrainee,
  type Trainee,
  getFullName,
  getStatusColor,
  formatDate,
} from "@/lib/trainee";

export default function TraineeDetail() {
  const params = useParams();
  const router = useRouter();
  const { hasPermission, isLoading: authLoading } = useAuth();

  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "enrollments" | "competencies" | "assessments" | "attendance">("overview");

  const id = parseInt(params.id as string, 10);

  const canUpdate = hasPermission("trainees.update");
  const canDelete = hasPermission("trainees.delete");

  useEffect(() => {
    let cancelled = false;

    const fetchTrainee = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getTrainee(id);
        if (!cancelled) {
          setTrainee(data);
        }
      } catch (err: unknown) {
        const apiError = err as { message?: string; status?: number };
        if (apiError.status === 404) {
          setError("Trainee not found");
        } else {
          setError(apiError.message || "Failed to load trainee");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchTrainee();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Delete trainee "${getFullName(trainee!)}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { deleteTrainee } = await import("@/lib/trainee");
      await deleteTrainee(id);
      router.push("/dashboard/trainees");
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      alert(apiError.message || "Failed to delete trainee");
    }
  };

  const handleBack = () => router.back();

  if (authLoading || isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !trainee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Trainee Not Found</h1>
            <p className="text-slate-500">{error || "The trainee you're looking for doesn't exist."}</p>
          </div>
        </div>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          Back to Trainees
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{getFullName(trainee)}</h1>
            <p className="text-slate-500">#{trainee.trainee_number} • ID: {trainee.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(trainee.status)}`}>
            {trainee.status.charAt(0).toUpperCase() + trainee.status.slice(1)}
          </span>
          {canUpdate && (
            <button
              onClick={() => router.push(`/dashboard/trainees/${id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-slate-200">
        <nav className="border-b border-slate-200" aria-label="Trainee details">
          <ul className="flex flex-wrap -mb-px" role="tablist">
            <li role="presentation">
              <button
                role="tab"
                aria-selected={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-3 text-sm font-medium border-b-2 rounded-t-lg transition-colors ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Overview
              </button>
            </li>
            <li role="presentation">
              <button
                role="tab"
                aria-selected={activeTab === "enrollments"}
                onClick={() => setActiveTab("enrollments")}
                className={`px-4 py-3 text-sm font-medium border-b-2 rounded-t-lg transition-colors ${
                  activeTab === "enrollments"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Enrollments {trainee.enrollments && `(${trainee.enrollments.length})`}
              </button>
            </li>
            <li role="presentation">
              <button
                role="tab"
                aria-selected={activeTab === "competencies"}
                onClick={() => setActiveTab("competencies")}
                className={`px-4 py-3 text-sm font-medium border-b-2 rounded-t-lg transition-colors ${
                  activeTab === "competencies"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Competencies {trainee.competencies && `(${trainee.competencies.length})`}
              </button>
            </li>
            <li role="presentation">
              <button
                role="tab"
                aria-selected={activeTab === "assessments"}
                onClick={() => setActiveTab("assessments")}
                className={`px-4 py-3 text-sm font-medium border-b-2 rounded-t-lg transition-colors ${
                  activeTab === "assessments"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Assessments {trainee.assessment_results && `(${trainee.assessment_results.length})`}
              </button>
            </li>
            <li role="presentation">
              <button
                role="tab"
                aria-selected={activeTab === "attendance"}
                onClick={() => setActiveTab("attendance")}
                className={`px-4 py-3 text-sm font-medium border-b-2 rounded-t-lg transition-colors ${
                  activeTab === "attendance"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Attendance {trainee.attendance_records && `(${trainee.attendance_records.length})`}
              </button>
            </li>
          </ul>
        </nav>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Personal Information */}
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <dt className="text-sm text-slate-500">Trainee Number</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">{trainee.trainee_number}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Full Name</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-900">{getFullName(trainee)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Email</dt>
                    <dd className="mt-1 text-sm text-slate-900">{trainee.email || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Phone</dt>
                    <dd className="mt-1 text-sm text-slate-900">{trainee.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Date of Birth</dt>
                    <dd className="mt-1 text-sm text-slate-900">{formatDate(trainee.date_of_birth)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Gender</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {trainee.gender === "M" ? "Male" : trainee.gender === "F" ? "Female" : trainee.gender || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Address</dt>
                    <dd className="mt-1 text-sm text-slate-900">{trainee.address || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Barangay</dt>
                    <dd className="mt-1 text-sm text-slate-900">{trainee.barangay || "—"}</dd>
                  </div>
                </dl>
              </section>

              {/* Account Information */}
              {trainee.user && (
                <section>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-slate-500">Username</dt>
                      <dd className="mt-1 text-sm font-medium text-slate-900">{trainee.user.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-slate-500">Email</dt>
                      <dd className="mt-1 text-sm text-slate-900">{trainee.user.email}</dd>
                    </div>
                  </dl>
                </section>
              )}

              {/* Timestamps */}
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Timestamps</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <dt className="text-sm text-slate-500">Created</dt>
                    <dd className="mt-1 text-sm text-slate-900">{formatDate(trainee.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Updated</dt>
                    <dd className="mt-1 text-sm text-slate-900">{formatDate(trainee.updated_at)}</dd>
                  </div>
                  {trainee.deleted_at && (
                    <div>
                      <dt className="text-sm text-slate-500">Deleted</dt>
                      <dd className="mt-1 text-sm text-slate-900 text-red-600">{formatDate(trainee.deleted_at)}</dd>
                    </div>
                  )}
                </dl>
              </section>
            </div>
          )}

          {activeTab === "enrollments" && (
            <div>
              {trainee.enrollments && trainee.enrollments.length > 0 ? (
                <div className="space-y-4">
                  {trainee.enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-slate-900">{enrollment.program.name}</h3>
                          <p className="text-sm text-slate-500">{enrollment.program.code}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 text-sm">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            enrollment.status === "enrolled" ? "bg-blue-100 text-blue-800" :
                            enrollment.status === "completed" ? "bg-green-100 text-green-800" :
                            enrollment.status === "dropped" ? "bg-red-100 text-red-800" :
                            "bg-slate-100 text-slate-800"
                          }`}>
                            {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                          </span>
                          <span className="text-slate-500">Enrolled: {formatDate(enrollment.enrolled_on)}</span>
                          {enrollment.completed_on && (
                            <span className="text-slate-500">Completed: {formatDate(enrollment.completed_on)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-slate-900">No enrollments</h3>
                  <p className="mt-1 text-slate-500">This trainee is not enrolled in any programs yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "competencies" && (
            <div>
              {trainee.competencies && trainee.competencies.length > 0 ? (
                <div className="space-y-4">
                  {trainee.competencies.map((competency) => (
                    <div key={competency.id} className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-slate-900">{competency.name}</h3>
                          <p className="text-sm text-slate-500">{competency.code}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            competency.pivot.status === "achieved" ? "bg-green-100 text-green-800" :
                            competency.pivot.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                            "bg-slate-100 text-slate-800"
                          }`}>
                            {competency.pivot.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          {competency.pivot.achieved_on && (
                            <span className="text-sm text-slate-500">Achieved: {formatDate(competency.pivot.achieved_on)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-slate-900">No competencies assigned</h3>
                  <p className="mt-1 text-slate-500">This trainee has no competencies tracked yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "assessments" && (
            <div>
              {trainee.assessment_results && trainee.assessment_results.length > 0 ? (
                <div className="space-y-4">
                  {trainee.assessment_results.map((result) => (
                    <div key={result.id} className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-slate-900">{result.assessment.title}</h3>
                          <p className="text-sm text-slate-500 capitalize">{result.assessment.type}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium text-slate-900">{result.score}%</span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            result.status === "passed" ? "bg-green-100 text-green-800" :
                            result.status === "failed" ? "bg-red-100 text-red-800" :
                            "bg-slate-100 text-slate-800"
                          }`}>
                            {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-slate-900">No assessment results</h3>
                  <p className="mt-1 text-slate-500">This trainee has no assessment results yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "attendance" && (
            <div>
              {trainee.attendance_records && trainee.attendance_records.length > 0 ? (
                <div className="space-y-4">
                  {trainee.attendance_records.map((record) => (
                    <div key={record.id} className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-slate-900">{record.schedule.title}</h3>
                          <p className="text-sm text-slate-500">
                            {formatDate(record.schedule.start_time)} - {formatDate(record.schedule.end_time)}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === "present" ? "bg-green-100 text-green-800" :
                          record.status === "absent" ? "bg-red-100 text-red-800" :
                          record.status === "late" ? "bg-yellow-100 text-yellow-800" :
                          record.status === "excused" ? "bg-blue-100 text-blue-800" :
                          "bg-slate-100 text-slate-800"
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-slate-900">No attendance records</h3>
                  <p className="mt-1 text-slate-500">This trainee has no attendance records yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}