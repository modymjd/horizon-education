"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const educationTypes = [
  { id: 1, label: "عام / عربي" },
  { id: 2, label: "أزهري" },
  { id: 3, label: "لغات" },
  { id: 4, label: "American" },
  { id: 5, label: "IG" },
  { id: 6, label: "IB" },
  { id: 7, label: "STEM" },
]

const stages = [
  { id: 1, label: "ابتدائي" },
  { id: 2, label: "إعدادي" },
  { id: 3, label: "ثانوي" },
]

const grades = [
  { id: 1, label: "الصف الأول" },
  { id: 2, label: "الصف الثاني" },
  { id: 3, label: "الصف الثالث" },
]

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    whatsapp_phone: "",
    guardian_name: "",
    guardian_phone: "",
    guardian_whatsapp_phone: "",
    national_id: "",
    address: "",
    governorate: "",
    education_type_id: "1",
    stage_id: "3",
    grade_id: "3",
    consent_contact: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [studentCode, setStudentCode] = useState("")

  function updateField(name: keyof typeof form, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")
    setStudentCode("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          education_type_id: Number(form.education_type_id),
          stage_id: Number(form.stage_id),
          grade_id: Number(form.grade_id),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "تعذر إنشاء الحساب")
        return
      }

      setSuccess(data.message || "تم إنشاء الحساب بنجاح")
      setStudentCode(data.student_code || "")

      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main>
      <SiteHeader />

      <section className="auth-section">
        <div className="wrap">
          <div className="card p-6 md:p-10">
            <span className="eyebrow">حساب طالب جديد</span>
            <h1 className="h2">إنشاء حساب طالب</h1>
            <p className="muted mt-4">
              أدخل بيانات الطالب وولي الأمر بدقة. سيستخدم المدرس هذه البيانات للتواصل التعليمي بعد طلب الانضمام للكورس.
            </p>

            {error ? <div className="alert-error mt-6">{error}</div> : null}

            {success ? (
              <div className="alert-success mt-6">
                <p>{success}</p>
                {studentCode ? <p className="mt-2 font-bold">كود الطالب: {studentCode}</p> : null}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-8">
              <div className="form-grid">
                <label className="font-bold">
                  الاسم الكامل
                  <input
                    className="input mt-2"
                    value={form.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    required
                  />
                </label>

                <label className="font-bold">
                  البريد الإلكتروني
                  <input
                    className="input mt-2"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </label>

                <label className="font-bold">
                  كلمة المرور
                  <input
                    className="input mt-2"
                    type="password"
                    minLength={8}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                  />
                </label>

                <label className="font-bold">
                  رقم الهاتف
                  <input
                    className="input mt-2"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    required
                  />
                </label>

                <label className="font-bold">
                  رقم واتساب الطالب
                  <input
                    className="input mt-2"
                    value={form.whatsapp_phone}
                    onChange={(e) => updateField("whatsapp_phone", e.target.value)}
                    required
                  />
                </label>

                <label className="font-bold">
                  الرقم القومي
                  <input
                    className="input mt-2"
                    value={form.national_id}
                    onChange={(e) => updateField("national_id", e.target.value)}
                  />
                </label>

                <label className="font-bold">
                  اسم ولي الأمر
                  <input
                    className="input mt-2"
                    value={form.guardian_name}
                    onChange={(e) => updateField("guardian_name", e.target.value)}
                    required
                  />
                </label>

                <label className="font-bold">
                  رقم ولي الأمر
                  <input
                    className="input mt-2"
                    value={form.guardian_phone}
                    onChange={(e) => updateField("guardian_phone", e.target.value)}
                    required
                  />
                </label>

                <label className="font-bold">
                  واتساب ولي الأمر
                  <input
                    className="input mt-2"
                    value={form.guardian_whatsapp_phone}
                    onChange={(e) => updateField("guardian_whatsapp_phone", e.target.value)}
                  />
                </label>

                <label className="font-bold">
                  المحافظة
                  <input
                    className="input mt-2"
                    value={form.governorate}
                    onChange={(e) => updateField("governorate", e.target.value)}
                    required
                  />
                </label>

                <label className="font-bold md:col-span-2">
                  العنوان
                  <input
                    className="input mt-2"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    required
                  />
                </label>

                <label className="font-bold">
                  نوع التعليم
                  <select
                    className="input mt-2"
                    value={form.education_type_id}
                    onChange={(e) => updateField("education_type_id", e.target.value)}
                  >
                    {educationTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="font-bold">
                  المرحلة
                  <select
                    className="input mt-2"
                    value={form.stage_id}
                    onChange={(e) => updateField("stage_id", e.target.value)}
                  >
                    {stages.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="font-bold">
                  الصف الدراسي
                  <select
                    className="input mt-2"
                    value={form.grade_id}
                    onChange={(e) => updateField("grade_id", e.target.value)}
                  >
                    {grades.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-6 flex items-start gap-3 font-bold">
                <input
                  className="mt-1"
                  type="checkbox"
                  checked={form.consent_contact}
                  onChange={(e) => updateField("consent_contact", e.target.checked)}
                  required
                />
                <span>
                  أوافق على تواصل المنصة والمدرس معي أو مع ولي الأمر عبر الهاتف أو واتساب لأغراض تعليمية وإدارية.
                </span>
              </label>

              <div className="mt-8 flex flex-wrap gap-3">
                <button className="btn disabled:opacity-60" disabled={isLoading}>
                  {isLoading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
                </button>

                <Link href="/login" className="btn btn-outline">
                  لدي حساب بالفعل
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
