"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { EducationClassificationFields } from "./EducationClassificationFields"

type CourseData = {
  id: number
  title: string
  short_description: string | null
  description: string | null
  cover_image_url: string | null
  status: string
  teacher_id: number
  stage_id: number | null
  grade_id: number | null
  access_duration_days: number | null
}

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
  course: CourseData
  teachers: TeacherOption[]
  educationTypes: EducationTypeOption[]
  stages: StageOption[]
  grades: GradeOption[]
  initialEducationTypeIds: number[]
}

export function AdminCourseEditForm({
  course,
  teachers,
  educationTypes,
  stages,
  grades,
  initialEducationTypeIds,
}: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(course.title || "")
  const [teacherId, setTeacherId] = useState(String(course.teacher_id || ""))
  const [educationTypeIds, setEducationTypeIds] = useState<number[]>(
    initialEducationTypeIds || []
  )
  const [stageId, setStageId] = useState(course.stage_id ? String(course.stage_id) : "")
  const [gradeId, setGradeId] = useState(course.grade_id ? String(course.grade_id) : "")
  const [status, setStatus] = useState(course.status || "published")
  const [accessDurationDays, setAccessDurationDays] = useState(
    String(course.access_duration_days || 30)
  )
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState(
    course.cover_image_url || ""
  )
  const [shortDescription, setShortDescription] = useState(
    course.short_description || ""
  )
  const [description, setDescription] = useState(course.description || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function handleCoverImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setCoverImageFile(file)
    setCoverImagePreview(file ? URL.createObjectURL(file) : course.cover_image_url || "")
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
      formData.append("existingCoverImageUrl", course.cover_image_url || "")

      if (coverImageFile) {
        formData.append("coverImage", coverImageFile)
      }

      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to update course")
        return
      }

      setSuccess(data.message || "Course updated successfully")
      router.refresh()
    } catch {
      setError("Unable to connect to the server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card payment-form">
      <span className="eyebrow">Edit Course</span>
      <h2 className="text-3xl font-black">Course Details</h2>
      <p className="muted mt-3">
        Update course details and make sure the education type(s), stage, and grade match the target students.
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
        />
      </label>

      <label className="mt-4 block font-bold">
        Full Description
        <textarea
          className="input mt-2 min-h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save changes"}
      </button>
    </form>
  )
}

