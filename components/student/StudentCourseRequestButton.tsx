"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  courseId: number
  initialStatus?: string | null
}

function getStatusMessage(status?: string | null) {
  if (status === "pending") return "طلبك قيد المراجعة"
  if (status === "accepted") return "تم قبولك. تواصل مع المدرس للحصول على كود الوصول"
  if (status === "rejected") return "تم رفض الطلب. يمكنك التواصل مع المدرس أو الإدارة"
  return ""
}

export function StudentCourseRequestButton({ courseId, initialStatus }: Props) {
  const router = useRouter()

  const [status, setStatus] = useState(initialStatus || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleRequest() {
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/student/course-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: courseId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "تعذر إرسال طلب الانضمام")
        return
      }

      setStatus(data.status || "pending")
      router.refresh()
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  if (status) {
    return (
      <div className="mt-5">
        <div className="alert-success">
          {getStatusMessage(status)}
        </div>

        {error ? <div className="alert-error mt-3">{error}</div> : null}
      </div>
    )
  }

  return (
    <div className="mt-5">
      {error ? <div className="alert-error mb-3">{error}</div> : null}

      <button
        className="btn btn-block disabled:opacity-60"
        type="button"
        onClick={handleRequest}
        disabled={isLoading}
      >
        {isLoading ? "جاري إرسال الطلب..." : "طلب الانضمام للكورس"}
      </button>
    </div>
  )
}
