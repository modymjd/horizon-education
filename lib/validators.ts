import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const teacherSchema = z.object({
  fullName: z.string().min(3, "الاسم يجب ألا يقل عن 3 أحرف"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(8, "رقم الهاتف غير صحيح"),
  password: z.string().min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف"),
  address: z.string().optional(),
  bio: z.string().optional(),
  commission: z.coerce.number().min(0).max(100),
  status: z.enum(["active", "suspended", "banned"]),
})

export const courseSchema = z.object({
  title: z.string().min(3, "اسم الكورس يجب ألا يقل عن 3 أحرف"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  teacherId: z.coerce.number(),
  educationTypeId: z.coerce.number().optional(),
  status: z.enum(["draft", "published", "paused", "ended"]),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  accessDurationDays: z.coerce.number().min(1).optional(),
})
export const paymentSchema = z.object({
  studentId: z.coerce.number(),
  lessonId: z.coerce.number(),
  amountPaid: z.coerce.number().positive(),
  paymentMethodId: z.coerce.number(),
  transactionRef: z.string().optional(),
  notes: z.string().optional(),
})

export const accessCodeSchema = z.object({
  code: z.string().min(6).max(64),
})

export const chapterSchema = z.object({
  title: z.string().min(3, "اسم الشابتر يجب ألا يقل عن 3 أحرف"),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
  sortOrder: z.coerce.number().min(0).optional(),
  status: z.enum(["draft", "published", "hidden"]),
  publishedAt: z.string().optional(),
})
export const lessonSchema = z.object({
  title: z.string().min(3, "اسم الحصة يجب ألا يقل عن 3 أحرف"),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  price: z.coerce.number().min(0, "السعر لا يمكن أن يكون أقل من صفر"),
  sortOrder: z.coerce.number().min(0).optional(),
  status: z.enum(["draft", "published", "hidden"]),
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
})
export const lessonVideoSchema = z.object({
  title: z.string().min(3, "اسم الفيديو يجب ألا يقل عن 3 أحرف"),
  videoUrl: z.string().optional(),
  storagePath: z.string().optional(),
  durationSeconds: z.coerce.number().min(0).optional(),
  sortOrder: z.coerce.number().min(0).optional(),
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
})

export const lessonAttachmentSchema = z.object({
  title: z.string().min(3, "اسم الملف يجب ألا يقل عن 3 أحرف"),
  description: z.string().optional(),
  fileUrl: z.string().min(3, "رابط الملف مطلوب"),
  fileType: z.enum(["pdf", "word", "image", "video", "other"]),
  fileSizeKb: z.coerce.number().min(0).optional(),
  allowDownload: z.coerce.boolean().optional(),
  availableUntil: z.string().optional(),
})