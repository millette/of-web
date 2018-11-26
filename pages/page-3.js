// npm
import fetch from "isomorphic-unfetch"
import Link from "next/link"

// self
import ProductTeaser from "../components/product-teaser"

const Page3 = ({ product, prev, next }) => {
  if (!product) {
    return (
      <div>
        Nothing to see.{" "}
        <Link href="/">
          <a>Go home</a>
        </Link>
      </div>
    )
  }
  return (
    <div>
      <h1>{product.microdata["@graph"][0].name}</h1>
      <p>
        Hey there, looking for{" "}
        <Link prefetch href="/">
          <a>home</a>
        </Link>
        ?
      </p>
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
      {product && <ProductTeaser product={product} />}
      <pre>{JSON.stringify(product, null, "  ")}</pre>
    </div>
  )
}

Page3.getInitialProps = async ({ req, query }) => {
  const { q } = query
  if (!q) {
    return {}
  }
  try {
    const encrypted = req.socket.encrypted || req.connection.encrypted
    const u = req
      ? `${encrypted ? "https" : "http"}://${req.hostname}/api/mabo?q=${q}`
      : `/api/mabo?q=${q}`
    const res = await fetch(u)
    const json = await res.json()

    if (!json) {
      return {}
    }
    const n = parseInt(q, 10)
    const ret = {
      product: json,
      next: String(n + 1),
    }

    if (n - 1 >= 0) {
      ret.prev = String(n - 1)
    }
    return ret
  } catch (e) {
    return {}
  }
}

export default Page3
