// npm
import Link from "next/link"

export default ({ children, type, page }) =>
  page ? (
    <Link prefetch href={`/item?q=${page}`} as={`/item/${page}`}>
      <a className={`pagination-${type}`}>{children || type}</a>
    </Link>
  ) : (
    <a disabled className={`pagination-${type}`}>
      {children || type}
    </a>
  )
