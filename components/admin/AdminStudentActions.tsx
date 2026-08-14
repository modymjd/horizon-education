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
        setError(data.message || "تعذر تحديث حالة الطالب")
        return
      }

      router.refresh()
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading("")
    }
  }

  async function deleteStudent() {
    const confirmed = window.confirm(`هل أنت متأكد من حذف الطالب "${studentName}"؟`)

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
        setError(data.message || "تعذر حذف الطالب")
        return
      }

      router.refresh()
    } catch {
      setError("تعذر الاتصال بالخادم")
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
          {isLoading === "suspend" ? "جاري التعطيل..." : "تعطيل"}
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-soft btn-sm disabled:opacity-60"
          onClick={() => updateStatus("activate")}
          disabled={!!isLoading}
        >
          {isLoading === "activate" ? "جاري التفعيل..." : "تفعيل"}
        </button>
      )}

      <button
        type="button"
        className="btn btn-outline btn-sm disabled:opacity-60"
        onClick={deleteStudent}
        disabled={!!isLoading}
      >
        {isLoading === "delete" ? "جاري الحذف..." : "حذف"}
      </button>

      {error ? <p className="w-full text-sm text-red-700">{error}</p> : null}
    </div>
  )
}
