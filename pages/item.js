// npm
import fetch from "isomorphic-unfetch"
import Link from "next/link"

// self
import { ProductTeaser, Pager } from "../components"
import { baseUrl } from "../utils"

const Nothing = () => (
  <div>
    Nothing to see.{" "}
    <Link prefetch href="/">
      <a>Go home</a>
    </Link>
  </div>
)

const Page3 = ({ product, n, nProducts, prev, next }) => {
  if (!product) return <Nothing />
  return (
    <div>
      <h1>{product.microdata["@graph"][0].name}</h1>
      <h2>
        #{n} of {nProducts}
      </h2>
      <p>
        Hey there, looking for{" "}
        <Link prefetch href="/">
          <a>home</a>
        </Link>
        ?
      </p>
      <Pager n={n - 1} nProducts={nProducts} />
      <ProductTeaser product={product} />
      <pre>{JSON.stringify(product, null, "  ")}</pre>
    </div>
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