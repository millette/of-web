// npm
import Link from "next/link"

export default ({ n, nProducts }) => {
  const prev = n - 1 >= 0 && String(n - 1)
  const next = n + 1 < nProducts && String(n + 1)
  return (
    <nav
      className="pagination is-rounded"
      role="navigation"
      aria-label="pagination"
    >
      {prev && (
        <Link prefetch href={`/item?q=${prev}`} as={`/item/${prev}`}>
          <a className="pagination-previous">prev</a>
        </Link>
      )}
      {next && (
        <Link prefetch href={`/item?q=${next}`} as={`/item/${next}`}>
          <a className="pagination-next">next</a>
        </Link>
      )}
    </nav>
  )
}
