"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

type StudentOption = {
  id: number
  full_name: string
  student_code: string | null
  phone: string | null
}

type LessonOption = {
  id: number
  title: string
  course_title: string | null
  price: number
}

type PaymentMethodOption = {
  id: number
  name: string
}

type Props = {
  students: StudentOption[]
  lessons: LessonOption[]
  paymentMethods: PaymentMethodOption[]
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("en-US")} EGP`
}

export function TeacherPaymentCreateForm({
  students,
  lessons,
  paymentMethods,
}: Props) {
  const router = useRouter()
  const searchBoxRef = useRef<HTMLDivElement>(null)

  const [studentId, setStudentId] = useState("")
  const [studentQuery, setStudentQuery] = useState("")
  const [isStudentListOpen, setIsStudentListOpen] = useState(false)
  const [lessonId, setLessonId] = useState("")
  const [amountPaid, setAmountPaid] = useState("")
  const [paymentMethodId, setPaymentMethodId] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const selectedStudent = students.find((item) => String(item.id) === studentId)

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase()

    if (!q) {
      return students.slice(0, 8)
    }

    return students
      .filter((student) => {
        const name = (student.full_name || "").toLowerCase()
        const phone = (student.phone || "").toLowerCase()
        const code = (student.student_code || "").toLowerCase()
        return name.includes(q) || phone.includes(q) || code.includes(q)
      })
      .slice(0, 8)
  }, [students, studentQuery])

  function handleSelectStudent(student: StudentOption) {
    setStudentId(String(student.id))
    setStudentQuery("")
    setIsStudentListOpen(false)
  }

  function handleClearStudent() {
    setStudentId("")
    setStudentQuery("")
  }

  function handleLessonChange(value: string) {
    setLessonId(value)

    const lesson = lessons.find((item) => String(item.id) === value)
    if (lesson) {
      setAmountPaid(String(Number(lesson.price || 0)))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!studentId) {
      setError("Search for and select a student")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/teacher/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: Number(studentId),
          lesson_id: Number(lessonId),
          amount_paid: Number(amountPaid),
          payment_method_id: Number(paymentMethodId),
          notes: notes || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to record payment")
        return
      }

      setSuccess(`Payment recorded successfully. Invoice number: ${data.invoice_number}`)
      handleClearStudent()
      setLessonId("")
      setAmountPaid("")
      setPaymentMethodId("")
      setNotes("")
      router.refresh()
    } catch {
      setError("Unable to connect to the server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card payment-form">
      <span className="eyebrow">Record Payment</span>
      <h2 className="text-3xl font-black">Add New Payment</h2>
      <p className="muted mt-3">
        Choose the student and lesson from your own courses. Platform and your share will be calculated automatically, and this counts as official platform revenue.
      </p>

      {error ? <div className="alert-error mt-5">{error}</div> : null}
      {success ? <div className="alert-success mt-5">{success}</div> : null}

      <div className="form-grid mt-6">
        <div className="font-bold" ref={searchBoxRef}>
          Student

          {selectedStudent ? (
            <div className="student-picker-selected mt-2">
              <div>
                <b>{selectedStudent.full_name}</b>
                <p className="muted text-sm">
                  {selectedStudent.phone || "No phone on file"}
                  {selectedStudent.student_code ? ` â€” ${selectedStudent.student_code}` : ""}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleClearStudent}
              >
                Change
              </button>
            </div>
          ) : (
            <div className="student-picker">
              <input
                className="input mt-2"
                value={studentQuery}
                onChange={(e) => {
                  setStudentQuery(e.target.value)
                  setIsStudentListOpen(true)
                }}
                onFocus={() => setIsStudentListOpen(true)}
                onBlur={() => {
                  setTimeout(() => setIsStudentListOpen(false), 150)
                }}
                placeholder="Search by student name or phone number..."
              />

              {isStudentListOpen ? (
                <div className="student-picker-list">
                  {filteredStudents.map((student) => (
                    <button
                      type="button"
                      key={student.id}
                      className="student-picker-item"
                      onMouseDown={() => handleSelectStudent(student)}
                    >
                      <b>{student.full_name}</b>
                      <span className="muted text-sm">
                        {student.phone || "No phone on file"}
                        {student.student_code ? ` â€” ${student.student_code}` : ""}
                      </span>
                    </button>
                  ))}

                  {filteredStudents.length === 0 ? (
                    <p className="muted p-3 text-sm">No matching students.</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}

          {students.length === 0 ? (
            <span className="muted mt-2 block text-sm">
              No accepted students yet. Accept a join request first from "Join Requests".
            </span>
          ) : null}
        </div>

        <label className="font-bold">
          Lesson
          <select
            className="input mt-2"
            value={lessonId}
            onChange={(e) => handleLessonChange(e.target.value)}
            required
          >
            <option value="">Select lesson</option>
            {lessons.map((lesson) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.course_title ? `${lesson.course_title} â€” ` : ""}
                {lesson.title}
                {lesson.price ? ` â€” ${money(lesson.price)}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          Amount
          <input
            className="input mt-2"
            type="number"
            min="1"
            step="0.01"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            placeholder="75"
            required
          />
        </label>

        <label className="font-bold">
          Payment Method
          <select
            className="input mt-2"
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.target.value)}
            required
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((method) => (
              <option value={method.id} key={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block font-bold">
        Notes
        <textarea
          className="input mt-2 min-h-24"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes about this payment"
        />
      </label>

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "Recording payment..." : "Record payment"}
      </button>
    </form>
  )
}

