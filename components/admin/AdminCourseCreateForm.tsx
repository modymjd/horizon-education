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

  const filteredStages = stages.filter((stage) => {
    if (!educationTypeId) return true
    return !stage.education_type_id || String(stage.education_type_id) === educationTypeId
  })

  const filteredGrades = grades.filter((grade) => {
    if (!stageId) return true
    return String(grade.stage_id) === stageId
  })

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
        setError(data.message || "تعذر إنشاء الكورس")
        return
      }

      setSuccess(data.message || "تم إنشاء الكورس بنجاح")
      setTitle("")
      setShortDescription("")
      setDescription("")
      setCoverImageUrl("")
      setAccessDurationDays("30")
      router.refresh()
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card payment-form mb-8">
      <span className="eyebrow">إضافة كورس</span>
      <h2 className="text-3xl font-black">إنشاء كورس جديد</h2>
      <p className="muted mt-3">
        أنشئ الكورس من لوحة الأدمن وحدد المدرس ونوع التعليم والمرحلة والصف ليظهر للطلاب المناسبين.
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
            placeholder="مثال: رياضيات الصف الثالث الثانوي لغات"
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
            onChange={(e) => {
              setEducationTypeId(e.target.value)
              setStageId("")
              setGradeId("")
            }}
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
            onChange={(e) => {
              setStageId(e.target.value)
              setGradeId("")
            }}
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
          placeholder="وصف يظهر في كارت الكورس"
        />
      </label>

      <label className="mt-4 block font-bold">
        وصف كامل
        <textarea
          className="input mt-2 min-h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="تفاصيل الكورس..."
        />
      </label>

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "جاري إنشاء الكورس..." : "إنشاء الكورس"}
      </button>
    </form>
  )
}
