"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

type EducationTypeOption = {
  id: number
  name: string
  slug: string
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

type EducationOptionsResponse = {
  educationTypes: EducationTypeOption[]
  stages: StageOption[]
  grades: GradeOption[]
}

type FieldErrors = Partial<Record<keyof typeof initialForm | "form", string>>

const initialForm = {
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
  education_type_id: "",
  stage_id: "",
  grade_id: "",
  consent_contact: false,
}

function normalizeDigits(value: string) {
  return value.replace(/[^\d+]/g, "")
}

function isValidPhone(value: string) {
  const normalized = normalizeDigits(value)
  return normalized.length >= 8
}

function getClientValidationErrors(form: typeof initialForm) {
  const errors: FieldErrors = {}

  if (form.full_name.trim().length < 3) {
    errors.full_name = "Full name must be at least 3 characters."
  }

  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = "Please enter a valid email address."
  }

  if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters."
  }

  if (!isValidPhone(form.phone)) {
    errors.phone = "Phone number must be at least 8 digits."
  }

  if (!isValidPhone(form.whatsapp_phone)) {
    errors.whatsapp_phone = "Student WhatsApp number must be at least 8 digits."
  }

  if (form.guardian_name.trim().length < 3) {
    errors.guardian_name = "Guardian name must be at least 3 characters."
  }

  if (!isValidPhone(form.guardian_phone)) {
    errors.guardian_phone = "Guardian phone must be at least 8 digits."
  }

  if (form.guardian_whatsapp_phone && !isValidPhone(form.guardian_whatsapp_phone)) {
    errors.guardian_whatsapp_phone = "Guardian WhatsApp number must be at least 8 digits."
  }

  if (form.address.trim().length < 3) {
    errors.address = "Address must be at least 3 characters."
  }

  if (form.governorate.trim().length < 2) {
    errors.governorate = "Governorate must be at least 2 characters."
  }

  if (!form.education_type_id) {
    errors.education_type_id = "Please select an education type."
  }

  if (!form.stage_id) {
    errors.stage_id = "Please select a stage."
  }

  if (!form.grade_id) {
    errors.grade_id = "Please select a grade."
  }

  if (!form.consent_contact) {
    errors.consent_contact =
      "You must agree to educational and administrative contact."
  }

  return errors
}

