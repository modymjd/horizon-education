"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  courseId: number
  courseTitle: string
}

export function AdminCourseDeleteButton({ courseId, courseTitle }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleDelete() {
    const confirmed = window.confirm(`هل أنت متأكد من حذف كورس "${courseTitle}"؟`)

    if (!confirmed) {
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "تعذر حذف الكورس")
        return
      }

      router.refresh()
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        className="btn btn-outline btn-sm disabled:opacity-60"
        type="button"
        onClick={handleDelete}
        disabled={isLoading}
      >
        {isLoading ? "جاري الحذف..." : "حذف"}
      </button>

      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  )
}
