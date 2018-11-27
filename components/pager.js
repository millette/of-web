// self
import { PagerLink } from "../components"

export default ({ n, nProducts }) => {
  const previous = n - 1 >= 0 && String(n - 1)
  const next = n + 1 < nProducts && String(n + 1)
  return (
    <nav
      className="pagination is-rounded"
      role="navigation"
      aria-label="pagination"
    >
      <PagerLink type="previous" page={previous} />
      <PagerLink type="next" page={next} />
    </nav>
  )
}
