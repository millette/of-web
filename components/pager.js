// npm
import Link from "next/link"

export default ({ n, nProducts }) => {
  const prev = n - 1 >= 0 && String(n - 1)
  const next = n + 1 < nProducts && String(n + 1)
  return (
    <ul>
      {prev && (
        <li>
          <Link prefetch href={`/page-3?q=${prev}`} as={`/page-3/${prev}`}>
            <a>prev</a>
          </Link>
        </li>
      )}
      {next && (
        <li>
          <Link prefetch href={`/page-3?q=${next}`} as={`/page-3/${next}`}>
            <a>next</a>
          </Link>
        </li>
      )}
    </ul>
  )
}
