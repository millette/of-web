// npm
import fetch from "isomorphic-unfetch"
import Link from "next/link"

// self
import ProductTeaser from "../components/product-teaser"

const Page3 = ({ product, prev, next }) => (
  <div>
    <h1>{product.microdata["@graph"][0].name}</h1>
    <p>
      Hey there, looking for{" "}
      <Link prefetch href="/">
        <a>home</a>
      </Link>
      ?
    </p>
    <ol>
      {prev && (
        <li>
          <Link prefetch href={`/page-3?q=${prev}`}>
            <a>prev</a>
          </Link>
        </li>
      )}
      {next && (
        <li>
          <Link prefetch href={`/page-3?q=${next}`}>
            <a>next</a>
          </Link>
        </li>
      )}
    </ol>
    {product && <ProductTeaser product={product} />}
    <pre>{JSON.stringify(product, null, "  ")}</pre>
  </div>
)

Page3.getInitialProps = async ({ req, query }) => {
  const { q } = query
  if (!q) {
    return {}
  }

  let json
  if (req) {
    json = require("../static/mabo.json")
  } else {
    const res = await fetch("/static/mabo.json")
    json = await res.json()
  }
  if (!json[0].products[q]) {
    return {}
  }

  const len = json[0].products.length
  const ret = { product: json[0].products[q] }
  const n = parseInt(q, 10)
  if (n - 1 >= 0) {
    ret.prev = String(n - 1)
  }
  if (n + 1 < len) {
    ret.next = String(n + 1)
  }
  return ret
}

export default Page3
