"use client"

import { useEffect, useRef, useState } from "react"
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
  lessonId: number
  questions: ExamQuestion[]
  choices: ExamChoice[]
}

export function StudentExamPageForm({
  examId,
  lessonId,
  questions,
  choices,
}: Props) {
  const router = useRouter()

  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const submittedRef = useRef(false)
  const startedRef = useRef(false)
  const answersRef = useRef<Record<number, number>>({})

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  async function submitExam(autoClosed = false) {
    if (submittedRef.current) return

    submittedRef.current = true

    const latestAnswers = answersRef.current

    const payload = {
      exam_id: examId,
      auto_closed: autoClosed,
      answers: Object.entries(latestAnswers).map(([questionId, choiceId]) => ({
        question_id: Number(questionId),
        choice_id: Number(choiceId),
      })),
    }

    if (autoClosed) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      })

      navigator.sendBeacon("/api/student/exam-attempts", blob)
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/student/exam-attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "تعذر تسليم الامتحان")
        submittedRef.current = false
        return
      }

      setSuccess(data.message || "تم تسليم الامتحان بنجاح")

      setTimeout(() => {
        router.push(`/student/lessons/${lessonId}`)
        router.refresh()
      }, 800)
    } catch {
      setError("تعذر الاتصال بالخادم")
      submittedRef.current = false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!startedRef.current || submittedRef.current) return

      submitExam(true)

      e.preventDefault()
      e.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  if (!started) {
    return (
      <div className="mt-6">
        <button
          type="button"
          className="btn btn-block"
          onClick={() => {
            setStarted(true)
            startedRef.current = true
          }}
        >
          أوافق وأبدأ الامتحان
        </button>
      </div>
    )
  }

  return (
    <form
      className="mt-8 grid gap-5"
      onSubmit={(e) => {
        e.preventDefault()

        const missingQuestion = questions.find(
          (question) => !answers[question.id]
        )

        if (missingQuestion) {
          setError("يجب الإجابة على كل الأسئلة قبل التسليم")
          return
        }

        submitExam(false)
      }}
    >
      {error ? <div className="alert-error">{error}</div> : null}
      {success ? <div className="alert-success">{success}</div> : null}

      {questions.map((question, index) => (
        <div
          className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-4"
          key={question.id}
        >
          <h3 className="text-xl font-black">
            {index + 1}. {question.question_text}
          </h3>

          <p className="muted mt-1 text-sm">{question.points} درجة</p>

          <div className="mt-4 grid gap-2">
            {choices
              .filter((choice) => choice.question_id === question.id)
              .map((choice) => (
                <label
                  className="flex items-center gap-3 rounded-xl bg-white/70 p-3 font-bold"
                  key={choice.id}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[question.id] === choice.id}
                    onChange={() => {
                      const nextAnswers = {
                        ...answersRef.current,
                        [question.id]: choice.id,
                      }

                      answersRef.current = nextAnswers
                      setAnswers(nextAnswers)
                    }}
                  />
                  {choice.choice_text}
                </label>
              ))}
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="btn btn-block disabled:opacity-60"
        disabled={isLoading}
      >
        {isLoading ? "جاري تسليم الامتحان..." : "تسليم الامتحان"}
      </button>
    </form>
  )
}