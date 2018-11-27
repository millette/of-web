// npm
import Link from "next/link"

const PagerLink = ({ type, page }) =>
  page ? (
    <Link prefetch href={`/item?q=${page}`} as={`/item/${page}`}>
      <a className={`pagination-${type}`}>{type}</a>
    </Link>
  ) : (
    <a disabled className={`pagination-${type}`}>
      {type}
    </a>
  )

export default ({ n, nProducts }) => {
  const prev = n - 1 >= 0 && String(n - 1)
  const next = n + 1 < nProducts && String(n + 1)
  return (
    <nav
      className="pagination is-rounded"
      role="navigation"
      aria-label="pagination"
    >
      <PagerLink type="previous" page={prev} />
      <PagerLink type="next" page={next} />
    </nav>
  )
}
