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

type QuestionType = "text" | "image"

export function TeacherExamQuestionForm({ examId }: Props) {
  const router = useRouter()

  const [questionType, setQuestionType] = useState<QuestionType>("text")
  const [questionText, setQuestionText] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
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

  function handleImageChange(file: File | null) {
    setImageFile(file)

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setImagePreview(file ? URL.createObjectURL(file) : null)
  }

  function resetForm() {
    setQuestionText("")
    handleImageChange(null)
    setPoints("1")
    setChoices([
      { text: "", is_correct: true },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (questionType === "text" && !questionText.trim()) {
      setError("Please enter the question text.")
      return
    }

    if (questionType === "image" && !imageFile) {
      setError("Please choose an image for the question.")
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
      const formData = new FormData()
      formData.append("exam_id", String(examId))
      formData.append("question_type", questionType)
      formData.append("points", points || "1")
      formData.append("choices", JSON.stringify(validChoices))

      if (questionType === "text") {
        formData.append("question_text", questionText)
      } else if (imageFile) {
        formData.append("image", imageFile)
      }

      const res = await fetch("/api/teacher/exam-questions", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to add the question.")
        return
      }

      setSuccess(data.message || "Question added successfully.")
      resetForm()
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

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className={questionType === "text" ? "btn" : "btn btn-outline"}
          onClick={() => setQuestionType("text")}
        >
          Text Question
        </button>

        <button
          type="button"
          className={questionType === "image" ? "btn" : "btn btn-outline"}
          onClick={() => setQuestionType("image")}
        >
          Image Question
        </button>
      </div>

      {questionType === "text" ? (
        <label className="mt-6 block font-bold">
          Question Text
          <textarea
            className="input mt-2 min-h-28"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Write the question text..."
            dir="ltr"
          />
        </label>
      ) : (
        <label className="mt-6 block font-bold">
          Question Image
          <input
            className="input mt-2"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
          />
        </label>
      )}

      {questionType === "image" && imagePreview ? (
        <div className="mt-4">
          <img
            src={imagePreview}
            alt="Question preview"
            className="max-h-64 rounded-2xl border border-[var(--line)] object-contain"
          />
        </div>
      ) : null}

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
