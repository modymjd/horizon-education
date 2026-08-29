"use client"

import { useState } from "react"

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
  educationTypes: EducationTypeOption[]
  stages: StageOption[]
  grades: GradeOption[]
  selectedTypeIds: number[]
  onTypeIdsChange: (ids: number[]) => void
  stageId: string
  onStageIdChange: (value: string) => void
  gradeId: string
  onGradeIdChange: (value: string) => void
}

export function EducationClassificationFields({
  educationTypes,
  stages,
  grades,
  selectedTypeIds,
  onTypeIdsChange,
  stageId,
  onStageIdChange,
  gradeId,
  onGradeIdChange,
}: Props) {
  const [localTypes, setLocalTypes] = useState(educationTypes)
  const [localStages, setLocalStages] = useState(stages)
  const [localGrades, setLocalGrades] = useState(grades)

  const [isAddingType, setIsAddingType] = useState(false)
  const [newTypeName, setNewTypeName] = useState("")
  const [typeError, setTypeError] = useState("")
  const [isSavingType, setIsSavingType] = useState(false)

  const [isAddingStage, setIsAddingStage] = useState(false)
  const [newStageName, setNewStageName] = useState("")
  const [stageError, setStageError] = useState("")
  const [isSavingStage, setIsSavingStage] = useState(false)

  const [isAddingGrade, setIsAddingGrade] = useState(false)
  const [newGradeName, setNewGradeName] = useState("")
  const [gradeError, setGradeError] = useState("")
  const [isSavingGrade, setIsSavingGrade] = useState(false)

  const filteredGrades = stageId
    ? localGrades.filter((grade) => String(grade.stage_id) === stageId)
    : localGrades

  function toggleType(id: number) {
    if (selectedTypeIds.includes(id)) {
      onTypeIdsChange(selectedTypeIds.filter((existing) => existing !== id))
    } else {
      onTypeIdsChange([...selectedTypeIds, id])
    }
  }

  async function handleAddType() {
    setTypeError("")

    if (!newTypeName.trim()) {
      setTypeError("Enter a name.")
      return
    }

    setIsSavingType(true)

    try {
      const res = await fetch("/api/admin/education-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setTypeError(data.message || "Unable to add the education type.")
        return
      }

      const added = data.educationType as EducationTypeOption

      setLocalTypes((current) =>
        current.some((item) => item.id === added.id) ? current : [...current, added]
      )
      onTypeIdsChange([...selectedTypeIds, added.id])
      setNewTypeName("")
      setIsAddingType(false)
    } catch {
      setTypeError("Unable to connect to the server.")
    } finally {
      setIsSavingType(false)
    }
  }

  async function handleAddStage() {
    setStageError("")

    if (!newStageName.trim()) {
      setStageError("Enter a name.")
      return
    }

    setIsSavingStage(true)

    try {
      const res = await fetch("/api/admin/stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStageName.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStageError(data.message || "Unable to add the stage.")
        return
      }

      const added = data.stage as StageOption

      setLocalStages((current) =>
        current.some((item) => item.id === added.id) ? current : [...current, added]
      )
      onStageIdChange(String(added.id))
      onGradeIdChange("")
      setNewStageName("")
      setIsAddingStage(false)
    } catch {
      setStageError("Unable to connect to the server.")
    } finally {
      setIsSavingStage(false)
    }
  }

  async function handleAddGrade() {
    setGradeError("")

    if (!stageId) {
      setGradeError("Choose a stage first.")
      return
    }

    if (!newGradeName.trim()) {
      setGradeError("Enter a name.")
      return
    }

    setIsSavingGrade(true)

    try {
      const res = await fetch("/api/admin/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGradeName.trim(), stageId: Number(stageId) }),
      })

      const data = await res.json()

      if (!res.ok) {
        setGradeError(data.message || "Unable to add the grade.")
        return
      }

      const added = data.grade as GradeOption

      setLocalGrades((current) =>
        current.some((item) => item.id === added.id) ? current : [...current, added]
      )
      onGradeIdChange(String(added.id))
      setNewGradeName("")
      setIsAddingGrade(false)
    } catch {
      setGradeError("Unable to connect to the server.")
    } finally {
      setIsSavingGrade(false)
    }
  }

  return (
    <div className="education-fields mt-4 grid gap-5">
      <div>
        <div className="flex items-center justify-between">
          <span className="font-bold">Education Type(s)</span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setIsAddingType((current) => !current)}
          >
            {isAddingType ? "Cancel" : "+ Add new"}
          </button>
        </div>

        <p className="muted mt-1 text-sm">
          Select one or more curricula this course applies to (e.g. Languages + Azhari).
        </p>

        <div className="education-checkbox-grid mt-3">
          {localTypes.map((type) => (
            <label className="education-checkbox" key={type.id}>
              <input
                type="checkbox"
                checked={selectedTypeIds.includes(type.id)}
                onChange={() => toggleType(type.id)}
              />
              {type.name}
            </label>
          ))}

          {localTypes.length === 0 ? (
            <p className="muted text-sm">No education types yet - add one below.</p>
          ) : null}
        </div>

        {isAddingType ? (
          <div className="education-add-row mt-3">
            <input
              className="input"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="e.g. British, Canadian..."
            />
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleAddType}
              disabled={isSavingType}
            >
              {isSavingType ? "Adding..." : "Add"}
            </button>
          </div>
        ) : null}

        {typeError ? <p className="mt-2 text-sm font-bold text-red-600">{typeError}</p> : null}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="font-bold">Stage</span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setIsAddingStage((current) => !current)}
          >
            {isAddingStage ? "Cancel" : "+ Add new"}
          </button>
        </div>

        <select
          className="input mt-2"
          value={stageId}
          onChange={(e) => {
            onStageIdChange(e.target.value)
            onGradeIdChange("")
          }}
        >
          <option value="">All stages</option>
          {localStages.map((stage) => (
            <option value={stage.id} key={stage.id}>
              {stage.name}
            </option>
          ))}
        </select>

        {isAddingStage ? (
          <div className="education-add-row mt-3">
            <input
              className="input"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="e.g. Kindergarten"
            />
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleAddStage}
              disabled={isSavingStage}
            >
              {isSavingStage ? "Adding..." : "Add"}
            </button>
          </div>
        ) : null}

        {stageError ? <p className="mt-2 text-sm font-bold text-red-600">{stageError}</p> : null}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="font-bold">Grade</span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setIsAddingGrade((current) => !current)}
          >
            {isAddingGrade ? "Cancel" : "+ Add new"}
          </button>
        </div>

        <select
          className="input mt-2"
          value={gradeId}
          onChange={(e) => onGradeIdChange(e.target.value)}
        >
          <option value="">All grades</option>
          {filteredGrades.map((grade) => (
            <option value={grade.id} key={grade.id}>
              {grade.name}
            </option>
          ))}
        </select>

        {isAddingGrade ? (
          <div className="education-add-row mt-3">
            <input
              className="input"
              value={newGradeName}
              onChange={(e) => setNewGradeName(e.target.value)}
              placeholder="e.g. Grade 4"
            />
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleAddGrade}
              disabled={isSavingGrade}
            >
              {isSavingGrade ? "Adding..." : "Add"}
            </button>
          </div>
        ) : null}

        {!stageId ? (
          <p className="muted mt-2 text-sm">Choose a stage first to add a grade under it.</p>
        ) : null}

        {gradeError ? <p className="mt-2 text-sm font-bold text-red-600">{gradeError}</p> : null}
      </div>
    </div>
  )
}

