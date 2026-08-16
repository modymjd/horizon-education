"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  userId: number
  studentName: string
  status: string
}

export function AdminStudentActions({ userId, studentName, status }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState("")
  const [error, setError] = useState("")

  async function updateStatus(action: "activate" | "suspend") {
    setError("")
    setIsLoading(action)

    try {
      const res = await fetch(`/api/admin/students/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to update student status")
        return
      }

      router.refresh()
    } catch {
      setError("Unable to connect to the server")
    } finally {
      setIsLoading("")
    }
  }

  async function deleteStudent() {
    const confirmed = window.confirm(`Are you sure you want to delete student "${studentName}"?`)

    if (!confirmed) {
      return
    }

    setError("")
    setIsLoading("delete")

    try {
      const res = await fetch(`/api/admin/students/${userId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to delete student")
        return
      }

      router.refresh()
    } catch {
      setError("Unable to connect to the server")
    } finally {
      setIsLoading("")
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "active" ? (
        <button
          type="button"
          className="btn btn-outline btn-sm disabled:opacity-60"
          onClick={() => updateStatus("suspend")}
          disabled={!!isLoading}
        >
          {isLoading === "suspend" ? "Suspending..." : "Suspend"}
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-soft btn-sm disabled:opacity-60"
          onClick={() => updateStatus("activate")}
          disabled={!!isLoading}
        >
          {isLoading === "activate" ? "Activating..." : "Activate"}
        </button>
      )}

      <button
        type="button"
        className="btn btn-outline btn-sm disabled:opacity-60"
        onClick={deleteStudent}
        disabled={!!isLoading}
      >
        {isLoading === "delete" ? "Deleting..." : "Delete"}
      </button>

      {error ? <p className="w-full text-sm text-red-700">{error}</p> : null}
    </div>
  )
}
