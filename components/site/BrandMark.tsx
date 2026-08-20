import Link from "next/link"

export function BrandMark() {
  return (
    <Link href="/" className="mark" aria-label="Horizon Education">
      <img src="/logos/horizon-logo.png" alt="Horizon Education" className="mark-logo" />
      <span className="mark-word">
        Horizon <b>Education</b>
      </span>
    </Link>
  )
}

