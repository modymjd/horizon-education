"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  assignmentId: number
  existingSubmissionUrl?: string | null
}

export function StudentAssignmentSubmitForm({
  assignmentId,
  existingSubmissionUrl,
}: Props) {
  const router = useRouter()

  const [notes, setNotes] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!file) {
      setError("اختار ملف التسليم أولًا")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("assignment_id", String(assignmentId))
      formData.append("notes", notes)
      formData.append("submission", file)

      const res = await fetch("/api/student/assignments", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "تعذر تسليم الواجب")
        return
      }

      setSuccess(data.message || "تم تسليم الواجب بنجاح")
      setNotes("")
      setFile(null)
      router.refresh()
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-[var(--line)] bg-white/50 p-4">
      {existingSubmissionUrl ? (
        <div className="alert-success mb-4">
          تم تسليم هذا الواجب من قبل. يمكنك رفع ملف جديد لتحديث التسليم.
        </div>
      ) : null}

      {error ? <div className="alert-error mb-4">{error}</div> : null}
      {success ? <div className="alert-success mb-4">{success}</div> : null}

      <label className="block font-bold">
        ملاحظات التسليم
        <textarea
          className="input mt-2 min-h-24"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="اكتب أي ملاحظات للمدرس..."
        />
      </label>

      <label className="mt-4 block font-bold">
        ملف التسليم
        <input
          className="input mt-2"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </label>

      {file ? (
        <p className="muted mt-3 text-sm">الملف المختار: {file.name}</p>
      ) : null}

      <button className="btn mt-4 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "جاري التسليم..." : existingSubmissionUrl ? "تحديث التسليم" : "تسليم الواجب"}
      </button>
    </form>
  )
}
