"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type ExamQuestion = {
  id: number
  question_text: string
  points: number
}

type ExamChoice = {
  id: number
  question_id: number
  choice_text: string
}

type Props = {
  examId: number
  alreadyAttempted: boolean
  questions: ExamQuestion[]
  choices: ExamChoice[]
}

export function StudentExamForm({
  examId,
  alreadyAttempted,
  questions,
  choices,
}: Props) {
  const router = useRouter()

  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (alreadyAttempted) {
      setError("تم دخول هذا الامتحان من قبل")
      return
    }

    const missingQuestion = questions.find((question) => !answers[question.id])

    if (missingQuestion) {
      setError("يجب الإجابة على كل الأسئلة قبل التسليم")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/student/exam-attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_id: examId,
          answers: Object.entries(answers).map(([questionId, choiceId]) => ({
            question_id: Number(questionId),
            choice_id: Number(choiceId),
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "تعذر تسليم الامتحان")
        return
      }

      setSuccess(data.message || "تم تسليم الامتحان بنجاح")
      router.refresh()
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  if (alreadyAttempted) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-4">
        <p className="font-bold">تم دخول هذا الامتحان من قبل ولا يمكن إعادته.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
      {error ? <div className="alert-error">{error}</div> : null}
      {success ? <div className="alert-success">{success}</div> : null}

      {questions.map((question, index) => (
        <div
          className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-4"
          key={question.id}
        >
          <h4 className="font-black">
            {index + 1}. {question.question_text}
          </h4>

          <p className="muted mt-1 text-sm">{question.points} درجة</p>

          <div className="mt-3 grid gap-2">
            {choices
              .filter((choice) => choice.question_id === question.id)
              .map((choice) => (
                <label
                  className="flex items-center gap-3 rounded-xl bg-white/60 p-3 font-bold"
                  key={choice.id}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={choice.id}
                    checked={answers[question.id] === choice.id}
                    onChange={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: choice.id,
                      }))
                    }
                  />
                  {choice.choice_text}
                </label>
              ))}
          </div>
        </div>
      ))}

      <button className="btn btn-block disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "جاري تسليم الامتحان..." : "تسليم الامتحان"}
      </button>
    </form>
  )
}