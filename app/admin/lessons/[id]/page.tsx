import LessonDetailsClient from "./lesson-details-client"

async function getLessonDetails(id: string) {
  const videosRes = await fetch(
    `http://localhost:3000/api/admin/lessons/${id}/videos`,
    {
      cache: "no-store",
    }
  )

  const attachmentsRes = await fetch(
    `http://localhost:3000/api/admin/lessons/${id}/attachments`,
    {
      cache: "no-store",
    }
  )

  const videosData = videosRes.ok
    ? await videosRes.json()
    : { lesson: null, videos: [] }

  const attachmentsData = attachmentsRes.ok
    ? await attachmentsRes.json()
    : { attachments: [] }

  return {
    lesson: videosData.lesson,
    videos: videosData.videos || [],
    attachments: attachmentsData.attachments || [],
  }
}

export default async function LessonDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getLessonDetails(id)

  return (
    <LessonDetailsClient
      lesson={data.lesson}
      initialVideos={data.videos}
      initialAttachments={data.attachments}
    />
  )
}