"use client"

import { useEffect, useRef, useState } from "react"

type ExamQuestion = {
  id: number
  question_text: string | null
  question_image_url: string | null
  points: number
}

type ExamChoice = {
  id: number
  question_id: number
  choice_text: string
}

type ExamReviewItem = {
  question_id: number
  question_text: string | null
  question_image_url: string | null
  points: number
  choice_id: number
  selected_choice_text: string | null
  correct_choice_id: number
  correct_choice_text: string | null
  is_correct: number
  points_awarded: number
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
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [review, setReview] = useState<ExamReviewItem[]>([])
  const [score, setScore] = useState<number | null>(null)
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null)
  const [totalPoints, setTotalPoints] = useState<number | null>(null)
  const [passed, setPassed] = useState<boolean | null>(null)
  const [showReview, setShowReview] = useState(false)

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
        setError(data.message || "Unable to submit exam")
        submittedRef.current = false
        return
      }

      setSuccess(data.message || "Exam submitted successfully")
      setShowReview(false)
      setReview(Array.isArray(data.review) ? data.review : [])
      setScore(typeof data.score === "number" ? data.score : null)
      setEarnedPoints(typeof data.earnedPoints === "number" ? data.earnedPoints : null)
      setTotalPoints(typeof data.totalPoints === "number" ? data.totalPoints : null)
      setPassed(typeof data.passed === "boolean" ? data.passed : null)
    } catch {
      setError("Unable to connect to the server")
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

  if (review.length > 0) {
    return (
      <div className="mt-8 grid gap-5">
        <div className={passed ? "alert-success" : "alert-error"}>
          <b>{passed ? "Passed" : "Not passed"}</b>
          <p className="mt-2">
            Your score: {score}%{" "}
            {earnedPoints !== null && totalPoints !== null
              ? `(${earnedPoints}/${totalPoints} points)`
              : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn"
            onClick={() => setShowReview((current) => !current)}
          >
            {showReview ? "Hide My Answers" : "View My Answers"}
          </button>

          <a href={`/student/lessons/${lessonId}`} className="btn btn-outline">
            Back to Lesson
          </a>
        </div>

        {showReview ? (
          <>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-4">
              <h2 className="text-2xl font-black">My answers</h2>
              <p className="muted mt-2">
                Review your answers and compare them with the correct answers.
              </p>
            </div>

            {review.map((item, index) => (
              <div
                className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-4"
                key={item.question_id}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-black">
                    {index + 1}. {item.question_text || ""}
                  </h3>

                  <span
                    className={
                      item.is_correct
                        ? "rounded-full bg-green-100 px-3 py-1 text-sm font-black text-green-700"
                        : "rounded-full bg-red-100 px-3 py-1 text-sm font-black text-red-700"
                    }
                  >
                    {item.is_correct ? "Correct" : "Wrong"}
                  </span>
                </div>

                {item.question_image_url ? (
                  <div className="mt-3">
                    <img
                      src={item.question_image_url}
                      alt={`Question ${index + 1}`}
                      className="max-h-80 w-full rounded-2xl border border-[var(--line)] bg-white object-contain"
                    />
                  </div>
                ) : null}

                <p className="muted mt-2 text-sm">
                  Points: {item.points_awarded}/{item.points}
                </p>

                <div className="mt-4 grid gap-2">
                  <div
                    className={
                      item.is_correct
                        ? "rounded-xl border border-green-200 bg-green-50 p-3"
                        : "rounded-xl border border-red-200 bg-red-50 p-3"
                    }
                  >
                    <b>Your answer:</b>{" "}
                    {item.selected_choice_text || "No answer selected"}
                  </div>

                  {!item.is_correct ? (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                      <b>Correct answer:</b>{" "}
                      {item.correct_choice_text || "No correct answer set"}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </>
        ) : null}
      </div>
    )
  }

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
          I agree and start the exam
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
          setError("You must answer all questions before submitting")
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
            {index + 1}. {question.question_text || ""}
          </h3>

          {question.question_image_url ? (
            <div className="mt-3">
              <img
                src={question.question_image_url}
                alt={`Question ${index + 1}`}
                className="max-h-80 w-full rounded-2xl border border-[var(--line)] bg-white object-contain"
              />
            </div>
          ) : null}

          <p className="muted mt-1 text-sm">{question.points} points</p>

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
        {isLoading ? "Submitting exam..." : "Submit exam"}
      </button>
    </form>
  )
}
