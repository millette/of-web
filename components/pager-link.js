// npm
import Link from "next/link"

export default ({ type, page }) =>
  page ? (
    <Link prefetch href={`/item?q=${page}`} as={`/item/${page}`}>
      <a className={`pagination-${type}`}>{type}</a>
    </Link>
  ) : (
    <a disabled className={`pagination-${type}`}>
      {type}
    </a>
  )
