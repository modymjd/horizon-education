import ChapterLessonsClient from "./chapter-lessons-client"

async function getChapterLessons(id: string) {
  const res = await fetch(
    `http://localhost:3000/api/admin/chapters/${id}/lessons`,
    {
      cache: "no-store",
    }
  )

  if (!res.ok) {
    return {
      chapter: null,
      lessons: [],
    }
  }

  return res.json()
}

export default async function ChapterLessonsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getChapterLessons(id)

  return (
    <ChapterLessonsClient
      chapter={data.chapter}
      initialLessons={data.lessons || []}
    />
  )
}