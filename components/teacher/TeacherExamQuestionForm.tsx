"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  examId: number
}

type ChoiceState = {
  text: string
  is_correct: boolean
}

export function TeacherExamQuestionForm({ examId }: Props) {
  const router = useRouter()

  const [questionText, setQuestionText] = useState("")
  const [points, setPoints] = useState("1")
  const [choices, setChoices] = useState<ChoiceState[]>([
    { text: "", is_correct: true },
    { text: "", is_correct: false },
    { text: "", is_correct: false },
    { text: "", is_correct: false },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function updateChoiceText(index: number, text: string) {
    setChoices((current) =>
      current.map((choice, i) => (i === index ? { ...choice, text } : choice))
    )
  }

  function setCorrectChoice(index: number) {
    setChoices((current) =>
      current.map((choice, i) => ({
        ...choice,
        is_correct: i === index,
      }))
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!questionText.trim()) {
      setError("Please enter the question text.")
      return
    }

    const validChoices = choices.filter((choice) => choice.text.trim())

    if (validChoices.length < 2) {
      setError("Please add at least two choices.")
      return
    }

    if (validChoices.filter((choice) => choice.is_correct).length !== 1) {
      setError("Please select exactly one correct answer.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/teacher/exam-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exam_id: examId,
          question_text: questionText,
          points: Number(points || 1),
          choices: validChoices,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to add the question.")
        return
      }

      setSuccess(data.message || "Question added successfully.")
      setQuestionText("")
      setPoints("1")
      setChoices([
        { text: "", is_correct: true },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ])
      router.refresh()
    } catch {
      setError("Unable to connect to the server.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card payment-form">
      <span className="eyebrow">Exam Questions</span>
      <h2 className="text-3xl font-black">Add Question</h2>
      <p className="muted mt-3">
        Add a multiple-choice question and select exactly one correct answer.
      </p>

      {error ? <div className="alert-error mt-5">{error}</div> : null}
      {success ? <div className="alert-success mt-5">{success}</div> : null}

      <label className="mt-6 block font-bold">
        Question Text
        <textarea
          className="input mt-2 min-h-28"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Write the question text..."
          required
          dir="ltr"
        />
      </label>

      <label className="mt-4 block font-bold">
        Question Points
        <input
          className="input mt-2"
          type="number"
          min="1"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          required
          dir="ltr"
        />
      </label>

      <div className="mt-5 grid gap-3">
        <p className="font-bold">Choices</p>

        {choices.map((choice, index) => (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-4" key={index}>
            <label className="block font-bold">
              Choice {index + 1}
              <input
                className="input mt-2"
                value={choice.text}
                onChange={(e) => updateChoiceText(index, e.target.value)}
                placeholder={`Write choice ${index + 1}`}
                dir="ltr"
              />
            </label>

            <label className="mt-3 flex items-center gap-3 font-bold">
              <input
                type="radio"
                name="correct-choice"
                checked={choice.is_correct}
                onChange={() => setCorrectChoice(index)}
              />
              Correct Answer
            </label>
          </div>
        ))}
      </div>

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Question"}
      </button>
    </form>
  )
}
