// npm
import fetch from "isomorphic-unfetch"
import Link from "next/link"

// self
import { ProductTeaser, Pager } from "../components"
import { baseUrl } from "../utils"

const Nothing = () => (
  <section className="section">
    <div className="container">
      Nothing to see.{" "}
      <Link prefetch href="/">
        <a>Go home</a>
      </Link>
    </div>
  </section>
)

const Page3 = ({ product, n, nProducts, prev, next }) => {
  if (!product) return <Nothing />
  return (
    <section className="section">
      <div className="container">
        <h1 className="title is-1">{product.microdata["@graph"][0].name}</h1>
        <h2 className="subtitle is-3">
          #{n} of {nProducts}
        </h2>
        <div className="columns">
          <div className="column is-narrow">
            <Pager n={n - 1} nProducts={nProducts} />
          </div>
          <div className="column">
            <p>
              Hey there, looking for{" "}
              <Link prefetch href="/">
                <a>home</a>
              </Link>
              ?
            </p>
          </div>
        </div>
        <ProductTeaser product={product} />
        <pre>{JSON.stringify(product, null, "  ")}</pre>
      </div>
    </section>
  )
}

Page3.getInitialProps = async ({ req, query }) => {
  if (!query.q) return {}
  try {
    const q = query.q
    const { product, nProducts } = await fetch(
      baseUrl(req, `api/mabo/${q}`),
    ).then((res) => res.json())

    return {
      n: parseInt(q, 10) + 1,
      nProducts,
      product,
    }
  } catch (e) {
    return {}
  }
}

export default Page3
