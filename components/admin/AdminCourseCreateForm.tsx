"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type TeacherOption = {
  id: number
  full_name: string
}

type EducationTypeOption = {
  id: number
  name: string
}

type StageOption = {
  id: number
  name: string
  education_type_id: number | null
}

type GradeOption = {
  id: number
  name: string
  stage_id: number
}

type Props = {
  teachers: TeacherOption[]
  educationTypes: EducationTypeOption[]
  stages: StageOption[]
  grades: GradeOption[]
}

export function AdminCourseCreateForm({
  teachers,
  educationTypes,
  stages,
  grades,
}: Props) {
  const router = useRouter()

  const [teacherId, setTeacherId] = useState("")
  const [educationTypeId, setEducationTypeId] = useState("")
  const [stageId, setStageId] = useState("")
  const [gradeId, setGradeId] = useState("")
  const [title, setTitle] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [status, setStatus] = useState("published")
  const [accessDurationDays, setAccessDurationDays] = useState("30")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const matchingStages = stages.filter((stage) => {
    if (!educationTypeId) return true
    return !stage.education_type_id || String(stage.education_type_id) === educationTypeId
  })

  const filteredStages = matchingStages.length > 0 ? matchingStages : stages

  const matchingGrades = grades.filter((grade) => {
    if (!stageId) return true
    return String(grade.stage_id) === stageId
  })

  const filteredGrades = matchingGrades.length > 0 ? matchingGrades : grades

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!title.trim()) {
      setError("Enter the course name")
      return
    }

    if (!teacherId) {
      setError("Choose a teacher")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          shortDescription,
          description,
          coverImageUrl,
          teacherId: Number(teacherId),
          educationTypeId: educationTypeId ? Number(educationTypeId) : undefined,
          stageId: stageId ? Number(stageId) : undefined,
          gradeId: gradeId ? Number(gradeId) : undefined,
          status,
          accessDurationDays: Number(accessDurationDays || 30),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to create course")
        return
      }

      setSuccess(data.message || "Course created successfully")
      setTitle("")
      setShortDescription("")
      setDescription("")
      setCoverImageUrl("")
      setAccessDurationDays("30")
      router.refresh()
    } catch {
      setError("Unable to connect to the server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card payment-form mb-8">
      <span className="eyebrow">Add Course</span>
      <h2 className="text-3xl font-black">Create New Course</h2>
      <p className="muted mt-3">
        Create a course from the admin panel and select the teacher, education type, stage, and grade so it appears to the right students.
      </p>

      {error ? <div className="alert-error mt-5">{error}</div> : null}
      {success ? <div className="alert-success mt-5">{success}</div> : null}

      <div className="form-grid mt-6">
        <label className="font-bold">
          Course Name
          <input
            className="input mt-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Grade 12 Math"
            required
          />
        </label>

        <label className="font-bold">
          Teacher
          <select
            className="input mt-2"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            required
          >
            <option value="">Select teacher</option>
            {teachers.map((teacher) => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.full_name}
              </option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          Education Type
          <select
            className="input mt-2"
            value={educationTypeId}
            onChange={(e) => {
              setEducationTypeId(e.target.value)
              setStageId("")
              setGradeId("")
            }}
          >
            <option value="">All education types</option>
            {educationTypes.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          Stage
          <select
            className="input mt-2"
            value={stageId}
            onChange={(e) => {
              setStageId(e.target.value)
              setGradeId("")
            }}
          >
            <option value="">All stages</option>
            {filteredStages.map((stage) => (
              <option value={stage.id} key={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          Grade
          <select
            className="input mt-2"
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
          >
            <option value="">All grades</option>
            {filteredGrades.map((grade) => (
              <option value={grade.id} key={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          Status
          <select
            className="input mt-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="ended">Ended</option>
          </select>
        </label>

        <label className="font-bold">
          Access Duration (Days)
          <input
            className="input mt-2"
            type="number"
            min="1"
            value={accessDurationDays}
            onChange={(e) => setAccessDurationDays(e.target.value)}
          />
        </label>

        <label className="font-bold">
          Cover Image URL
          <input
            className="input mt-2"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="Optional"
          />
        </label>
      </div>

      <label className="mt-4 block font-bold">
        Short Description
        <input
          className="input mt-2"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Description shown on the course card"
        />
      </label>

      <label className="mt-4 block font-bold">
        Full Description
        <textarea
          className="input mt-2 min-h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Course details..."
        />
      </label>

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "Creating course..." : "Create course"}
      </button>
    </form>
  )
}
