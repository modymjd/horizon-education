"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  requestId: number
  currentStatus: "pending" | "accepted" | "rejected"
}

function getStatusLabel(status: string) {
  if (status === "pending") return "Pending Review"
  if (status === "accepted") return "Accepted"
  if (status === "rejected") return "Rejected"
  return status
}

export function TeacherCourseRequestActions({
  requestId,
  currentStatus,
}: Props) {
  const router = useRouter()

  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState("")
  const [error, setError] = useState("")

  async function updateStatus(nextStatus: "accepted" | "rejected") {
    setError("")
    setIsLoading(nextStatus)

    try {
      const res = await fetch("/api/teacher/course-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: requestId,
          status: nextStatus,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to update request")
        return
      }

      setStatus(nextStatus)
      router.refresh()
    } catch {
      setError("Unable to connect to the server")
    } finally {
      setIsLoading("")
    }
  }

  return (
    <div className="mt-4">
      <span className="badge">{getStatusLabel(status)}</span>

      {status === "pending" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="btn btn-sm disabled:opacity-60"
            type="button"
            disabled={!!isLoading}
            onClick={() => updateStatus("accepted")}
          >
            {isLoading === "accepted" ? "Accepting..." : "Accept"}
          </button>

          <button
            className="btn btn-outline btn-sm disabled:opacity-60"
            type="button"
            disabled={!!isLoading}
            onClick={() => updateStatus("rejected")}
          >
            {isLoading === "rejected" ? "Rejecting..." : "Reject"}
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  )
}
