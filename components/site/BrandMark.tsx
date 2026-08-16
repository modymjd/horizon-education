import Link from "next/link"

export function BrandMark() {
  return (
    <Link href="/" className="mark" aria-label="Horizon Education">
      <span className="mark-symbol">H</span>
      <span className="mark-word">
        Horizon <b>Education</b>
      </span>
    </Link>
  )
}
