"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  examId: number
}

type ChoiceState = {
  text: string
  isCorrect: boolean
}

export function ExamQuestionForm({ examId }: Props) {
  const router = useRouter()

  const [questionText, setQuestionText] = useState("")
  const [points, setPoints] = useState("1")
  const [choices, setChoices] = useState<ChoiceState[]>([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function updateChoice(index: number, text: string) {
    setChoices((current) =>
      current.map((choice, i) =>
        i === index ? { ...choice, text } : choice
      )
    )
  }

  function setCorrectChoice(index: number) {
    setChoices((current) =>
      current.map((choice, i) => ({
        ...choice,
        isCorrect: i === index,
      }))
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!questionText.trim()) {
      setError("اكتب نص السؤال")
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
          points: Number(points),
          choices: choices
            .filter((choice) => choice.text.trim())
            .map((choice) => ({
              text: choice.text,
              is_correct: choice.isCorrect,
            })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "تعذر إضافة السؤال")
        return
      }

      setSuccess(data.message || "تم إضافة السؤال بنجاح")
      setQuestionText("")
      setPoints("1")
      setChoices([
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ])
      router.refresh()
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-[var(--line)] bg-white/60 p-4">
      <h4 className="text-lg font-black">إضافة سؤال</h4>

      {error ? <div className="alert-error mt-4">{error}</div> : null}
      {success ? <div className="alert-success mt-4">{success}</div> : null}

      <label className="mt-4 block font-bold">
        نص السؤال
        <textarea
          className="input mt-2 min-h-24"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="اكتب السؤال هنا..."
          required
        />
      </label>

      <label className="mt-4 block font-bold">
        درجة السؤال
        <input
          className="input mt-2"
          type="number"
          min="1"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          required
        />
      </label>

      <div className="mt-4 grid gap-3">
        {choices.map((choice, index) => (
          <div className="flex gap-3" key={index}>
            <input
              className="input"
              value={choice.text}
              onChange={(e) => updateChoice(index, e.target.value)}
              placeholder={`اختيار ${index + 1}`}
            />

            <label className="flex min-w-28 items-center gap-2 text-sm font-bold">
              <input
                type="radio"
                name={`correct-${examId}`}
                checked={choice.isCorrect}
                onChange={() => setCorrectChoice(index)}
              />
              الصحيح
            </label>
          </div>
        ))}
      </div>

      <button className="btn btn-block mt-5 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "جاري إضافة السؤال..." : "إضافة السؤال"}
      </button>
    </form>
  )
}