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
      setError("Choose a submission file first")
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
        setError(data.message || "Unable to submit assignment")
        return
      }

      setSuccess(data.message || "Assignment submitted successfully")
      setNotes("")
      setFile(null)
      router.refresh()
    } catch {
      setError("Unable to connect to the server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-[var(--line)] bg-white/50 p-4">
      {existingSubmissionUrl ? (
        <div className="alert-success mb-4">
          This assignment was submitted before. You can upload a new file to update your submission.
        </div>
      ) : null}

      {error ? <div className="alert-error mb-4">{error}</div> : null}
      {success ? <div className="alert-success mb-4">{success}</div> : null}

      <label className="block font-bold">
        Submission Notes
        <textarea
          className="input mt-2 min-h-24"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write any notes for the teacher..."
        />
      </label>

      <label className="mt-4 block font-bold">
        Submission File
        <input
          className="input mt-2"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </label>

      {file ? (
        <p className="muted mt-3 text-sm">Selected file: {file.name}</p>
      ) : null}

      <button className="btn mt-4 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "Submitting..." : existingSubmissionUrl ? "Update submission" : "Submit assignment"}
      </button>
    </form>
  )
}
