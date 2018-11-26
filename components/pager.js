// npm
import Link from "next/link"

export default ({ n, nProducts }) => {
  const prev = n - 1 >= 0 && String(n - 1)
  const next = n + 1 < nProducts && String(n + 1)
  return (
    <ul>
      {prev && (
        <li>
          <Link prefetch href={`/item?q=${prev}`} as={`/item/${prev}`}>
            <a>prev</a>
          </Link>
        </li>
      )}
      {next && (
        <li>
          <Link prefetch href={`/item?q=${next}`} as={`/item/${next}`}>
            <a>next</a>
          </Link>
        </li>
      )}
    </ul>
  )
}