export default function RegisterPage() {
  const router = useRouter()

  const [options, setOptions] = useState<EducationOptionsResponse>({
    educationTypes: [],
    stages: [],
    grades: [],
  })

  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [studentCode, setStudentCode] = useState("")

  const filteredStages = useMemo(() => {
    if (!form.education_type_id) return options.stages

    const matching = options.stages.filter((stage) => {
      return (
        !stage.education_type_id ||
        String(stage.education_type_id) === form.education_type_id
      )
    })

    return matching.length > 0 ? matching : options.stages
  }, [form.education_type_id, options.stages])

  const filteredGrades = useMemo(() => {
    if (!form.stage_id) return options.grades

    const matching = options.grades.filter((grade) => {
      return String(grade.stage_id) === form.stage_id
    })

    return matching.length > 0 ? matching : options.grades
  }, [form.stage_id, options.grades])

  useEffect(() => {
    let mounted = true

    fetch("/api/education-options", {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data: EducationOptionsResponse) => {
        if (!mounted) return

        const educationTypes = data.educationTypes || []
        const stages = data.stages || []
        const grades = data.grades || []

        const defaultEducationType =
          educationTypes.find((item) => item.slug === "languages") ||
          educationTypes[0]
        const defaultStages = defaultEducationType
          ? stages.filter(
              (stage) =>
                !stage.education_type_id ||
                stage.education_type_id === defaultEducationType.id
            )
          : stages
        const defaultStage = defaultStages[0]
        const defaultGrades = defaultStage
          ? grades.filter((grade) => grade.stage_id === defaultStage.id)
          : grades
        const defaultGrade = defaultGrades[0]

        setOptions({
          educationTypes,
          stages,
          grades,
        })

        setForm((current) => ({
          ...current,
          education_type_id: defaultEducationType ? String(defaultEducationType.id) : "",
          stage_id: defaultStage ? String(defaultStage.id) : "",
          grade_id: defaultGrade ? String(defaultGrade.id) : "",
        }))
      })
      .catch(() => {
        if (mounted) {
          setError("Unable to load education options.")
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingOptions(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  function updateField(name: keyof typeof form, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    setFieldErrors((current) => ({
      ...current,
      [name]: undefined,
    }))
  }

  function handleEducationTypeChange(value: string) {
    const nextStages = options.stages.filter((stage) => {
      return !stage.education_type_id || String(stage.education_type_id) === value
    })
    const nextStage = nextStages[0]
    const nextGrades = nextStage
      ? options.grades.filter((grade) => grade.stage_id === nextStage.id)
      : options.grades

    setForm((current) => ({
      ...current,
      education_type_id: value,
      stage_id: nextStage ? String(nextStage.id) : "",
      grade_id: nextGrades[0] ? String(nextGrades[0].id) : "",
    }))

    setFieldErrors((current) => ({
      ...current,
      education_type_id: undefined,
      stage_id: undefined,
      grade_id: undefined,
    }))
  }

  function handleStageChange(value: string) {
    const nextGrades = options.grades.filter((grade) => String(grade.stage_id) === value)

    setForm((current) => ({
      ...current,
      stage_id: value,
      grade_id: nextGrades[0] ? String(nextGrades[0].id) : "",
    }))

    setFieldErrors((current) => ({
      ...current,
      stage_id: undefined,
      grade_id: undefined,
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")
    setStudentCode("")

    const clientErrors = getClientValidationErrors(form)

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      setError("Please fix the highlighted fields and try again.")
      return
    }

    setFieldErrors({})
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: normalizeDigits(form.phone),
          whatsapp_phone: normalizeDigits(form.whatsapp_phone),
          guardian_name: form.guardian_name.trim(),
          guardian_phone: normalizeDigits(form.guardian_phone),
          guardian_whatsapp_phone: form.guardian_whatsapp_phone
            ? normalizeDigits(form.guardian_whatsapp_phone)
            : "",
          national_id: form.national_id.trim(),
          address: form.address.trim(),
          governorate: form.governorate.trim(),
          education_type_id: Number(form.education_type_id),
          stage_id: Number(form.stage_id),
          grade_id: Number(form.grade_id),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to create account.")

        if (data.errors) {
          setFieldErrors(data.errors)
        }

        return
      }

      setSuccess(data.message || "Account created successfully.")
      setStudentCode(data.student_code || "")

      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch {
      setError("Unable to connect to the server.")
    } finally {
      setIsLoading(false)
    }
  }

  function FieldError({ name }: { name: keyof typeof initialForm }) {
    const message = fieldErrors[name]

    if (!message) return null

    return <p className="mt-2 text-sm font-bold text-red-600">{message}</p>
  }

  return (
    <main>
      <SiteHeader />

      <section className="auth-section">
        <div className="wrap">
          <div className="card p-6 md:p-10">
            <span className="eyebrow">New Student Account</span>
            <h1 className="h2">Create a Student Account</h1>
            <p className="muted mt-4">
              Enter the student and guardian details accurately. Teachers will use this information for educational communication after course join requests.
            </p>

            {error ? <div className="alert-error mt-6">{error}</div> : null}

            {success ? (
              <div className="alert-success mt-6">
                <p>{success}</p>
                {studentCode ? <p className="mt-2 font-bold">Student code: {studentCode}</p> : null}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-8" noValidate>
              <div className="form-grid">
                <label className="font-bold">
                  Full Name
                  <input
                    className="input mt-2"
                    value={form.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    required
                    dir="ltr"
                  />
                  <FieldError name="full_name" />
                </label>

                <label className="font-bold">
                  Email Address
                  <input
                    className="input mt-2"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                    dir="ltr"
                  />
                  <FieldError name="email" />
                </label>

                <label className="font-bold">
                  Password
                  <input
                    className="input mt-2"
                    type="password"
                    minLength={8}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                    dir="ltr"
                  />
                  <FieldError name="password" />
                </label>

                <label className="font-bold">
                  Phone Number
                  <input
                    className="input mt-2"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    required
                    dir="ltr"
                  />
                  <FieldError name="phone" />
                </label>

                <label className="font-bold">
                  Student WhatsApp Number
                  <input
                    className="input mt-2"
                    inputMode="tel"
                    value={form.whatsapp_phone}
                    onChange={(e) => updateField("whatsapp_phone", e.target.value)}
                    required
                    dir="ltr"
                  />
                  <FieldError name="whatsapp_phone" />
                </label>

                <label className="font-bold">
                  National ID
                  <input
                    className="input mt-2"
                    value={form.national_id}
                    onChange={(e) => updateField("national_id", e.target.value)}
                    dir="ltr"
                  />
                  <FieldError name="national_id" />
                </label>

                <label className="font-bold">
                  Guardian Name
                  <input
                    className="input mt-2"
                    value={form.guardian_name}
                    onChange={(e) => updateField("guardian_name", e.target.value)}
                    required
                    dir="ltr"
                  />
                  <FieldError name="guardian_name" />
                </label>

                <label className="font-bold">
                  Guardian Phone
                  <input
                    className="input mt-2"
                    inputMode="tel"
                    value={form.guardian_phone}
                    onChange={(e) => updateField("guardian_phone", e.target.value)}
                    required
                    dir="ltr"
                  />
                  <FieldError name="guardian_phone" />
                </label>

                <label className="font-bold">
                  Guardian WhatsApp
                  <input
                    className="input mt-2"
                    inputMode="tel"
                    value={form.guardian_whatsapp_phone}
                    onChange={(e) => updateField("guardian_whatsapp_phone", e.target.value)}
                    dir="ltr"
                  />
                  <FieldError name="guardian_whatsapp_phone" />
                </label>

                <label className="font-bold">
                  Governorate
                  <input
                    className="input mt-2"
                    value={form.governorate}
                    onChange={(e) => updateField("governorate", e.target.value)}
                    required
                    dir="ltr"
                  />
                  <FieldError name="governorate" />
                </label>

                <label className="font-bold md:col-span-2">
                  Address
                  <input
                    className="input mt-2"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    required
                    dir="ltr"
                  />
                  <FieldError name="address" />
                </label>

                <label className="font-bold">
                  Education Type
                  <select
                    className="input mt-2"
                    value={form.education_type_id}
                    onChange={(e) => handleEducationTypeChange(e.target.value)}
                    disabled={isLoadingOptions}
                    required
                    dir="ltr"
                  >
                    <option value="">Select education type</option>
                    {options.educationTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <FieldError name="education_type_id" />
                </label>

                <label className="font-bold">
                  Stage
                  <select
                    className="input mt-2"
                    value={form.stage_id}
                    onChange={(e) => handleStageChange(e.target.value)}
                    disabled={isLoadingOptions}
                    required
                    dir="ltr"
                  >
                    <option value="">Select stage</option>
                    {filteredStages.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <FieldError name="stage_id" />
                </label>

                <label className="font-bold">
                  Grade
                  <select
                    className="input mt-2"
                    value={form.grade_id}
                    onChange={(e) => updateField("grade_id", e.target.value)}
                    disabled={isLoadingOptions}
                    required
                    dir="ltr"
                  >
                    <option value="">Select grade</option>
                    {filteredGrades.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <FieldError name="grade_id" />
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
                  I agree that the platform and teachers may contact me or my guardian by phone or WhatsApp for educational and administrative purposes.
                </span>
              </label>
              <FieldError name="consent_contact" />

              <div className="mt-8 flex flex-wrap gap-3">
                <button className="btn disabled:opacity-60" disabled={isLoading || isLoadingOptions}>
                  {isLoading ? "Creating account..." : "Create account"}
                </button>

                <Link href="/login" className="btn btn-outline">
                  I already have an account
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
