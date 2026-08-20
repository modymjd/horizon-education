// Validates uploaded files by inspecting their actual bytes ("magic
// numbers"), instead of trusting the file extension or the
// browser-supplied Content-Type - both of which are trivial to fake.

export type FileSignature =
  | "jpeg"
  | "png"
  | "gif"
  | "webp"
  | "pdf"
  | "zip"
  | "ole"
  | "mp4"
  | "webm"
  | "avi"

function matchesAscii(buffer: Buffer, offset: number, value: string) {
  if (buffer.length < offset + value.length) return false
  return buffer.toString("ascii", offset, offset + value.length) === value
}

export function detectFileSignature(buffer: Buffer): FileSignature | null {
  if (buffer.length < 4) return null

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg"
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png"
  }

  if (matchesAscii(buffer, 0, "GIF87a") || matchesAscii(buffer, 0, "GIF89a")) {
    return "gif"
  }

  if (matchesAscii(buffer, 0, "RIFF") && matchesAscii(buffer, 8, "WEBP")) {
    return "webp"
  }

  if (matchesAscii(buffer, 0, "RIFF") && matchesAscii(buffer, 8, "AVI ")) {
    return "avi"
  }

  if (matchesAscii(buffer, 0, "%PDF-")) {
    return "pdf"
  }

  if (
    (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) ||
    (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x05 && buffer[3] === 0x06)
  ) {
    return "zip"
  }

  if (
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0
  ) {
    return "ole"
  }

  if (matchesAscii(buffer, 4, "ftyp")) {
    return "mp4"
  }

  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return "webm"
  }

  return null
}

type ExtensionRule = {
  extension: string
  signatures: FileSignature[]
}

export const IMAGE_RULES: ExtensionRule[] = [
  { extension: ".jpg", signatures: ["jpeg"] },
  { extension: ".jpeg", signatures: ["jpeg"] },
  { extension: ".png", signatures: ["png"] },
  { extension: ".gif", signatures: ["gif"] },
  { extension: ".webp", signatures: ["webp"] },
]

export const VIDEO_RULES: ExtensionRule[] = [
  { extension: ".mp4", signatures: ["mp4"] },
  { extension: ".mov", signatures: ["mp4"] },
  { extension: ".webm", signatures: ["webm"] },
  { extension: ".avi", signatures: ["avi"] },
]

export const ASSIGNMENT_RULES: ExtensionRule[] = [
  { extension: ".pdf", signatures: ["pdf"] },
  { extension: ".doc", signatures: ["ole"] },
  { extension: ".xls", signatures: ["ole"] },
  { extension: ".ppt", signatures: ["ole"] },
  { extension: ".docx", signatures: ["zip"] },
  { extension: ".xlsx", signatures: ["zip"] },
  { extension: ".pptx", signatures: ["zip"] },
  { extension: ".zip", signatures: ["zip"] },
  { extension: ".jpg", signatures: ["jpeg"] },
  { extension: ".jpeg", signatures: ["jpeg"] },
  { extension: ".png", signatures: ["png"] },
]

export type FileValidationResult =
  | { ok: true; extension: string }
  | { ok: false; reason: string }

export function validateFileAgainstRules(
  buffer: Buffer,
  fileName: string,
  rules: ExtensionRule[]
): FileValidationResult {
  const extension = fileName.includes(".")
    ? "." + fileName.split(".").pop()!.toLowerCase()
    : ""

  const rule = rules.find((r) => r.extension === extension)

  if (!rule) {
    return {
      ok: false,
      reason: `File type "${extension || "unknown"}" is not allowed.`,
    }
  }

  const signature = detectFileSignature(buffer)

  if (!signature || !rule.signatures.includes(signature)) {
    return {
      ok: false,
      reason:
        "The file's content does not match its extension. The file may be corrupted or renamed.",
    }
  }

  return { ok: true, extension }
}
