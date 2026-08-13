"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type CourseData = {
  id: number
  title: string
  short_description: string | null
  description: string | null
  cover_image_url: string | null
  status: string
  teacher_id: number
  education_type_id: number | null
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
  education_type_id: number | null
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
}

export function AdminCourseEditForm({
  course,
  teachers,
  educationTypes,
  stages,
  grades,
}: Props) {
  const router = useRouter()

  const [title, setTitle] = useState(course.title || "")
  const [teacherId, setTeacherId] = useState(String(course.teacher_id || ""))
  const [educationTypeId, setEducationTypeId] = useState(
    course.education_type_id ? String(course.education_type_id) : ""
  )
  const [stageId, setStageId] = useState(course.stage_id ? String(course.stage_id) : "")
  const [gradeId, setGradeId] = useState(course.grade_id ? String(course.grade_id) : "")
  const [status, setStatus] = useState(course.status || "published")
  const [accessDurationDays, setAccessDurationDays] = useState(
    String(course.access_duration_days || 30)
  )
  const [coverImageUrl, setCoverImageUrl] = useState(course.cover_image_url || "")
  const [shortDescription, setShortDescription] = useState(
    course.short_description || ""
  )
  const [description, setDescription] = useState(course.description || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const filteredStages = useMemo(() => {
    if (!educationTypeId) return stages

    const matching = stages.filter((stage) => {
      return !stage.education_type_id || String(stage.education_type_id) === educationTypeId
    })

    return matching.length > 0 ? matching : stages
  }, [educationTypeId, stages])

  const filteredGrades = useMemo(() => {
    if (!stageId) return grades

    const matching = grades.filter((grade) => String(grade.stage_id) === stageId)

    return matching.length > 0 ? matching : grades
  }, [stageId, grades])

  function handleEducationTypeChange(value: string) {
    const nextStages = stages.filter((stage) => {
      return !stage.education_type_id || String(stage.education_type_id) === value
    })
    const nextStage = nextStages[0]
    const nextGrades = nextStage
      ? grades.filter((grade) => grade.stage_id === nextStage.id)
      : grades

    setEducationTypeId(value)
    setStageId(nextStage ? String(nextStage.id) : "")
    setGradeId(nextGrades[0] ? String(nextGrades[0].id) : "")
  }

  function handleStageChange(value: string) {
    const nextGrades = grades.filter((grade) => String(grade.stage_id) === value)

    setStageId(value)
    setGradeId(nextGrades[0] ? String(nextGrades[0].id) : "")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!title.trim()) {
      setError("اكتب اسم الكورس")
      return
    }

    if (!teacherId) {
      setError("اختار المدرس")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
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
        setError(data.message || "تعذر تعديل الكورس")
        return
      }

      setSuccess(data.message || "تم تعديل الكورس بنجاح")
      router.refresh()
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card payment-form">
      <span className="eyebrow">تعديل الكورس</span>
      <h2 className="text-3xl font-black">بيانات الكورس</h2>
      <p className="muted mt-3">
        عدّل بيانات الكورس وتأكد من تطابق نوع التعليم والمرحلة والصف مع الطلاب المستهدفين.
      </p>

      {error ? <div className="alert-error mt-5">{error}</div> : null}
      {success ? <div className="alert-success mt-5">{success}</div> : null}

      <div className="form-grid mt-6">
        <label className="font-bold">
          اسم الكورس
          <input
            className="input mt-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className="font-bold">
          المدرس
          <select
            className="input mt-2"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            required
          >
            <option value="">اختر المدرس</option>
            {teachers.map((teacher) => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.full_name}
              </option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          نوع التعليم
          <select
            className="input mt-2"
            value={educationTypeId}
            onChange={(e) => handleEducationTypeChange(e.target.value)}
          >
            <option value="">كل أنواع التعليم</option>
            {educationTypes.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          المرحلة
          <select
            className="input mt-2"
            value={stageId}
            onChange={(e) => handleStageChange(e.target.value)}
          >
            <option value="">كل المراحل</option>
            {filteredStages.map((stage) => (
              <option value={stage.id} key={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          الصف
          <select
            className="input mt-2"
            value={gradeId}
            onChange={(e) => setGradeId(e.target.value)}
          >
            <option value="">كل الصفوف</option>
            {filteredGrades.map((grade) => (
              <option value={grade.id} key={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          الحالة
          <select
            className="input mt-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
            <option value="paused">متوقف مؤقتًا</option>
            <option value="ended">منتهي</option>
          </select>
        </label>

        <label className="font-bold">
          مدة الوصول بالأيام
          <input
            className="input mt-2"
            type="number"
            min="1"
            value={accessDurationDays}
            onChange={(e) => setAccessDurationDays(e.target.value)}
          />
        </label>

        <label className="font-bold">
          رابط صورة الغلاف
          <input
            className="input mt-2"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="اختياري"
          />
        </label>
      </div>

      <label className="mt-4 block font-bold">
        وصف مختصر
        <input
          className="input mt-2"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />
      </label>

      <label className="mt-4 block font-bold">
        وصف كامل
        <textarea
          className="input mt-2 min-h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
      </button>
    </form>
  )
}
