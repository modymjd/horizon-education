"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { EducationClassificationFields } from "./EducationClassificationFields"

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [teacherId, setTeacherId] = useState("")
  const [educationTypeIds, setEducationTypeIds] = useState<number[]>([])
  const [stageId, setStageId] = useState("")
  const [gradeId, setGradeId] = useState("")
  const [title, setTitle] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState("")
  const [status, setStatus] = useState("published")
  const [accessDurationDays, setAccessDurationDays] = useState("30")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function handleCoverImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setCoverImageFile(file)
    setCoverImagePreview(file ? URL.createObjectURL(file) : "")
  }

  function resetCoverImage() {
    setCoverImageFile(null)
    setCoverImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

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
      const formData = new FormData()
      formData.append("title", title)
      formData.append("shortDescription", shortDescription)
      formData.append("description", description)
      formData.append("teacherId", teacherId)
      formData.append("educationTypeIds", JSON.stringify(educationTypeIds))
      if (stageId) formData.append("stageId", stageId)
      if (gradeId) formData.append("gradeId", gradeId)
      formData.append("status", status)
      formData.append("accessDurationDays", accessDurationDays || "30")

      if (coverImageFile) {
        formData.append("coverImage", coverImageFile)
      }

      const res = await fetch("/api/admin/courses", {
        method: "POST",
        body: formData,
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
      resetCoverImage()
      setAccessDurationDays("30")
      setEducationTypeIds([])
      setStageId("")
      setGradeId("")
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
        Create a course from the admin panel and select the teacher, education type(s), stage, and grade so it appears to the right students.
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

        <div className="font-bold md:col-span-2">
          Cover Image
          <input
            ref={fileInputRef}
            className="input mt-2"
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
          />

          {coverImagePreview ? (
            <img
              src={coverImagePreview}
              alt="Cover preview"
              className="mt-3 max-h-48 rounded-2xl border border-[var(--line)] object-cover"
            />
          ) : null}
        </div>
      </div>

      <EducationClassificationFields
        educationTypes={educationTypes}
        stages={stages}
        grades={grades}
        selectedTypeIds={educationTypeIds}
        onTypeIdsChange={setEducationTypeIds}
        stageId={stageId}
        onStageIdChange={setStageId}
        gradeId={gradeId}
        onGradeIdChange={setGradeId}
      />

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

