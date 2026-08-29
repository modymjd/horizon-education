"use client"

import Link from "next/link"
import { useState } from "react"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import type { Teacher } from "./page"

type FormState = {
  fullName: string
  email: string
  phone: string
  password: string
  address: string
  bio: string
  commission: string
  status: "active" | "suspended" | "banned"
}

const emptyForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  address: "",
  bio: "",
  commission: "20",
  status: "active",
}

const statusLabel = {
  active: "Active",
  suspended: "Suspended",
  banned: "Banned",
}

function getInitials(name: string) {
  return name.trim().slice(0, 1) || "T"
}

export default function TeachersClient({
  initialTeachers,
}: {
  initialTeachers: Teacher[]
}) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const activeTeachers = teachers.filter((t) => t.status === "active").length
  const totalCourses = teachers.reduce(
    (sum, t) => sum + Number(t.courses_count || 0),
    0
  )
  const avgCommission =
    teachers.length > 0
      ? (
          teachers.reduce(
            (sum, t) => sum + Number(t.platform_commission_pct || 0),
            0
          ) / teachers.length
        ).toFixed(1)
      : "0"

  async function reloadTeachers() {
    const res = await fetch("/api/admin/teachers", {
      cache: "no-store",
    })

    const data = await res.json()
    setTeachers(data.teachers || [])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          address: form.address,
          bio: form.bio,
          commission: form.commission,
          status: form.status,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to create teacher")
        return
      }

      setMessage(data.message || "Teacher created successfully")
      setForm(emptyForm)
      setShowForm(false)
      await reloadTeachers()
    } catch {
      setError("Unable to connect to the server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main>
      <SiteHeader />

      <section className="admin-page-hero">
        <div className="wrap">
          <span className="eyebrow">Admin Dashboard</span>
          <h1 className="h1">Manage Teachers</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            Create teacher accounts and review their status, platform percentage, and number of courses.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/admin" className="btn btn-outline">
              Back to Admin Dashboard
            </Link>

            <button
              className="btn"
              type="button"
              onClick={() => setShowForm((value) => !value)}
            >
              {showForm ? "Close Form" : "Add Teacher"}
            </button>
          </div>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="admin-summary-grid">
            <div className="card summary-card">
              <b>{teachers.length}</b>
              <span className="muted font-bold">Total Teachers</span>
            </div>
            <div className="card summary-card">
              <b>{activeTeachers}</b>
              <span className="muted font-bold">Active Teachers</span>
            </div>
            <div className="card summary-card">
              <b>{totalCourses}</b>
              <span className="muted font-bold">Total Courses</span>
            </div>
            <div className="card summary-card">
              <b>{avgCommission}%</b>
              <span className="muted font-bold">Avg. Platform Share</span>
            </div>
          </div>

          {message ? <div className="alert-success mt-2 mb-6">{message}</div> : null}
          {error ? <div className="alert-error mt-2 mb-6">{error}</div> : null}

          {showForm ? (
            <form onSubmit={handleSubmit} className="card p-6 md:p-8 mb-8">
              <span className="eyebrow">New Account</span>
              <h2 className="text-2xl font-black mt-2">Add New Teacher</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="font-bold">
                  Full Name
                  <input
                    className="input mt-2"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    required
                  />
                </label>

                <label className="font-bold">
                  Email Address
                  <input
                    className="input mt-2"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </label>

                <label className="font-bold">
                  Phone Number
                  <input
                    className="input mt-2"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    required
                  />
                </label>

                <label className="font-bold">
                  Password
                  <input
                    className="input mt-2"
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                  />
                </label>

                <label className="font-bold">
                  Address
                  <input
                    className="input mt-2"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </label>

                <label className="font-bold">
                  Platform Percentage %
                  <input
                    className="input mt-2"
                    type="number"
                    min="0"
                    max="100"
                    value={form.commission}
                    onChange={(e) =>
                      setForm({ ...form, commission: e.target.value })
                    }
                    required
                  />
                </label>

                <label className="font-bold">
                  Account Status
                  <select
                    className="input mt-2"
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as FormState["status"],
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </label>

                <label className="font-bold md:col-span-2">
                  Teacher Bio
                  <textarea
                    className="input mt-2 min-h-28"
                    value={form.bio}
                    onChange={(e) =>
                      setForm({ ...form, bio: e.target.value })
                    }
                  />
                </label>
              </div>

              <button
                className="btn mt-6 disabled:opacity-60"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? "Saving..." : "Save Teacher"}
              </button>
            </form>
          ) : null}

          <div className="toolbar">
            <div>
              <span className="eyebrow">Directory</span>
              <h2 className="text-3xl font-black">Teachers List</h2>
            </div>

            <span className="badge">{teachers.length} teachers</span>
          </div>

          <div className="card admin-table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Platform %</th>
                  <th>Courses</th>
                </tr>
              </thead>

              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>
                      <div className="table-user">
                        <div className="table-avatar">
                          {getInitials(teacher.full_name)}
                        </div>
                        <div>
                          <b>{teacher.full_name}</b>
                          <p className="muted mt-1 text-sm">
                            {teacher.address || "No address"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{teacher.email}</td>
                    <td>{teacher.phone}</td>
                    <td>
                      <span className="badge">
                        {statusLabel[teacher.status]}
                      </span>
                    </td>
                    <td>{teacher.platform_commission_pct}%</td>
                    <td>{teacher.courses_count}</td>
                  </tr>
                ))}

                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center muted">
                      No teachers yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
