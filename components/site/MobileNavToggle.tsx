"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

const links = [
  { href: "/subjects", label: "Courses" },
  { href: "/teachers", label: "Teachers" },
  { href: "/certificates", label: "Certificates" },
]

export function MobileNavToggle() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="mobile-nav-icon" data-open={isOpen}>
          <span />
          <span />
          <span />
        </span>
      </button>

      {isOpen ? (
        <>
          <div
            className="mobile-nav-overlay"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="mobile-nav-panel">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

